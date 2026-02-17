import ReconnectingEventSource from "reconnecting-eventsource";
import { derived, type Readable, readable } from "svelte/store";

export function es(
  path: string,
  hooks: {
    error?: (err: ErrorEvent) => void;
    open?: () => void;
  },
) {
  const ctx: { source?: ReconnectingEventSource; count: number } = { count: 0 };
  function connect() {
    if (ctx.source?.readyState === 1) return ctx.source;
    const source = new ReconnectingEventSource(path);
    if (hooks.error) source.onerror = hooks.error;
    if (hooks.error) source.onerror = hooks.error;
    ctx.source = source;
    return source;
  }
  return {
    close() {
      ctx.source?.close();
    },
    select(event: string) {
      const store = readable("", (update) => {
        const source = connect();
        const listener = (ev: MessageEvent<string>) => update(ev.data);
        source.addEventListener(event, listener);
        ctx.count++;
        return () => {
          source.removeEventListener(event, listener);
          ctx.count--;
          if (ctx.count === 0) source.close();
        };
      });
      return {
        ...store,
        json<T = unknown>(
          or: (previous: unknown) => unknown = function orFallback() {
            return null;
          },
        ): Readable<T> {
          // biome-ignore lint/suspicious/noExplicitAny: json.parse
          let previous: any = null;
          return derived(store, function convert(raw) {
            try {
              previous = JSON.parse(raw);
              return previous;
            } catch (e) {
              return or(previous);
            }
          });
        },
        transform<T = unknown>(transformer: (data: string) => T): Readable<T> {
          return derived(store, transformer);
        },
      };
    },
  };
}
