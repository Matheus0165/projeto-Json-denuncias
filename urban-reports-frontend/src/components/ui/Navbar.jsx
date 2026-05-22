import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Logo = () => (
  <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
    <div style={{ width:32, height:32, background:'var(--brand)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="8"  cy="8"  r="3" fill="white" opacity=".9"/>
        <circle cx="16" cy="8"  r="3" fill="white" opacity=".7"/>
        <circle cx="12" cy="14" r="3" fill="white" opacity=".8"/>
        <circle cx="8"  cy="20" r="2" fill="white" opacity=".5"/>
        <circle cx="16" cy="20" r="2" fill="white" opacity=".5"/>
        <line x1="8" y1="8" x2="16" y2="8"  stroke="white" strokeWidth="1.2" opacity=".4"/>
        <line x1="8" y1="8" x2="12" y2="14" stroke="white" strokeWidth="1.2" opacity=".4"/>
        <line x1="16" y1="8" x2="12" y2="14" stroke="white" strokeWidth="1.2" opacity=".4"/>
      </svg>
    </div>
    <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--text)', letterSpacing:'-0.3px' }}>
      Vid<span style={{ color:'var(--brand)' }}>Eita</span>
    </span>
  </Link>
)

export default function Navbar() {
  const { user, logout }    = useAuth()
  const location            = useLocation()
  const navigate            = useNavigate()
  const [mopen, setMopen]   = useState(false)

  const handleLogout = () => { logout(); toast.success('Até logo!'); navigate('/') }
  const isHome = location.pathname === '/'

  return (
    <nav style={{
      position: isHome ? 'fixed' : 'sticky',
      top:0, left:0, right:0, zIndex:1000,
      background: isHome ? 'rgba(255,255,255,0.95)' : 'var(--bg2)',
      borderBottom:'1px solid var(--border)',
      backdropFilter:'blur(12px)',
      height:60,
      display:'flex', alignItems:'center', padding:'0 24px', gap:8,
    }}>
      <Logo />

      {/* Desktop links */}
      <div style={{ display:'flex', alignItems:'center', gap:2, marginLeft:24, flex:1 }}>
        {[
          { to:'/mapa',    label:'Mapa' },
          { to:'/#como-funciona', label:'Como funciona' },
          { to:'/#sobre',  label:'Sobre' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            padding:'6px 12px', borderRadius:7, fontSize:14, fontWeight:500,
            color: location.pathname === to ? 'var(--brand)' : 'var(--text2)',
            background: location.pathname === to ? 'var(--brand-dim)' : 'none',
            transition:'all .15s',
          }}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {user ? (
          <>
            <Link to="/minhas-Ocorrência" style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:500,
              color:'var(--brand)', border:'1px solid var(--brand-border)',
              background:'var(--brand-dim)', transition:'all .15s',
            }}>
              <LayoutDashboard size={14} /> Minhas Ocorrência
            </Link>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <User size={13} color="white" />
              </div>
              <span style={{ fontSize:13, color:'var(--text2)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.nome?.split(' ')[0]}</span>
            </div>
            <button onClick={handleLogout} style={{ background:'none', border:'1px solid var(--border)', color:'var(--text3)', borderRadius:8, padding:'7px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:13, transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='var(--danger)';e.currentTarget.style.borderColor='var(--danger)'}}
              onMouseLeave={e=>{e.currentTarget.style.color='var(--text3)';e.currentTarget.style.borderColor='var(--border)'}}>
              <LogOut size={13} /> Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/entrar" style={{ padding:'7px 16px', borderRadius:8, fontSize:14, fontWeight:500, color:'var(--brand)', border:'1px solid var(--brand-border)', transition:'all .15s' }}>
              Entrar
            </Link>
            <Link to="/nova-denuncia" style={{ padding:'7px 18px', borderRadius:8, fontSize:14, fontWeight:600, color:'white', background:'var(--brand)', transition:'all .15s' }}>
              Fazer denúncia
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
