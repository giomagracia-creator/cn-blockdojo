import Link from "next/link";

export function DojoNav() {
  return (
    <header className="topnav">
      <Link className="brand" href="/">Block Dojo</Link>
      <nav>
        <div>
          <span>Floor</span>
          <Link href="/">Home</Link>
          <Link href="/tv">TV</Link>
        </div>
        <div>
          <span>Ninjas</span>
          <Link href="/dojo">Sign in</Link>
          <Link href="/portal">Portal</Link>
        </div>
        <div>
          <span>Staff</span>
          <Link href="/staff">Gate</Link>
          <Link href="/sensei">Sensei</Link>
          <Link href="/director">Director</Link>
          <Link href="/director/import">Import</Link>
          <Link href="/director/pins">PIN sheet</Link>
        </div>
      </nav>
    </header>
  );
}
