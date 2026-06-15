// src/utils/fileValidator.js

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX_SIZE_BYTES = 5 * 1024 * 1024  // 5MB in bytes
                                         // 5 * 1024 = 5KB
                                         // 5 * 1024 * 1024 = 5MB

/**
 * Validates an uploaded file.
 * Returns { valid: true } or { valid: false, error: "message" }
 *
 * Returning an object instead of throwing an error is a cleaner pattern
 * for UI validation — you can directly use the error as display text.
 */
export function validateImageFile(file) {
  // Check 1 — is the file type allowed?
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a PNG, JPG, or SVG file.',
    }
  }

  // Check 2 — is the file under 5MB?
  if (file.size > MAX_SIZE_BYTES) {
    // Convert bytes to MB for the error message
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File is ${sizeMB}MB — please upload something under 5MB.`,
    }
  }

  return { valid: true }
}

/**
 * Converts bytes to a human-readable string.
 * 1500 → "1.5 KB"
 * 2400000 → "2.3 MB"
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Add this to fileValidator.js

/**
 * SVGs loaded as data URLs sometimes fail canvas rendering.
 * This converts SVG base64 to a Blob URL which canvas accepts reliably.
 */
export function prepareImageForCanvas(base64, fileType) {
  // Only SVG needs special treatment
  if (fileType !== 'image/svg+xml') return Promise.resolve(base64)

  // Convert base64 back to binary, then to a Blob, then to an object URL
  return fetch(base64)
    .then((res) => res.blob())
    .then((blob) => URL.createObjectURL(blob))
}