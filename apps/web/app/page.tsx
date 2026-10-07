import { APP_NAME, PHASE } from "@cn/shared";

type Health = {
  app: string;
  phase: number;
  database: "reachable" | "not_configured" | "unreachable";
  detail: string;
};

async function loadHealth(): Promise<Health> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      app: APP_NAME,
      phase: PHASE,
      database: "not_configured",
      detail: "Add the Supabase URL and anon key in Vercel, then reload.",
    };
  }
  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        app: APP_NAME,
        phase: PHASE,
        database: "unreachable",
        detail: `Supabase answered ${response.status}. Check the URL, key, and that the project is not paused.`,
      };
    }
    return {
      app: APP_NAME,
      phase: PHASE,
      database: "reachable",
      detail: "The web app can reach the database. No Ninja data was read.",
    };
  } catch {
    return {
      app: APP_NAME,
      phase: PHASE,
      database: "unreachable",
      detail: "The web app could not reach Supabase.",
    };
  }
}

export default async function HomePage() {
  const health = await loadHealth();
  const ready = health.database === "reachable";
  return (
    <main>
      <p className="mark">CODE NINJAS</p>
      <h1>{APP_NAME}</h1>
      <p className="lede">
        Phase {PHASE} is up. This page only proves the site loads and, once you add the database keys, that the dojo app can reach Supabase. Portals, coins, and the TV scene wait for the next phase.
      </p>
      <section className="card">
        <div className="status">
          <span>Web app</span>
          <span className="ok">Live</span>
        </div>
        <div className="status">
          <span>Database</span>
          <span className={ready ? "ok" : "wait"}>{ready ? "Reachable" : "Waiting on keys"}</span>
        </div>
        <p>{health.detail}</p>
      </section>
      <section className="card">
        <h2>Still to do before Phase 1</h2>
        <ol>
          <li>Create the free Supabase project and pick a Canadian region if it is offered.</li>
          <li>Paste the URL and anon key into Vercel environment variables. Never paste them into chat.</li>
          <li>Run the Phase 0 SQL migration in the Supabase SQL editor.</li>
          <li>Reload this page. Database should say Reachable.</li>
        </ol>
      </section>
    </main>
  );
}
