import Link from 'next/link';

export function Footer() {
  return (
    <footer 
      style={{
        maxWidth: '80rem',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px 40px',
        gap: '12px',
        borderTop: '1px solid rgba(204, 195, 216, 0.1)',
        background: 'transparent',
      }}
    >
      <Link href="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', lineHeight: '32px', fontWeight: 600, color: '#181445', opacity: 0.8, textDecoration: 'none', transition: 'opacity 0.2s' }}>
        Dreamola
      </Link>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: '20px', color: '#4a4455', textAlign: 'center' }}>
        © 2024 Dreamola AI. Ethereal Insights.
      </span>
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { href: '/privacy', label: 'Privacy' },
          { href: '/terms', label: 'Terms' },
          { href: '/refund', label: 'Refund' },
          { href: '/contact', label: 'Contact' },
        ].map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: '20px', color: '#4a4455', textDecoration: 'none', transition: 'color 0.2s' }}
            className="hover:!text-[#630ed4]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
