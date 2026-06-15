// src/pages/ShopPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { journals, tshirts } from '../data/products'

// --- ProductCard component (defined here for now, can be moved to /components later) ---
function ProductCard({ product, type }) {
  const navigate = useNavigate()

  // Format price as ₦3,500
  const formatPrice = (amount) =>
    `₦${amount.toLocaleString('en-NG')}`

  return (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      
      {/* Product image placeholder */}
      <div className="h-52 bg-orange-50 flex items-center justify-center">
        <span className="text-6xl">
          {type === 'journal' ? '📓' : '👕'}
        </span>
      </div>

      {/* Product info */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* Color swatches */}
        <div className="flex gap-2 mb-4">
          {product.colors.map((color, i) => (
            <div
              key={i}
              title={product.colorNames[i]}
              className="w-5 h-5 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-500">
            {formatPrice(product.basePrice)}
          </span>
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Order Now
          </button>
        </div>

        {/* Customizable badge — journals only */}
        {type === 'journal' && (
          <div className="mt-3">
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full">
              ✨ Customisable
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Main ShopPage component ---
function ShopPage() {
  // useState tracks which tab is active
  // 'journals' is the default when the page loads
  const [activeTab, setActiveTab] = useState('journals')

  // Decide which products to show based on the active tab
  const products = activeTab === 'journals' ? journals : tshirts
  const type = activeTab === 'journals' ? 'journal' : 'tshirt'

  return (
    <div className="min-h-screen bg-orange-50">
      
      {/* Page header */}
      <div className="bg-white border-b border-orange-100 px-6 py-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Djane's Hub Shop
        </h1>
        <p className="text-gray-500 text-lg">
          Journals, tee shirts, and custom designs — all made for you.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center pt-8 pb-6 px-6">
        <div className="bg-white rounded-2xl p-1.5 border border-orange-100 flex gap-1 shadow-sm">
          
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'journals'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-orange-500'
            }`}
          >
            📓 Journals
          </button>

          <button
            onClick={() => setActiveTab('tshirts')}
            className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'tshirts'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-orange-500'
            }`}
          >
            👕 Tee Shirts
          </button>

        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              type={type}
            />
          ))}
        </div>
      </div>

    </div>
  )
}

export default ShopPage