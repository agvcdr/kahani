'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.open('/api/menu/print-html', '_blank')}
      style={{
        background: '#C9A028',
        color: '#1E0808',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 20px',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      Print Menu
    </button>
  )
}
