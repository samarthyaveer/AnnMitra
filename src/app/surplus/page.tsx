'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import FileUploadComponent from './components/FileUpload'
import AnalysisResults from '@/app/surplus/components/AnalysisResults'
// import { AnalysisResult } from '@/lib/transaction-analyzer'

interface AnalysisResult {
  summary: any
  dailyPatterns: any[]
  weeklyPatterns: any[]
  hourlyPatterns: any[]
  foodItems: any[]
  recommendations: any[]
  predictions: any[]
  wasteReduction: any
}

export default function SurplusAnalysis() {
  const { isLoaded, user } = useUser()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleUploadSuccess = async (sessionId: string) => {
    setIsAnalyzing(true)

    try {
      // Trigger analysis
      const response = await fetch('/api/surplus/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uploadSessionId: sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisResult(data.analysis)
      } else {
        const error = await response.json()
        console.error('Analysis failed:', error)
        alert(`Analysis failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze data. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please sign in to access surplus analysis.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/10 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 pt-4 sm:pt-6 lg:pt-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            🤖 AI-Powered Surplus Food Analysis
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
            Upload your transaction history to get intelligent insights and reduce food waste
          </p>
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30 p-3 sm:p-4">
            <p className="text-white/90 text-sm sm:text-base">
              📊 This AI analyzes your transaction patterns to predict demand and recommend optimal food preparation quantities
            </p>
          </div>
        </div>

        {/* Upload Section */}
        {!analysisResult && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                📤 Upload Transaction Data
              </h2>
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Required CSV Format:</h3>
                <div className="bg-gray-900 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm text-gray-300 overflow-x-auto">
                  <div>transaction_date,transaction_time,food_item,quantity,amount</div>
                  <div>2024-01-01,12:30:00,Biryani,2,360</div>
                  <div>2024-01-01,13:15:00,Dosa,1,60</div>
                </div>
              </div>
              
              <FileUploadComponent 
                onUploadSuccess={handleUploadSuccess}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-400 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Analyzing Your Data...</h3>
                  <p className="text-blue-300 text-sm sm:text-base">AI is processing transaction patterns and generating insights</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <AnalysisResults 
            result={analysisResult}
            onStartNew={() => {
              setAnalysisResult(null)
            }}
          />
        )}

        {/* Feature Information */}
        {!analysisResult && !isAnalyzing && (
          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-500/30 p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📈</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Pattern Analysis</h3>
              <p className="text-blue-300 text-sm sm:text-base">
                AI identifies daily, weekly, and hourly patterns in your transaction data to understand customer behavior.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg border border-green-500/30 p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎯</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Demand Prediction</h3>
              <p className="text-green-300 text-sm sm:text-base">
                Predict future demand for each food item based on historical trends and seasonal patterns.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg border border-purple-500/30 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">♻️</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Waste Reduction</h3>
              <p className="text-purple-300 text-sm sm:text-base">
                Get specific recommendations to reduce food waste and optimize preparation quantities.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
