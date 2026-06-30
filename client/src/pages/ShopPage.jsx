// src/pages/ShopPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { journals, tshirts } from '../data/products'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

// ── Filter sidebar icons ──
function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}
function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}
function IconStar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
]

const ALL_PRODUCTS = [
  ...journals.map(p => ({ ...p, _type: 'journal' })),
  ...tshirts.map(p => ({ ...p, _type: 'tshirt' })),
]

function ShopPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialTab = searchParams.get('tab') || 'all'
  const [activeTab,  setActiveTab]  = useState(initialTab)
  const [sortBy,     setSortBy]     = useState('featured')
  const [viewMode,   setViewMode]   = useState('grid')    // 'grid' | 'list'
  const [priceMax,   setPriceMax]   = useState(10000)

  // Sync tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  // Filter & sort
  let filtered = ALL_PRODUCTS.filter(p => {
    if (activeTab === 'journals') return p._type === 'journal'
    if (activeTab === 'tshirts')  return p._type === 'tshirt'
    return true
  }).filter(p => p.basePrice <= priceMax)

  if (sortBy === 'price-asc')  filtered = [...filtered].sort((a, b) => a.basePrice - b.basePrice)
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.basePrice - a.basePrice)
  if (sortBy === 'name-asc')   filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))

  const totalCount = filtered.length

  return (
    <div className="shop-shell">
      <Navbar activeTab={activeTab === 'all' ? null : activeTab} onTabChange={setActiveTab} />

      {/* ── Breadcrumb ── */}
      <div className="shop-breadcrumb">
        <button onClick={() => navigate('/')}>Home</button>
        <IconChevronRight />
        <span>{activeTab === 'all' ? 'All Products' : activeTab === 'journals' ? 'Journals' : 'Tee Shirts'}</span>
      </div>

      {/* ── Shop banner ── */}
      <div className="shop-banner">
        <div className="shop-banner__copy">
          <h1>
            {activeTab === 'journals' ? 'Journals' : activeTab === 'tshirts' ? 'Tee Shirts' : 'All Products'}
          </h1>
          <p>
            {activeTab === 'journals'
              ? 'Premium, customisable journals for every writer.'
              : activeTab === 'tshirts'
              ? 'Classic cuts in quality cotton — everyday staples.'
              : 'Journals, tee shirts, and custom designs, all in one place.'}
          </p>
        </div>
        <div className="shop-banner__tabs" role="tablist">
          {[
            { id: 'all',      label: 'All Products', count: ALL_PRODUCTS.length },
            { id: 'journals', label: 'Journals',     count: journals.length },
            { id: 'tshirts',  label: 'Tee Shirts',   count: tshirts.length },
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`shop-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="shop-tab__count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content: sidebar + grid ── */}
      <div className="shop-layout">

        {/* Sidebar */}
        <aside className="shop-sidebar" aria-label="Filter products">
          <div className="shop-sidebar__section">
            <h3>
              <IconFilter /> Filters
            </h3>
          </div>

          {/* Category */}
          <div className="shop-sidebar__section">
            <h4>Category</h4>
            <ul className="shop-sidebar__list">
              {[
                { id: 'all',      label: 'All Products', count: ALL_PRODUCTS.length },
                { id: 'journals', label: 'Journals',     count: journals.length },
                { id: 'tshirts',  label: 'Tee Shirts',   count: tshirts.length },
              ].map(cat => (
                <li key={cat.id}>
                  <button
                    className={activeTab === cat.id ? 'is-active' : ''}
                    onClick={() => setActiveTab(cat.id)}
                  >
                    <span>{cat.label}</span>
                    <span className="shop-sidebar__count">{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price range */}
          <div className="shop-sidebar__section">
            <h4>Max price</h4>
            <div className="shop-sidebar__price">
              <input
                type="range"
                min={2000}
                max={10000}
                step={500}
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                className="shop-price-slider"
                aria-label="Maximum price filter"
              />
              <div className="shop-sidebar__price-labels">
                <span>₦2,000</span>
                <span className="shop-sidebar__price-val">₦{priceMax.toLocaleString('en-NG')}</span>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="shop-sidebar__section">
            <h4>Customer rating</h4>
            <ul className="shop-sidebar__list shop-sidebar__list--ratings">
              {[5, 4, 3].map(r => (
                <li key={r}>
                  <button className="shop-sidebar__rating">
                    {Array.from({ length: r }, (_, i) => (
                      <IconStar key={i} />
                    ))}
                    <span>& up</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Perks */}
          <div className="shop-sidebar__section shop-sidebar__perks">
            {[
              { icon: '🚚', text: 'Free FUTA pickup' },
              { icon: '🎨', text: 'Fully customisable' },
              { icon: '⚡', text: 'Urgent options' },
            ].map(({ icon, text }) => (
              <div key={text} className="shop-perk">
                <span>{icon}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Product area */}
        <div className="shop-main">

          {/* Toolbar */}
          <div className="shop-toolbar">
            <p className="shop-toolbar__count">
              <strong>{totalCount}</strong> product{totalCount !== 1 ? 's' : ''} found
            </p>
            <div className="shop-toolbar__right">
              <div className="shop-sort">
                <label htmlFor="sort-select" className="sr-only">Sort by</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="shop-sort__select"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="shop-view-toggle" role="group" aria-label="View mode">
                <button
                  aria-pressed={viewMode === 'grid'}
                  className={viewMode === 'grid' ? 'is-active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <IconGrid />
                </button>
                <button
                  aria-pressed={viewMode === 'list'}
                  className={viewMode === 'list' ? 'is-active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <IconList />
                </button>
              </div>
            </div>
          </div>

          {/* Product grid / list */}
          {filtered.length === 0 ? (
            <div className="shop-empty">
              <span>🔍</span>
              <p>No products match your filters.</p>
              <button className="btn btn--orange" onClick={() => { setActiveTab('all'); setPriceMax(10000) }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'shop-grid' : 'shop-list'}>
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  type={product._type}
                  variant={viewMode === 'list' ? 'list' : 'grid'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ShopPage
