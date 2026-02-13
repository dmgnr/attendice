import type { RedisClient } from "bun";
import { produce } from "sveltekit-sse";
import z from "zod";

const redis = Bun.redis;
var sub: RedisClient | null = null;
const prefix = "sse:";

const PayloadSingle = z.object({
  event: z.string().optional(),
  data: z.string(),
});

const Payload = z.array(PayloadSingle).or(PayloadSingle);

type SseFn = {
  (channel: string, motd?: z.infer<typeof Payload>): Response;
  publish(channel: string, data: z.infer<typeof Payload>): Promise<void>;
};

const sse: SseFn = (channel, motd) => {
  return produce(async function start({ emit }) {
    const subber: RedisClient = sub ?? (await redis.duplicate());
    function emitEntries(data: z.infer<typeof Payload>) {
      const parsed = Payload.parse(data);
      for (const entry of Array.isArray(parsed) ? parsed : [parsed]) {
        const { event, data } = entry;
        const { error } = emit(event || "message", data);
        if (error) stop();
      }
    }
    function listener(raw: string) {
      emitEntries(JSON.parse(raw));
    }
    if (motd) emitEntries(motd);
    console.log(`SUB ${channel}`);
    subber.subscribe(`${prefix}${channel}`, listener);
    return function stop() {
      console.log(`DSC ${channel}`);
      subber.unsubscribe(`${prefix}${channel}`, listener).catch(() => {});
    };
  });
};

sse.publish = async (channel, data) => {
  console.log(`PUB ${channel}`);
  redis.publish(`${prefix}${channel}`, JSON.stringify(Payload.parse(data)));
};

export { sse, redis };
