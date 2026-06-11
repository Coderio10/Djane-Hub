// src/components/CanvasPreview.jsx
import { useRef, useEffect } from 'react'

// Canvas dimensions — the actual pixel size of what we draw
const CANVAS_W = 400
const CANVAS_H = 560

function CanvasPreview({ color, text, font, logoSrc, customType }) {
  // useRef gives us direct access to the <canvas> DOM element
  // It's like document.getElementById() but the React way
  // Changing a ref does NOT cause a re-render — perfect for canvas
  const canvasRef = useRef(null)

  // useEffect runs after every render where the listed values change
  // Think of it as: "whenever color/text/font/logo changes, redraw"
  useEffect(() => {
    const canvas = canvasRef.current       // the actual <canvas> element
    if (!canvas) return                    // safety check

    const ctx = canvas.getContext('2d')    // the drawing API lives here

    // ── 1. Clear everything from the previous draw ──
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // ── 2. Draw the journal cover background ──
    drawCover(ctx, color)

    // ── 3. Draw the spine (left strip) ──
    drawSpine(ctx)

    // ── 4. Draw the embossed border ──
    drawBorder(ctx)

    // ── 5. Draw content based on customType ──
    if (customType === 'text' && text) {
      drawText(ctx, text, font)
    } else if (customType === 'logo' && logoSrc) {
      drawLogo(ctx, logoSrc)
    } else {
      // No customization — draw a subtle "Djane's Hub" watermark
      drawWatermark(ctx)
    }

  // The dependency array — useEffect re-runs whenever ANY of these change
  }, [color, text, font, logoSrc, customType])

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-gray-500">Live preview</p>

      {/* 
        The canvas element. 
        width/height = internal drawing resolution (400×560px)
        CSS width = how big it appears on screen (shrunk to fit mobile)
      */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-xl shadow-xl border border-gray-100"
        style={{ width: '200px', height: '280px' }}  // display at half size
      />

      <p className="text-xs text-gray-400">
        Updates as you make changes
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Drawing helper functions
// Each one receives ctx (the drawing context) and draws one layer
// ─────────────────────────────────────────────

function drawCover(ctx, color) {
  // Main cover fill
  ctx.fillStyle = color
  ctx.beginPath()
  // roundRect draws a rectangle with rounded corners
  ctx.roundRect(20, 10, CANVAS_W - 40, CANVAS_H - 20, 12)
  ctx.fill()

  // Subtle highlight on the top-left (gives a 3D paper feel)
  const highlight = ctx.createLinearGradient(20, 10, CANVAS_W - 20, CANVAS_H)
  highlight.addColorStop(0, 'rgba(255,255,255,0.15)')
  highlight.addColorStop(1, 'rgba(0,0,0,0.1)')
  ctx.fillStyle = highlight
  ctx.beginPath()
  ctx.roundRect(20, 10, CANVAS_W - 40, CANVAS_H - 20, 12)
  ctx.fill()
}

function drawSpine(ctx) {
  // Slightly darker version of the cover color for the spine
  // We overlay a semi-transparent dark strip on the left edge
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.roundRect(20, 10, 28, CANVAS_H - 20, [12, 0, 0, 12])
  ctx.fill()

  // Spine lines (binding detail)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ;[80, 160, 260, 380, 460].forEach((y) => {
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(48, y)
    ctx.stroke()
  })
}

function drawBorder(ctx) {
  // Inner embossed border — a subtle inset frame
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(36, 24, CANVAS_W - 72, CANVAS_H - 48, 8)
  ctx.stroke()

  // Outer shadow border
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(20, 10, CANVAS_W - 40, CANVAS_H - 20, 12)
  ctx.stroke()
}

function drawText(ctx, text, fontName) {
  // Measure and wrap text so it fits nicely on the cover
  const maxWidth = CANVAS_W - 120   // text can't go to the edge
  const centerX  = CANVAS_W / 2 + 14  // offset right to clear the spine
  const centerY  = CANVAS_H / 2

  // The font string Canvas needs: "bold 36px 'Playfair Display', serif"
  ctx.font      = `bold 36px '${fontName}', serif`
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Word-wrap the text manually
  // Canvas doesn't auto-wrap — you have to measure each word
  const words   = text.split(' ')
  const lines   = []
  let   current = ''

  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word
    // measureText() returns the pixel width of a string
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  })
  lines.push(current)

  // Draw each line, centered vertically as a group
  const lineHeight = 44
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2

  // Subtle text shadow for readability on any cover color
  ctx.shadowColor   = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur    = 6
  ctx.shadowOffsetY = 2

  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight)
  })

  // Reset shadow so it doesn't bleed into other draws
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur  = 0
}

function drawLogo(ctx, logoSrc) {
  // We need to load the image first
  // The Image object works like <img> — set .src, wait for .onload
  const img = new Image()
  img.src = logoSrc

  img.onload = () => {
    // Get the canvas context again inside this callback
    // (ctx is still valid — this is a closure)
    const maxSize  = 200
    const centerX  = CANVAS_W / 2 + 14
    const centerY  = CANVAS_H / 2

    // Scale the image to fit within maxSize while keeping aspect ratio
    let drawW = img.width
    let drawH = img.height

    if (drawW > maxSize || drawH > maxSize) {
      const ratio = Math.min(maxSize / drawW, maxSize / drawH)
      drawW *= ratio
      drawH *= ratio
    }

    // drawImage(image, x, y, width, height)
    // We position it so it's centered on the cover
    ctx.drawImage(
      img,
      centerX - drawW / 2,
      centerY - drawH / 2,
      drawW,
      drawH
    )
  }
}

function drawWatermark(ctx) {
  // Subtle branding when there's no customization
  ctx.font      = `16px 'Playfair Display', serif`
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText("Djane's Hub", CANVAS_W / 2 + 14, CANVAS_H / 2)

  // Small decorative line above and below
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth   = 0.8

  const cx = CANVAS_W / 2 + 14
  ctx.beginPath(); ctx.moveTo(cx - 60, CANVAS_H / 2 - 20); ctx.lineTo(cx + 60, CANVAS_H / 2 - 20); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx - 60, CANVAS_H / 2 + 20); ctx.lineTo(cx + 60, CANVAS_H / 2 + 20); ctx.stroke()
}

export default CanvasPreview
