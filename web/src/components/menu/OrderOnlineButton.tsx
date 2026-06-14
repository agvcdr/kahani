/**
 * Links to the single global `settings.onlineOrderingUrl` (the site has no
 * in-house cart). Hidden when no URL is configured or the dish is sold out.
 */
export function OrderOnlineButton({ url, soldOut }: { url?: string | null; soldOut?: boolean }) {
  if (!url || soldOut) return null
  return (
    <a className="btn btn--solid order-online-btn" href={url} target="_blank" rel="noopener noreferrer">
      Order Online
    </a>
  )
}
