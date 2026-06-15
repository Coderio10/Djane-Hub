// src/utils/fontLoader.js

// A Set is like an array but it only stores UNIQUE values
// and has O(1) lookup with .has() — perfect for tracking loaded fonts
// It persists across re-renders because it lives outside the component
const loadedFonts = new Set()

// Maps font names to their Google Fonts URL parameter
// The '+' replaces spaces in font names (URL encoding)
const FONT_URL_MAP = {
  'Playfair Display': 'Playfair+Display:wght@400;700',
  'Dancing Script':   'Dancing+Script:wght@400;700',
  'Oswald':           'Oswald:wght@400;600',
  'Courier Prime':    'Courier+Prime:wght@400;700',
  'Pacifico':         'Pacifico',
  'Raleway':          'Raleway:wght@300;400;600',
}

/**
 * Loads a Google Font on demand.
 * Returns a Promise that resolves when the font is ready to use.
 * Safe to call multiple times — won't reload already-loaded fonts.
 */
export async function loadFont(fontName) {
  // Already loaded — nothing to do
  // This is the "never double-load" guard
  if (loadedFonts.has(fontName)) return

  const urlParam = FONT_URL_MAP[fontName]
  if (!urlParam) return  // unknown font — bail out safely

  // Inject a <link> tag into <head>
  // This is exactly what you'd write in HTML manually, but done in JS
  const link = document.createElement('link')
  link.rel  = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${urlParam}&display=swap`
  document.head.appendChild(link)

  // Mark as loaded BEFORE awaiting — prevents race conditions
  // where two rapid font switches both try to load the same font
  loadedFonts.add(fontName)

  // document.fonts.ready is a Promise that resolves when ALL
  // currently loading fonts have finished parsing
  // Without this, the canvas might draw text before the font arrives
  await document.fonts.ready
}

export { FONT_URL_MAP }