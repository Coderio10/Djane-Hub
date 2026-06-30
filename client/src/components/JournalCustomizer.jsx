// src/components/JournalCustomizer.jsx
import CanvasPreview from "./CanvasPreview";

// At the top — update your import
import { useState, useEffect } from "react";
import { loadFont } from "../utils/fontLoader";

// Add import at the top
import LogoUploader from "./LogoUploader";

// Remove the old FONTS constant and replace with this richer version
const FONTS = [
  {
    name: "Playfair Display",
    label: "Elegant Serif",
    preview: "Refined & classic",
  },
  { name: "Dancing Script", label: "Handwritten", preview: "Personal & warm" },
  { name: "Oswald", label: "Bold Block", preview: "Strong & modern" },
  { name: "Courier Prime", label: "Typewriter", preview: "Retro & editorial" },
  { name: "Pacifico", label: "Brush Script", preview: "Fun & expressive" },
  { name: "Raleway", label: "Modern Thin", preview: "Clean & minimal" },
];

function JournalCustomizer({ product, onOrderReady }) {
  // --- All state lives here ---
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [withPen, setWithPen] = useState(false);
  const [isCustomized, setIsCustomized] = useState(false);
  const [customType, setCustomType] = useState(null); // 'text' | 'logo' | null
  const [customText, setCustomText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [selectedFont, setSelectedFont] = useState("Playfair Display");
  const [fontLoading, setFontLoading] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let isCurrent = true;

    async function loadSelectedFont() {
      setFontLoading(true);
      await loadFont(selectedFont);
      if (isCurrent) setFontLoading(false);
    }

    loadSelectedFont();

    return () => {
      isCurrent = false;
    };
  }, [selectedFont]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(customText);
    }, 300);

    return () => clearTimeout(timer);
  }, [customText]);

  // --- Pricing ---
  const PEN_FEE = 500;
  const CUSTOM_FEE = 1000;
  const DESIGN_FEE = 6000; // WhatsApp design route

  const total =
    (product.basePrice +
      (withPen ? PEN_FEE : 0) +
      (isCustomized && customType && customType !== "whatsapp"
        ? CUSTOM_FEE
        : 0) +
      (customType === "whatsapp" ? DESIGN_FEE : 0)) *
    quantity;

  const formatPrice = (n) => `₦${n.toLocaleString("en-NG")}`;

  // --- Build order object for checkout ---
  function handleProceed() {
    onOrderReady({
      product,
      selectedColor,
      withPen,
      isCustomized,
      customType,
      customText,
      selectedFont,
      uploadedLogo,
      quantity,
      total,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
      {/* LEFT — all the customizer controls (your existing space-y-8 div) */}
      <div className="space-y-8">
        {/* ── STEP 1: Colour selector ── */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            1. Choose a cover colour
          </h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color, i) => (
              <button
                key={color}
                title={product.colorNames[i]}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColor === color
                    ? "border-orange-500 scale-110 shadow-md"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Selected:{" "}
            <span className="font-medium text-gray-700">
              {product.colorNames[product.colors.indexOf(selectedColor)]}
            </span>
          </p>
        </section>

        {/* ── STEP 2: Pen toggle ── */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            2. Add a matching pen?
          </h3>
          <div className="flex gap-3">
            {[
              { label: "Yes please (+₦500)", value: true },
              { label: "No thanks", value: false },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setWithPen(value)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  withPen === value
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── STEP 3: Customise toggle ── */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            3. Customise the cover?
          </h3>
          <div className="flex gap-3">
            {[
              { label: "Yes, customise it (+₦1,000)", value: true },
              { label: "No, keep it plain", value: false },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => {
                  setIsCustomized(value);
                  // Reset customization state when toggling off
                  if (!value) {
                    setCustomType(null);
                    setCustomText("");
                    setUploadedLogo(null);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  isCustomized === value
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── STEP 4: Customization options (only when isCustomized = true) ── */}
        {isCustomized && (
          <section className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              4. What do you want on the cover?
            </h3>

            {/* Type selector: text / logo / whatsapp */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: "Print text", value: "text" },
                { label: "Upload a logo", value: "logo" },
                { label: "I don't have a design", value: "whatsapp" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setCustomType(value)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    customType === value
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* TEXT path */}
            {customType === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your text
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. Sarah's Journal 2025"
                    maxLength={40}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {customText.length}/40 characters
                  </p>
                </div>

                {/* Font picker — inside the customType === 'text' block */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a font
                    {fontLoading && (
                      <span className="ml-2 text-xs text-orange-400 font-normal">
                        Loading font...
                      </span>
                    )}
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setSelectedFont(font.name)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedFont === font.name
                            ? "border-orange-400 bg-orange-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-orange-200"
                        }`}
                      >
                        {/* 
          This is the key line — the font renders in itself.
          The browser uses whatever is already loaded.
          If the font isn't loaded yet, it falls back to serif.
          Once loaded, React re-renders and it displays correctly.
        */}
                        <p
                          style={{ fontFamily: `'${font.name}', serif` }}
                          className="text-lg text-gray-800 mb-1 leading-tight"
                        >
                          {customText || "Djane"}
                        </p>
                        <p className="text-xs text-gray-400 font-sans">
                          {font.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/*  Find the {customType === 'logo' && ( ... )} block and replace it: */}
            {customType === "logo" && (
              <LogoUploader
                onLogoReady={(base64) => setUploadedLogo(base64)}
                onLogoCleared={() => setUploadedLogo(null)}
              />
            )}

            {/* WHATSAPP path */}
            {customType === "whatsapp" && (
              <div className="bg-white rounded-xl border border-orange-200 p-5">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  No problem — Djane can create a design for you 🎨
                </p>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  An additional fee of{" "}
                  <span className="font-semibold text-orange-600">₦6,000</span>{" "}
                  applies for a custom design. Reach out on WhatsApp to discuss
                  what you have in mind.
                </p>

                <a
                  href="https://wa.me/2348000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  💬 Chat with Djane on WhatsApp
                </a>
              </div>
            )}
          </section>
        )}

        {/* ── STEP 5: Quantity ── */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            {isCustomized ? "5." : "4."} Quantity
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl border border-gray-200 text-xl font-semibold text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              −
            </button>
            <span className="text-xl font-bold text-gray-800 w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-xl border border-gray-200 text-xl font-semibold text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              +
            </button>
          </div>
        </section>

        {/* ── Running total + CTA ── */}
        <div className="bg-white border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-orange-500">
              {formatPrice(total)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {quantity > 1
                ? `${quantity} × ${formatPrice(total / quantity)}`
                : "for 1 journal"}
            </p>
          </div>
          <button
            onClick={handleProceed}
            disabled={isCustomized && customType === null}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>

      {/* RIGHT — live canvas preview, sticky so it stays in view while scrolling */}
      <div className="lg:sticky lg:top-8">
        <CanvasPreview
          color={selectedColor}
          text={debouncedText} // ← debounced version
          font={selectedFont}
          logoSrc={uploadedLogo}
          customType={isCustomized ? customType : null}
        />
      </div>
    </div>
  );
}

export default JournalCustomizer;
