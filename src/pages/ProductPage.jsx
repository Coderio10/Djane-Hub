// // src/pages/ProductPage.jsx
// import { useParams, useNavigate } from 'react-router-dom'
// import { journals, tshirts } from '../data/products'

// function ProductPage() {
//   const { id } = useParams()       // reads "journal-classic" from the URL
//   const navigate = useNavigate()

//   // Search BOTH arrays for the product matching this URL id
//   const product =
//     journals.find((p) => p.id === id) ||
//     tshirts.find((p) => p.id === id)

//   // If nothing matches (bad URL), show a not-found screen
//   if (!product) {
//     return (
//       <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center gap-4">
//         <p className="text-2xl font-semibold text-gray-700">Product not found</p>
//         <button
//           onClick={() => navigate('/shop')}
//           className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold"
//         >
//           Back to Shop
//         </button>
//       </div>
//     )
//   }

//   // Determine product type from id prefix
//   const isJournal = id.startsWith('journal')

//   return (
//     <div className="min-h-screen bg-orange-50 py-12 px-6">
//       <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-orange-100 p-8">

//         {/* Back button */}
//         <button
//           onClick={() => navigate('/shop')}
//           className="text-orange-500 hover:text-orange-600 text-sm font-medium mb-6 flex items-center gap-1"
//         >
//           ← Back to Shop
//         </button>

//         {/* Product header */}
//         <div className="h-48 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
//           <span className="text-7xl">{isJournal ? '📓' : '👕'}</span>
//         </div>

//         <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
//         <p className="text-gray-500 mb-4">{product.description}</p>
//         <p className="text-2xl font-bold text-orange-500 mb-8">
//           ₦{product.basePrice.toLocaleString('en-NG')}
//         </p>

//         {/* Color swatches */}
//         <div className="mb-6">
//           <p className="text-sm font-semibold text-gray-700 mb-3">Choose a colour</p>
//           <div className="flex gap-3">
//             {product.colors.map((color, i) => (
//               <div
//                 key={i}
//                 title={product.colorNames[i]}
//                 className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer hover:scale-110 hover:border-orange-400 transition-all"
//                 style={{ backgroundColor: color }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Size selector — tees only */}
//         {!isJournal && (
//           <div className="mb-8">
//             <p className="text-sm font-semibold text-gray-700 mb-3">Choose a size</p>
//             <div className="flex gap-2">
//               {product.sizes.map((size) => (
//                 <button
//                   key={size}
//                   className="w-12 h-12 rounded-xl border border-orange-200 text-sm font-semibold text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-colors"
//                 >
//                   {size}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Customise badge — journals only */}
//         {isJournal && (
//           <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
//             <p className="text-sm font-semibold text-orange-700 mb-1">✨ This journal can be customised</p>
//             <p className="text-xs text-orange-600">
//               Add your name, a quote, or your logo to the cover. We'll build the full customiser next.
//             </p>
//           </div>
//         )}

//         <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors">
//           Proceed to Checkout
//         </button>

//       </div>
//     </div>
//   )
// }

// export default ProductPage

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

  // Called by JournalCustomizer when user clicks "Proceed to Checkout"
  function handleOrderReady(orderData) {
    // For now, log it — in Phase 3 we'll pass this to CheckoutPage
    console.log('Order ready:', orderData)
    navigate('/checkout')
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