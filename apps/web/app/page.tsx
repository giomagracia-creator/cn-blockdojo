import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <img className="logo" src="/code-ninjas-logo.jpg" alt="Code Ninjas" />
      <p className="mark">CENTRAL EDMONTON</p>
      <h1>Who is playing?</h1>
      <section className="call-grid">
        <Link className="card go" href="/ninja/sign-in">Ninja</Link>
        <Link className="card" href="/staff/sign-in">Sensei / Staff</Link>
        <Link className="card" href="/parent">Parent</Link>
      </section>
    </main>
  );
}
