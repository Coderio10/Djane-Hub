// src/components/LogoUploader.jsx
import { useState, useRef } from 'react'
import { validateImageFile, formatFileSize, prepareImageForCanvas } from '../utils/fileValidator'



function LogoUploader({ onLogoReady, onLogoCleared }) {
  const [preview,   setPreview]   = useState(null)   // base64 string
  const [fileInfo,  setFileInfo]  = useState(null)   // { name, size }
  const [error,     setError]     = useState(null)   // validation error
  const [isDragging,setIsDragging]= useState(false)  // drag-over state

  // useRef on a hidden <input type="file"> so we can trigger it
  // programmatically from a custom-styled button
  const inputRef = useRef(null)

  // The core handler — called with a File object from either
  // click-to-upload or drag-and-drop
  function processFile(file) {
    // Clear previous state before processing new file
    setError(null)
    setPreview(null)
    setFileInfo(null)
    onLogoCleared()

    // Validate first — never read an invalid file
    const result = validateImageFile(file)
    if (!result.valid) {
      setError(result.error)
      return
    }

    // Store file metadata for the UI
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
    })

    // FileReader is a browser API for reading file contents
    const reader = new FileReader()

    // onload is a callback — it fires when reading is complete
    // event.target.result contains the base64 string
   // Update reader.onload inside processFile:
reader.onload = async (event) => {
  const base64 = event.target.result

  // Prepare the image — handles SVG canvas compatibility
  const canvasReady = await prepareImageForCanvas(base64, file.type)

  setPreview(base64)           // use original base64 for the <img> thumbnail
  onLogoReady(canvasReady)     // use processed version for canvas
}

    // onError fires if reading fails (corrupt file, permissions, etc.)
    reader.onerror = () => {
      setError('Could not read the file. Please try a different image.')
    }

    // This starts the async reading process
    // readAsDataURL produces a base64-encoded data URL
    reader.readAsDataURL(file)
  }

  // Called when user picks a file through the file input
  function handleInputChange(e) {
    const file = e.target.files[0]
    if (file) processFile(file)

    // Reset the input value so the same file can be re-uploaded
    // Without this, onChange won't fire if the user picks the same file again
    e.target.value = ''
  }

  // ── Drag and drop handlers ──
  // These fire when something is dragged over the drop zone
  function handleDragOver(e) {
    e.preventDefault()        // prevents browser from opening the file
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()        // prevent browser default (opening the file)
    setIsDragging(false)

    // dataTransfer.files is the list of dropped files
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) processFile(droppedFile)
  }

  function handleClear() {
    setPreview(null)
    setFileInfo(null)
    setError(null)
    onLogoCleared()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Upload your logo
      </label>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current.click()}
        className={`
          relative w-full rounded-2xl border-2 border-dashed transition-all
          ${preview
            ? 'border-orange-300 bg-orange-50 cursor-default'
            : 'cursor-pointer hover:bg-orange-50'
          }
          ${isDragging
            ? 'border-orange-500 bg-orange-50 scale-[1.01]'
            : 'border-gray-200'
          }
        `}
      >
        {preview ? (
          // ── Preview state ──
          <div className="p-4">
            <div className="flex items-start gap-4">

              {/* Logo thumbnail */}
              <div className="w-20 h-20 rounded-xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* File info + actions */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {fileInfo?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {fileInfo?.size}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()  // prevent triggering the drop zone click
                      inputRef.current.click()
                    }}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Replace
                  </button>
                  <span className="text-gray-300">·</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClear()
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Success tick */}
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xs">✓</span>
              </div>

            </div>
          </div>
        ) : (
          // ── Empty state ──
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className="text-4xl mb-3">
              {isDragging ? '📂' : '⬆️'}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragging ? 'Drop it here' : 'Click or drag your logo here'}
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, or SVG · Max 5MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-500 text-sm flex-shrink-0">⚠️</span>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Hidden file input — triggered programmatically */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}

export default LogoUploader