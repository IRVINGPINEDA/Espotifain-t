export default function EmptyState({ title, description, action = null }) {
  return (
    <div className="glass-panel rounded-[2rem] p-8 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">Spotifyn´t</p>
      <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--copy-soft)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
