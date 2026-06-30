// src/components/Navbar.jsx
import { useNavigate, useLocation } from 'react-router-dom'

// SVG icon components — inline for zero dependencies
export function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

export function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

/**
 * Shared site navbar.
 * Props:
 *   activeTab  — 'journals' | 'tshirts' | null   (for the shop page highlight)
 *   onTabChange — fn(tab)                         (called when a tab link is clicked)
 */
function Navbar({ activeTab = null, onTabChange = null }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isShop   = location.pathname === '/shop'

  function goShop(tab) {
    if (onTabChange && isShop) {
      onTabChange(tab)
    } else {
      navigate(tab ? `/shop?tab=${tab}` : '/shop')
    }
  }

  return (
    <header className="site-header">
      {/* Brand */}
      <button className="brand-mark" onClick={() => navigate('/')} aria-label="Home">
        <span aria-hidden="true">DJ</span>
        <strong>Djane's Hub</strong>
      </button>

      {/* Centre nav */}
      <nav className="site-header__nav" aria-label="Main navigation">
        <button
          onClick={() => navigate('/shop')}
          className={isShop && !activeTab ? 'is-active' : ''}
        >
          Shop
        </button>
        <button
          onClick={() => goShop('journals')}
          className={activeTab === 'journals' ? 'is-active' : ''}
        >
          Journals
        </button>
        <button
          onClick={() => goShop('tshirts')}
          className={activeTab === 'tshirts' ? 'is-active' : ''}
        >
          Tee Shirts
        </button>
      </nav>

      {/* Right actions */}
      <div className="site-header__actions">
        <button
          className="btn btn--orange site-header__cart"
          onClick={() => navigate('/checkout')}
          aria-label="Checkout"
        >
          <IconCart />
          <span>Checkout</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
