// src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom'
import { journals, tshirts } from '../data/products'

// Hero images — high quality editorial shots
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1544816565-c7dd5cc1e3da?auto=format&fit=crop&w=1400&q=85'

const CATEGORY_IMAGES = {
  journals:
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80',
  tshirts:
    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80',
  custom:
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80',
}

function ProductCard({ product, type }) {
  const navigate = useNavigate()
  return (
    <article className="lp-product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="lp-product-card__img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="lp-product-card__img"
          loading="lazy"
        />
        {type === 'journal' && (
          <span className="lp-product-card__badge">Customisable</span>
        )}
      </div>
      <div className="lp-product-card__body">
        <p className="lp-product-card__type">{type === 'journal' ? 'Journal' : 'Tee Shirt'}</p>
        <h3 className="lp-product-card__name">{product.name}</h3>
        <p className="lp-product-card__desc">{product.description}</p>
        <div className="lp-product-card__footer">
          <span className="lp-product-card__price">
            ₦{product.basePrice.toLocaleString('en-NG')}
          </span>
          <button
            className="btn btn--dark"
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`) }}
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const featuredJournal = journals[1]
  const featuredTee     = tshirts[0]

  return (
    <div className="lp-shell">

      {/* ── Nav ── */}
      <header className="lp-nav">
        <button className="brand-mark" onClick={() => navigate('/')}>
          <span>DH</span>
          <strong>Djane's Hub</strong>
        </button>
        <nav aria-label="Site navigation">
          <button onClick={() => navigate('/shop')}>Shop</button>
          <button onClick={() => navigate('/shop?tab=journals')}>Journals</button>
          <button onClick={() => navigate('/shop?tab=tshirts')}>Tee Shirts</button>
        </nav>
        <button className="btn btn--orange lp-nav__cta" onClick={() => navigate('/shop')}>
          Shop Now
        </button>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="lp-hero">
          <div className="lp-hero__copy">
            <span className="eyebrow">Custom stationery &amp; apparel</span>
            <h1>Premium pieces, personalised for you.</h1>
            <p>
              Journals, tee shirts, and custom designs crafted with clean
              finishes and thoughtful detail — delivered right to you.
            </p>
            <div className="hero-actions">
              <button className="btn btn--orange" onClick={() => navigate('/shop')}>
                Shop Now
              </button>
              <button className="btn btn--light" onClick={() => navigate('/shop?tab=journals')}>
                Explore Journals
              </button>
            </div>
          </div>
          <div className="lp-hero__img-wrap">
            <img
              src={HERO_IMAGE}
              alt="Open journal on a clean desk with a pen"
              className="lp-hero__img"
            />
            <div className="lp-hero__pill">
              <span>✦</span> Free FUTA pickup
            </div>
          </div>
        </section>

        {/* ── Category cards ── */}
        <section className="lp-section">
          <div className="lp-section__head">
            <span className="eyebrow">Browse by category</span>
            <h2>Everything we make</h2>
          </div>
          <div className="lp-category-grid">
            {[
              {
                key: 'journals',
                label: 'Journals',
                sub: 'Classic, premium, and pocket sizes',
                img: CATEGORY_IMAGES.journals,
                cta: 'Shop Journals',
                tab: 'journals',
              },
              {
                key: 'tshirts',
                label: 'Tee Shirts',
                sub: 'Classic, oversized, and polo fits',
                img: CATEGORY_IMAGES.tshirts,
                cta: 'Shop Tees',
                tab: 'tshirts',
              },
              {
                key: 'custom',
                label: 'Custom Designs',
                sub: 'Add names, logos, or your own artwork',
                img: CATEGORY_IMAGES.custom,
                cta: 'Customise Now',
                tab: 'journals',
              },
            ].map(({ key, label, sub, img, cta, tab }) => (
              <button
                key={key}
                className="lp-cat-card"
                onClick={() => navigate(`/shop?tab=${tab}`)}
                aria-label={`Browse ${label}`}
              >
                <div className="lp-cat-card__img-wrap">
                  <img src={img} alt={label} className="lp-cat-card__img" loading="lazy" />
                </div>
                <div className="lp-cat-card__body">
                  <h3>{label}</h3>
                  <p>{sub}</p>
                  <span className="lp-cat-card__link">{cta} →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Featured products ── */}
        <section className="lp-section">
          <div className="lp-section__head">
            <span className="eyebrow">Best sellers</span>
            <h2>Customer favourites</h2>
          </div>
          <div className="lp-featured-grid">
            {[...journals, ...tshirts].slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                type={journals.includes(p) ? 'journal' : 'tshirt'}
              />
            ))}
          </div>
          <div className="lp-view-all">
            <button className="btn btn--light" onClick={() => navigate('/shop')}>
              View All Products
            </button>
          </div>
        </section>

        {/* ── Split feature banner ── */}
        <section className="lp-banner">
          <div className="lp-banner__img-wrap">
            <img
              src={featuredJournal.image}
              alt={featuredJournal.name}
              className="lp-banner__img"
              loading="lazy"
            />
          </div>
          <div className="lp-banner__copy">
            <span className="eyebrow">Handpicked for you</span>
            <h2>{featuredJournal.name}</h2>
            <p>{featuredJournal.description}</p>
            <p className="lp-banner__price">
              From ₦{featuredJournal.basePrice.toLocaleString('en-NG')}
            </p>
            <button
              className="btn btn--orange"
              onClick={() => navigate(`/product/${featuredJournal.id}`)}
            >
              Order This Journal
            </button>
          </div>
        </section>

        {/* ── Tee feature banner (reversed) ── */}
        <section className="lp-banner lp-banner--reverse">
          <div className="lp-banner__img-wrap">
            <img
              src={featuredTee.image}
              alt={featuredTee.name}
              className="lp-banner__img"
              loading="lazy"
            />
          </div>
          <div className="lp-banner__copy">
            <span className="eyebrow">Fresh styles</span>
            <h2>{featuredTee.name}</h2>
            <p>{featuredTee.description}</p>
            <p className="lp-banner__price">
              From ₦{featuredTee.basePrice.toLocaleString('en-NG')}
            </p>
            <button
              className="btn btn--dark"
              onClick={() => navigate(`/product/${featuredTee.id}`)}
            >
              Shop This Tee
            </button>
          </div>
        </section>

        {/* ── Perks strip ── */}
        <section className="lp-perks">
          {[
            { icon: '🚚', title: 'Free FUTA Pickup', body: 'SUB Frontage delivery included with every order.' },
            { icon: '🎨', title: 'Custom Designs', body: 'Add names, text, or logos. WhatsApp design route available.' },
            { icon: '📦', title: 'Urgent Options', body: 'Need it fast? Urgent processing available at checkout.' },
            { icon: '💳', title: 'Simple Checkout', body: 'Clear totals, bank transfer confirmation — no surprises.' },
          ].map(({ icon, title, body }) => (
            <div key={title} className="lp-perk">
              <span className="lp-perk__icon">{icon}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer__brand">
          <strong>Djane's Hub</strong>
          <p>Journals, tee shirts, and custom designs made for you.</p>
        </div>
        <nav className="lp-footer__links" aria-label="Footer navigation">
          <button onClick={() => navigate('/shop')}>Shop</button>
          <button onClick={() => navigate('/shop?tab=journals')}>Journals</button>
          <button onClick={() => navigate('/shop?tab=tshirts')}>Tee Shirts</button>
          <button onClick={() => navigate('/checkout')}>Checkout</button>
        </nav>
        <p className="lp-footer__copy">© 2025 Djane's Hub · Made with ❤️ in Nigeria</p>
      </footer>

    </div>
  )
}

export default LandingPage
