export function DojoNav() {
  return (
    <header className="topnav">
      <a className="brand" href="/">Block Dojo</a>
      <nav>
        <div>
          <span>Floor</span>
          <a href="/">Home</a>
          <a href="/tv">TV</a>
        </div>
        <div>
          <span>Ninjas</span>
          <a href="/dojo">Sign in</a>
          <a href="/portal">Portal</a>
        </div>
        <div>
          <span>Staff</span>
          <a href="/staff">Gate</a>
          <a href="/sensei">Sensei</a>
          <a href="/director">Director</a>
          <a href="/director/import">Import</a>
          <a href="/director/pins">PIN sheet</a>
        </div>
      </nav>
    </header>
  );
}
