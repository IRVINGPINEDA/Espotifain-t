export default function SectionBlock({ eyebrow, title, description, children, action = null }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">{eyebrow}</p> : null}
          <h2 className="mt-2 text-2xl font-semibold text-[var(--copy)] md:text-3xl">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm text-[var(--copy-soft)]">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
