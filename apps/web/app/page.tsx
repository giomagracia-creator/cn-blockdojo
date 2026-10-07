import { APP_NAME, LOCATION_NAME, PHASE } from "@cn/shared";

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
      detail: "The dojo cannot see the database yet.",
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
        detail: "The dojo tried the database and did not get through.",
      };
    }
    return {
      app: APP_NAME,
      phase: PHASE,
      database: "reachable",
      detail: "The dojo can reach the database. No Ninja data was read.",
    };
  } catch {
    return {
      app: APP_NAME,
      phase: PHASE,
      database: "unreachable",
      detail: "The dojo could not reach the database.",
    };
  }
}

export default async function HomePage() {
  const health = await loadHealth();
  const ready = health.database === "reachable";
  return (
    <main>
      <img className="logo" src="/code-ninjas-logo.jpg" alt="Code Ninjas" />
      <p className="mark">CENTRAL EDMONTON</p>
      <h1>{APP_NAME}</h1>
      <p className="lede">
        A blocky belt journey for {LOCATION_NAME}. Phase {PHASE} is the foundation: belts, staff roles, roster import, and Ninja PIN sign-in.
      </p>
      <section className="card">
        <div className="status">
          <span>Dojo</span>
          <span className="ok">Live</span>
        </div>
        <div className="status">
          <span>Database</span>
          <span className={ready ? "ok" : "wait"}>{ready ? "Reachable" : "Waiting"}</span>
        </div>
        <p>{health.detail}</p>
      </section>
      <section className="card">
        <h2>Phase 1 gates</h2>
        <p><a href="/dojo">Ninja sign-in</a> · <a href="/staff">Sensei and Director</a></p>
        <p>Demo Ninja Pixel D. uses PIN 2468 until you import the real roster.</p>
      </section>
    </main>
  );
}
