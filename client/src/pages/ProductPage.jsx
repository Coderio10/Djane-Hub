// src/pages/ProductPage.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { journals, tshirts } from '../data/products'
import JournalCustomizer from '../components/JournalCustomizer'

function ProductVisual({ type, product, size = 'detail' }) {
  return (
    <div className={`product-visual product-visual--${type} product-visual--${size}`}>
      <div className="product-visual__glow" />
      <div className="product-visual__object">
        <span>{type === 'journal' ? '📓' : '👕'}</span>
      </div>
      <div className="product-visual__label">{product.name}</div>
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
    navigate('/checkout', {
      state: { orderData }
    })
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
    <div className="store-shell product-page">
      <header className="site-nav">
        <button onClick={() => navigate('/shop')} className="brand-mark">
          <span>DH</span>
          <strong>Djane's Hub</strong>
        </button>
        <nav aria-label="Store navigation">
          <button onClick={() => navigate('/shop')}>Shop</button>
          <button onClick={() => navigate('/shop')}>Journals</button>
          <button onClick={() => navigate('/shop')}>Tee Shirts</button>
        </nav>
        <button onClick={() => navigate(-1)} className="nav-action">
          Back
        </button>
      </header>

      <main>
        <button onClick={() => navigate('/shop')} className="back-link">
          ← Back to Shop
        </button>

        <section className="product-detail">
          <div className="product-gallery">
            <div className="product-gallery__main">
              <ProductVisual type={productType} product={product} />
            </div>
            <div className="product-gallery__thumbs">
              {[0, 1, 2, 3].map((item) => (
                <button key={item} aria-label={`${product.name} preview ${item + 1}`}>
                  <ProductVisual type={productType} product={product} size="thumb" />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info">
            <span className="eyebrow">{isJournal ? 'Custom journal' : 'Premium tee shirt'}</span>
            <h1>{product.name}</h1>
            <div className="rating-row">
              <span>★★★★★</span>
              <p>25k+ total reviews</p>
            </div>
            <p className="product-description">{product.description}</p>
            <p className="product-price">₦{product.basePrice.toLocaleString('en-NG')}</p>

            <div className="option-block">
              <div className="option-heading">
                <strong>Color</strong>
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
                  />
                ))}
              </div>
            </div>

            {!isJournal && (
              <>
                <div className="option-block">
                  <div className="option-heading">
                    <strong>Size</strong>
                    <span>Size chart</span>
                  </div>
                  <div className="size-grid">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={selectedSize === size ? 'is-active' : ''}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="purchase-row">
                  <div className="quantity-stepper">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)}>+</button>
                  </div>
                  <button onClick={handleTeeCheckout} className="btn btn--dark">
                    Buy Now
                  </button>
                  <button onClick={handleTeeCheckout} className="btn btn--light">
                    Add To Cart
                  </button>
                </div>
              </>
            )}

            <div className="spec-grid">
              {[
                ['Material', isJournal ? 'Premium paper and durable cover' : '100% cotton, premium weight'],
                ['Delivery', isJournal ? '2 business days' : '3 business days'],
                ['Customisation', isJournal ? 'Text, logo, or design support' : 'Size and colour selection'],
                ['Pickup', 'SUB Frontage, FUTA'],
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
            <JournalCustomizer
              product={product}
              onOrderReady={handleOrderReady}
            />
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
              ['Tolu', 'I liked seeing the journal preview before placing my order.'],
            ].map(([name, quote]) => (
              <article key={name}>
                <span>★★★★★</span>
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
                <ProductVisual type={productType} product={item} size="thumb" />
                <h3>{item.name}</h3>
                <p>₦{item.basePrice.toLocaleString('en-NG')}</p>
                <button onClick={() => navigate(`/product/${item.id}`)} className="btn btn--light">
                  View Product
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ProductPage
