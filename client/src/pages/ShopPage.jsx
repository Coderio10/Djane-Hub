// src/pages/ShopPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { journals, tshirts } from '../data/products'

function ProductVisual({ type, product, size = 'card' }) {
  return (
    <div className={`product-visual product-visual--${type} product-visual--${size}`}>
      <div className="product-visual__glow" />
      <div className="product-visual__object">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-visual__image"
          />
        ) : (
          <span>{type === 'journal' ? '📓' : '👕'}</span>
        )}
      </div>
      <div className="product-visual__label">{product.name}</div>
    </div>
  )
}

function ProductCard({ product, type }) {
  const navigate = useNavigate()
  const formatPrice = (amount) => `₦${amount.toLocaleString('en-NG')}`

  return (
    <article className="premium-card product-card group">
      <button
        type="button"
        onClick={() => navigate(`/product/${product.id}`)}
        className="product-card__media"
        aria-label={`View ${product.name}`}
      >
        <ProductVisual type={type} product={product} />
      </button>

      <div className="product-card__body">
        <div>
          <p className="eyebrow">{type === 'journal' ? 'Journal' : 'Tee shirt'}</p>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>

        <div className="product-card__swatches">
          {product.colors.map((color, i) => (
            <span
              key={color}
              title={product.colorNames[i]}
              className="color-swatch"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="product-card__footer">
          <span>{formatPrice(product.basePrice)}</span>
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="btn btn--dark"
          >
            Order Now
          </button>
        </div>

        {type === 'journal' && (
          <span className="badge badge--orange">Customisable</span>
        )}
      </div>
    </article>
  )
}

function ShopPage() {
  const [activeTab, setActiveTab] = useState('journals')
  const navigate = useNavigate()

  const products = activeTab === 'journals' ? journals : tshirts
  const type = activeTab === 'journals' ? 'journal' : 'tshirt'
  const featured = journals[1] ?? journals[0]

  return (
    <div className="store-shell">
      <header className="site-nav">
        <button onClick={() => navigate('/shop')} className="brand-mark">
          <span>DH</span>
          <strong>Djane's Hub</strong>
        </button>
        <nav aria-label="Store navigation">
          <button onClick={() => navigate('/shop')}>Shop</button>
          <button onClick={() => setActiveTab('journals')}>Journals</button>
          <button onClick={() => setActiveTab('tshirts')}>Tee Shirts</button>
          {/* <button onClick={() => navigate('/admin')}>Admin</button> */}
        </nav>
        <button onClick={() => navigate('/checkout')} className="nav-action">
          Checkout
        </button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Custom stationery and apparel</span>
            <h1>Premium everyday pieces, personalised for you.</h1>
            <p>
              Journals, tee shirts, and custom designs made with clean finishes,
              thoughtful details, and a simple checkout flow.
            </p>
            <div className="hero-actions">
              <button onClick={() => setActiveTab('journals')} className="btn btn--orange">
                Shop Journals
              </button>
              <button onClick={() => setActiveTab('tshirts')} className="btn btn--light">
                Explore Tees
              </button>
            </div>
          </div>

          <div className="hero-showcase">
            <div className="hero-showcase__main">
              <ProductVisual type="journal" product={featured} size="hero" />
            </div>
            <div className="hero-showcase__meta">
              <span>From ₦{featured.basePrice.toLocaleString('en-NG')}</span>
              <strong>{featured.name}</strong>
              <p>{featured.description}</p>
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Featured products</span>
              <h2>Shop by collection</h2>
            </div>
            <div className="segmented-control" role="tablist" aria-label="Product category">
              <button
                role="tab"
                aria-selected={activeTab === 'journals'}
                onClick={() => setActiveTab('journals')}
                className={activeTab === 'journals' ? 'is-active' : ''}
              >
                Journals
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'tshirts'}
                onClick={() => setActiveTab('tshirts')}
                className={activeTab === 'tshirts' ? 'is-active' : ''}
              >
                Tee Shirts
              </button>
            </div>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                type={type}
              />
            ))}
          </div>
        </section>

        <section className="category-grid">
          {[
            ['Custom journals', 'Add names, text, logos, and matching pens.', 'journal'],
            ['Premium tees', 'Clean wardrobe staples in practical colours.', 'tshirt'],
            ['Delivery support', 'FUTA pickup, outside delivery, and urgent options.', 'delivery'],
          ].map(([title, copy, variant]) => (
            <div key={title} className={`category-tile category-tile--${variant}`}>
              <span>{variant === 'journal' ? '01' : variant === 'tshirt' ? '02' : '03'}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </section>

        <section className="service-strip">
          <h2>Experience streamlined shopping with Djane's Hub</h2>
          <div>
            {[
              ['Free FUTA Delivery', 'Pickup at SUB Frontage is included.'],
              ['Custom Design Help', 'Text, logos, or a WhatsApp design route.'],
              ['Clear Checkout', 'Review totals, delivery, and transfer details.'],
            ].map(([title, copy]) => (
              <article key={title}>
                <span />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <strong>Djane's Hub</strong>
        <p>Journals, tee shirts, and custom designs made for you.</p>
      </footer>
    </div>
  )
}

export default ShopPage
