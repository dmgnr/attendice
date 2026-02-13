FROM oven/bun AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun i --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun AS runner
WORKDIR /app

COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/package.json .
COPY --from=builder /app/drizzle drizzle/
COPY --from=builder /app/build build/

RUN bun -e "const id = Bun.randomUUIDv7(); Bun.write('.version', id); Bun.write('.env.local', 'DEPLOYMENT_ID='+id)"

EXPOSE 3000

CMD bun build/index.js
