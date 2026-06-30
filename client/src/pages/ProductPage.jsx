// src/pages/ProductPage.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { journals, tshirts } from '../data/products'
import JournalCustomizer from '../components/JournalCustomizer'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function ProductImage({ product, size = 'main' }) {
  return (
    <div className={`pd-img-wrap pd-img-wrap--${size}`}>
      <img
        src={product.image}
        alt={product.name}
        className="pd-img"
        onError={e => {
          e.currentTarget.src =
            'https://images.unsplash.com/photo-1544816565-c7dd5cc1e3da?auto=format&fit=crop&w=600&q=70'
        }}
      />
    </div>
  )
}

function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const product =
    journals.find((p) => p.id === id) ||
    tshirts.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="store-shell product-not-found">
        <div className="empty-state">
          <p>Product not found</p>
          <button onClick={() => navigate('/shop')} className="btn btn--orange">
            Back to Shop
          </button>
        </div>
      </div>
    )
  }
  return <ProductDetailContent product={product} id={id} />
}

function ProductDetailContent({ product, id }) {
  const navigate = useNavigate()
  const isJournal = id.startsWith('journal')
  const productType = isJournal ? 'journal' : 'tshirt'
  const related = (isJournal ? journals : tshirts).filter((item) => item.id !== id)
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? null)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [quantity, setQuantity] = useState(1)

  function handleOrderReady(orderData) {
    navigate('/checkout', { state: { orderData } })
  }

  function handleTeeCheckout() {
    handleOrderReady({
      product,
      selectedColor,
      selectedSize,
      withPen: false,
      isCustomized: false,
      customType: null,
      customText: '',
      selectedFont: null,
      uploadedLogo: null,
      quantity,
      total: product.basePrice * quantity,
    })
  }

  return (
    <div className="pd-shell">
      <Navbar />

      <main className="pd-page">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <button onClick={() => navigate('/')}>Home</button>
          <span aria-hidden="true">›</span>
          <button onClick={() => navigate('/shop')}>Shop</button>
          <span aria-hidden="true">›</span>
          <span>{product.name}</span>
        </nav>

        <section className="pd-detail">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-gallery__main">
              <ProductImage product={product} size="main" />
            </div>
            <div className="pd-gallery__thumbs">
              {[product, product, product, product].map((p, i) => (
                <button key={i} className={i === 0 ? 'is-active' : ''} aria-label={`${product.name} view ${i + 1}`}>
                  <ProductImage product={p} size="thumb" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-info">
            <span className="eyebrow">{isJournal ? 'Custom journal' : 'Premium tee shirt'}</span>
            <h1>{product.name}</h1>
            <div className="rating-row">
              <span aria-label="5 out of 5 stars">★★★★★</span>
              <p>25k+ reviews</p>
            </div>
            <p className="product-description">{product.description}</p>
            <p className="product-price">₦{product.basePrice.toLocaleString('en-NG')}</p>

            <div className="option-block">
              <div className="option-heading">
                <strong>Colour</strong>
                <span>{product.colorNames[product.colors.indexOf(selectedColor)]}</span>
              </div>
              <div className="product-card__swatches product-card__swatches--large">
                {product.colors.map((color, i) => (
                  <button
                    key={color}
                    title={product.colorNames[i]}
                    onClick={() => setSelectedColor(color)}
                    className={`color-swatch ${selectedColor === color ? 'is-active' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={product.colorNames[i]}
                    aria-pressed={selectedColor === color}
                  />
                ))}
              </div>
            </div>

            {!isJournal && (
              <>
                <div className="option-block">
                  <div className="option-heading">
                    <strong>Size</strong>
                  </div>
                  <div className="size-grid">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={selectedSize === size ? 'is-active' : ''}
                        aria-pressed={selectedSize === size}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="purchase-row">
                  <div className="quantity-stepper" role="group" aria-label="Quantity">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                    <span aria-live="polite">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase">+</button>
                  </div>
                  <button onClick={handleTeeCheckout} className="btn btn--orange">
                    Order Now
                  </button>
                  <button onClick={handleTeeCheckout} className="btn btn--light">
                    Buy Now
                  </button>
                </div>
              </>
            )}

            <div className="spec-grid">
              {[
                ['Material',      isJournal ? 'Premium paper & durable cover' : '100% cotton, premium weight'],
                ['Delivery',      isJournal ? '2 business days' : '3 business days'],
                ['Customisation', isJournal ? 'Text, logo, or design support' : 'Size & colour selection'],
                ['Pickup',        'SUB Frontage, FUTA'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isJournal && (
          <section className="customizer-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Make it personal</span>
                <h2>Customise your journal</h2>
              </div>
              <p>Choose colour, add-ons, cover text, logo upload, quantity, and checkout.</p>
            </div>
            <JournalCustomizer product={product} onOrderReady={handleOrderReady} />
          </section>
        )}

        <section className="reviews-section">
          <div>
            <span className="eyebrow">Reviews</span>
            <h2>Loved for clean finishes and easy ordering.</h2>
          </div>
          <div className="review-grid">
            {[
              ['Amina', 'The journal looked premium and the checkout was straightforward.'],
              ['David', 'The tee quality feels solid. Delivery timing was clear too.'],
              ['Tolu',  'I liked seeing the journal preview before placing my order.'],
            ].map(([name, quote]) => (
              <article key={name}>
                <span aria-label="5 stars">★★★★★</span>
                <p>{quote}</p>
                <strong>{name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Related products</span>
              <h2>More from this collection</h2>
            </div>
          </div>
          <div className="product-grid product-grid--compact">
            {related.map((item) => (
              <article key={item.id} className="premium-card related-card">
                <div className="related-card__img">
                  <ProductImage product={item} size="thumb" />
                </div>
                <div>
                  <h3>{item.name}</h3>
                  <p>₦{item.basePrice.toLocaleString('en-NG')}</p>
                </div>
                <button onClick={() => navigate(`/product/${item.id}`)} className="btn btn--light">
                  View
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProductPage
