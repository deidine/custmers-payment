"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, ImageIcon, X } from "lucide-react"

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null, previewUrl: string | null) => void
  maxSize?: number // in MB
  className?: string
  label?: string
  placeholder?: string
}

export default function ImageUpload({
  value,
  onChange,
  maxSize = 5,
  className = "",
  label = "Profile Picture",
  placeholder = "No Image\n(Click to upload)",
}: ImageUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(value || null)
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return false
    }

    return true
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      if (!validateFile(file)) {
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const previewUrl = reader.result as string
        setPreviewImage(previewUrl)
        onChange(file, previewUrl)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewImage(null)
      onChange(null, null)
    }

    setShowPhotoOptions(false)

    // Reset input values
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleChoosePhotoClick = () => {
    setShowPhotoOptions(true)
  }

  const handleGalleryClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    onChange(null, null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>

      <div className="w-32 h-32 border-2 border-gray-300 rounded-full flex items-center justify-center overflow-hidden mb-3 bg-gray-100 relative group">
        {previewImage ? (
          <>
            <img src={previewImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <span className="text-gray-500 text-xs text-center whitespace-pre-line">{placeholder}</span>
        )}
      </div>

      {/* Hidden file inputs */}
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleChoosePhotoClick}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
      >
        Choose Photo
      </button>

      <p className="text-gray-500 text-xs mt-1">Max size: {maxSize}MB. Supported formats: JPG, PNG, GIF</p>

      {/* Photo Options Modal */}
      {showPhotoOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Choose Photo Source</h3>
              <button onClick={() => setShowPhotoOptions(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCameraClick}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition duration-200"
              >
                <Camera className="w-6 h-6 text-purple-600" />
                <span className="font-medium">Take Photo</span>
              </button>

              <button
                type="button"
                onClick={handleGalleryClick}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition duration-200"
              >
                <ImageIcon className="w-6 h-6 text-purple-600" />
                <span className="font-medium">Choose from Gallery</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
