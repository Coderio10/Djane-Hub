// src/components/ProductCard.jsx
// Shared product card used by ShopPage and LandingPage
import { useNavigate } from 'react-router-dom'

// Star rating icon
function Stars({ count = 5 }) {
  return (
    <span className="pc-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i < count ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

/**
 * Props:
 *   product  — product object from products.js
 *   type     — 'journal' | 'tshirt'
 *   variant  — 'grid' (default) | 'list'
 */
function ProductCard({ product, type, variant = 'grid' }) {
  const navigate = useNavigate()

  function go(e) {
    e?.stopPropagation()
    navigate(`/product/${product.id}`)
  }

  return (
    <article
      className={`pc pc--${variant}`}
      onClick={go}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && go()}
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className="pc__img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="pc__img"
          loading="lazy"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1544816565-c7dd5cc1e3da?auto=format&fit=crop&w=600&q=70'
          }}
        />
        {type === 'journal' && (
          <span className="pc__badge pc__badge--custom">Customisable</span>
        )}
        {product.isNew && (
          <span className="pc__badge pc__badge--new">New</span>
        )}
      </div>

      {/* Body */}
      <div className="pc__body">
        <p className="pc__category">{type === 'journal' ? 'Journal' : 'Tee Shirt'}</p>
        <h3 className="pc__name">{product.name}</h3>

        <div className="pc__rating">
          <Stars count={5} />
          <span className="pc__review-count">(128)</span>
        </div>

        <p className="pc__desc">{product.description}</p>

        {/* Color swatches */}
        <div className="pc__swatches" aria-label="Available colours">
          {product.colors.slice(0, 5).map((color, i) => (
            <span
              key={color}
              className="pc__swatch"
              style={{ backgroundColor: color }}
              title={product.colorNames[i]}
              aria-label={product.colorNames[i]}
            />
          ))}
          {product.colors.length > 5 && (
            <span className="pc__swatch-more">+{product.colors.length - 5}</span>
          )}
        </div>

        <div className="pc__footer">
          <div className="pc__pricing">
            <span className="pc__price">₦{product.basePrice.toLocaleString('en-NG')}</span>
            {type === 'journal' && (
              <span className="pc__free-delivery">
                {/* Delivery icon */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Free FUTA pickup
              </span>
            )}
          </div>
          <button
            className="btn btn--dark pc__cta"
            onClick={go}
            aria-label={`Order ${product.name}`}
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
