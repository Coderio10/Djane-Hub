// src/pages/ProductPage.jsx — updated imports + usage
import { useParams, useNavigate } from 'react-router-dom'
import { journals, tshirts } from '../data/products'
import JournalCustomizer from '../components/JournalCustomizer'

function ProductPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const product =
    journals.find((p) => p.id === id) ||
    tshirts.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-semibold text-gray-700">Product not found</p>
        <button onClick={() => navigate('/shop')}
          className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold">
          Back to Shop
        </button>
      </div>
    )
  }

  const isJournal = id.startsWith('journal')

   // Update handleOrderReady to carry the data to checkout
  function handleOrderReady(orderData) {
    navigate('/checkout', {
      // 'state' is React Router's way of passing data between pages
      // It's available in the destination via useLocation()
      // It's NOT in the URL — so it's not visible or bookmarkable
      state: { orderData }
    })
  }

  return (
    <div className="min-h-screen bg-orange-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">

        <button onClick={() => navigate('/shop')}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium mb-6 flex items-center gap-1">
          ← Back to Shop
        </button>

        {/* Product header */}
        <div className="bg-white rounded-2xl border border-orange-100 p-8 mb-6">
          <div className="h-48 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
            <span className="text-7xl">{isJournal ? '📓' : '👕'}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-2">{product.description}</p>
          <p className="text-2xl font-bold text-orange-500">
            ₦{product.basePrice.toLocaleString('en-NG')}
          </p>
        </div>

        {/* Journal customizer */}
        {isJournal && (
          <div className="bg-white rounded-2xl border border-orange-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Customise your journal
            </h2>
            <JournalCustomizer
              product={product}
              onOrderReady={handleOrderReady}
            />
          </div>
        )}

        {/* Tee shirt — simpler flow, Phase 3 will expand this */}
        {!isJournal && (
          <div className="bg-white rounded-2xl border border-orange-100 p-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">Choose a size</p>
            <div className="flex gap-2 mb-8">
              {product.sizes.map((size) => (
                <button key={size}
                  className="w-12 h-12 rounded-xl border border-orange-200 text-sm font-semibold text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors">
              Proceed to Checkout →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProductPage