export default function ComingSoon() {
  return (
    <div style={{minHeight:'100vh',background:'#0d2818',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:'600px',textAlign:'center',width:'100%'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#1a4a2e',padding:'6px 12px',borderRadius:'6px',marginBottom:'30px'}}>
          <span style={{fontWeight:'bold'}}>SMG</span>
          <span>SwingMarket</span>
          <span style={{color:'#c9a84c'}}>Golf</span>
        </div>

        <div style={{color:'#c9a84c',fontSize:'13px',letterSpacing:'3px',marginBottom:'30px',fontWeight:'600'}}>BIENTÔT · 2026</div>

        <h1 style={{fontSize:'clamp(36px,6vw,56px)',fontWeight:'900',marginBottom:'24px',lineHeight:'1.1'}}>
          Quelque chose arrive pour <em style={{color:'#c9a84c'}}>les golfeurs.</em>
        </h1>

        <p style={{color:'#a0a0a0',fontSize:'17px',marginBottom:'40px',lineHeight:'1.6'}}>
          Un projet né d'une passion, pensé par et pour la communauté.
        </p>

        <p style={{color:'#fff',fontSize:'18px',marginBottom:'30px',fontWeight:'600'}}>
          Rejoignez-nous pour être informé
        </p>

        <div style={{display:'flex',gap:'15px',flexWrap:'wrap',justifyContent:'center',marginBottom:'60px'}}>
          <a href="https://www.instagram.com/swing_marketgolf/" target="_blank" rel="noopener noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:'10px',padding:'15px 30px',fontSize:'16px',background:'#c9a84c',color:'#0d2818',border:'none',borderRadius:'8px',fontWeight:'bold',textDecoration:'none'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Instagram
          </a>
          <a href="https://www.facebook.com/swingmarketgolf" target="_blank" rel="noopener noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:'10px',padding:'15px 30px',fontSize:'16px',background:'transparent',color:'#fff',border:'1px solid #c9a84c',borderRadius:'8px',fontWeight:'bold',textDecoration:'none'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
        </div>

        <p style={{color:'#666',fontSize:'13px',fontStyle:'italic'}}>— Restez branché.</p>
      </div>
    </div>
  );
}
