import { PUBLIC_KIOSK_SECRET } from "$env/static/public";

const enc = new TextEncoder();
let cryptoKey: CryptoKey | null = null;

async function getKey() {
  if (!cryptoKey) {
    cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(PUBLIC_KIOSK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return cryptoKey;
}

export async function hashText(str: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(str));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
