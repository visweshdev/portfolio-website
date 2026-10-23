export default function Footer() {
  return (
    <footer className="relative pb-8 bg-bg" aria-label="Footer">
      {/* the chequered finish line — drifts slowly sideways (static under reduced motion) */}
      <div className="finish-line" aria-hidden="true" />
      <div className="page-pad pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label-mono">VISWESH KESARLA</p>
          <p className="label-mono">HYDERABAD, INDIA</p>
          <p className="label-mono">AI / SOFTWARE / PHOTOGRAPHY</p>
          <p className="label-mono">2026</p>
        </div>
        <p className="label-mono text-center mt-6 text-fg-subtle">SEE YOU ON THE NEXT LAP.</p>
      </div>
    </footer>
  );
}
