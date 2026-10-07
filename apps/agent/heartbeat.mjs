const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ninjaId = process.argv[2];
const device = process.argv[3] ?? "pilot-pc";
const buckets = Number(process.argv[4] ?? 4);

if (!url || !key || !ninjaId) {
  console.log("Usage: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node heartbeat.mjs <ninja-id> [device] [active-buckets]");
  process.exit(1);
}

const response = await fetch(`${url}/rest/v1/rpc/record_minute`, {
  method: "POST",
  headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" },
  body: JSON.stringify({ target: ninjaId, device_name: device, active_buckets: buckets }),
});
console.log(response.status, await response.text());
