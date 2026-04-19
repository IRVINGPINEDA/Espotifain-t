export default function Loader({ label = 'Loading' }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--copy-soft)]">
      <span className="size-3 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
