'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  onUploadSuccess: (sessionId: string) => void
  isAnalyzing: boolean
}

export default function FileUploadComponent({ onUploadSuccess, isAnalyzing }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    // Validate file
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      setIsUploading(false)
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      setIsUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/surplus/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        onUploadSuccess(data.uploadSessionId)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `transaction_date,transaction_time,food_item,quantity,amount
2024-01-01,12:30:00,Biryani,2,360
2024-01-01,13:15:00,Dosa,1,60
2024-01-01,14:00:00,Chawal Dal,1,90
2024-01-01,19:30:00,Chole Bhature,2,260`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-transaction-data.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Download Sample */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Upload Your CSV File</h3>
          <p className="text-gray-400 text-sm sm:text-base">Upload transaction history to get AI-powered insights</p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm w-full sm:w-auto"
        >
          📥 Download Sample
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${isUploading || isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && !isAnalyzing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || isAnalyzing}
        />

        {isUploading ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-green-400 mx-auto"></div>
            <div>
              <p className="text-white font-medium text-sm sm:text-base">Uploading and processing...</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-4xl sm:text-5xl lg:text-6xl">📊</div>
            <div>
              <p className="text-white font-medium text-sm sm:text-base">
                Drop your CSV file here or click to browse
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Supports CSV files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 sm:p-4">
          <p className="text-red-300 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4">
        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">📋 CSV Format Requirements:</h4>
        <ul className="text-gray-400 text-xs sm:text-sm space-y-1">
          <li>• <strong>transaction_date:</strong> YYYY-MM-DD format (e.g., 2024-01-15)</li>
          <li>• <strong>transaction_time:</strong> HH:MM:SS format (e.g., 14:30:00)</li>
          <li>• <strong>food_item:</strong> Name of the food item (e.g., Biryani, Dosa)</li>
          <li>• <strong>quantity:</strong> Number of items sold (e.g., 2)</li>
          <li>• <strong>amount:</strong> Transaction amount in INR (e.g., 360)</li>
        </ul>
      </div>
    </div>
  )
}
