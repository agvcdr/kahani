export function SpiceIndicator({ level }: { level: number }) {
  if (!level) return null
  const clamped = Math.min(5, Math.max(0, level))
  return (
    <span className="spice-indicator" title={`Spice level ${clamped}/5`} aria-label={`Spice level ${clamped} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < clamped ? 'spice-dot spice-dot--on' : 'spice-dot'} aria-hidden="true">●</span>
      ))}
    </span>
  )
}
