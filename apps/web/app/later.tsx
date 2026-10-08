export default function Later({ title, next }: { title: string; next: string }) {
  return <main><h1>{title}</h1><section className="card"><p>{next}</p></section></main>;
}
