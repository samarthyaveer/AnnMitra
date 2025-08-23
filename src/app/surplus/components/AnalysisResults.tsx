'use client'

// import { AnalysisResult } from '@/lib/transaction-analyzer'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

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

interface AnalysisResultsProps {
  result: AnalysisResult
  onStartNew: () => void
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

export default function AnalysisResults({ result, onStartNew }: AnalysisResultsProps) {
  
  // Safety check for result object
  if (!result) {
    return (
      <div className="text-white p-4">
        <p>No analysis results available.</p>
        <button onClick={onStartNew} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-4">
          Start New Analysis
        </button>
      </div>
    )
  }

  console.log('Full result object:', result)
  console.log('Daily patterns:', result.dailyPatterns)
  console.log('Hourly patterns:', result.hourlyPatterns)
  
  // Helper function to safely format dates
  const safeFormatDate = (dateString: string, index: number) => {
    try {
      console.log(`Processing date ${index}:`, dateString)
      
      if (!dateString) {
        console.warn(`Empty date string at index ${index}`)
        return `Day ${index + 1}`
      }

      // Try different date parsing approaches
      let dateObj: Date | null = null
      
      // First try: direct parsing
      dateObj = new Date(dateString)
      if (!isNaN(dateObj.getTime())) {
        const month = dateObj.getMonth() + 1
        const day = dateObj.getDate()
        return `${month}/${day}`
      }

      // Second try: manual parsing for YYYY-MM-DD format
      if (dateString.includes('-')) {
        const parts = dateString.split('-')
        if (parts.length === 3) {
          const year = parseInt(parts[0])
          const month = parseInt(parts[1])
          const day = parseInt(parts[2])
          
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return `${month}/${day}`
          }
        }
      }

      console.warn(`Could not parse date: ${dateString}`)
      return `Day ${index + 1}`
      
    } catch (error) {
      console.error('Error in safeFormatDate:', error, 'Input:', dateString)
      return `Day ${index + 1}`
    }
  }

  // Prepare chart data with robust error handling
  const dailyChartData = (result.dailyPatterns || []).map((pattern, index) => {
    const formattedDate = safeFormatDate(pattern.date || pattern.day || '', index)
    
    return {
      date: formattedDate,
      transactions: Math.max(0, pattern.totalTransactions || pattern.avgTransactions || 0),
      revenue: Math.max(0, pattern.totalRevenue || 0)
    }
  })

  const hourlyChartData = (result.hourlyPatterns || []).map((pattern, index) => ({
    hour: pattern.hour || index,
    transactions: Math.max(0, pattern.averageTransactions || pattern.avgTransactions || 0),
    revenue: Math.max(0, pattern.averageTransactions || pattern.avgTransactions || 0)
  }))

  const foodItemChartData = result.foodItems?.map((food: any, index: number) => ({
    name: food.name || 'N/A',
    current: food.totalQuantity || 0,
    predicted: (food.totalQuantity || 0) * 1.1,
    waste: (food.totalQuantity || 0) * 0.1,
    color: COLORS[index % COLORS.length]
  })) || []

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">📊 Analysis Results</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Analysis Period: {result.summary?.period?.start || 'N/A'} to {result.summary?.period?.end || 'N/A'}
          </p>
        </div>
        <button
          onClick={onStartNew}
          className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          🔄 New Analysis
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-500/30 p-3 sm:p-4 lg:p-6">
          <div className="text-2xl sm:text-3xl mb-2">📈</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{result.summary?.totalTransactions || 0}</div>
          <div className="text-blue-300 text-xs sm:text-sm">Total Transactions</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg border border-green-500/30 p-3 sm:p-4 lg:p-6">
          <div className="text-2xl sm:text-3xl mb-2">💰</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">₹{result.summary?.totalRevenue?.toLocaleString() || 0}</div>
          <div className="text-green-300 text-xs sm:text-sm">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg border border-purple-500/30 p-3 sm:p-4 lg:p-6">
          <div className="text-2xl sm:text-3xl mb-2">🍽️</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{result.foodItems?.length || 0}</div>
          <div className="text-purple-300 text-xs sm:text-sm">Food Items</div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-lg border border-orange-500/30 p-3 sm:p-4 lg:p-6">
          <div className="text-2xl sm:text-3xl mb-2">⚡</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            {Math.round(((result.summary?.totalTransactions || 0) / (result.dailyPatterns?.length || 1)) * 100) / 100}
          </div>
          <div className="text-orange-300 text-xs sm:text-sm">Avg Daily Orders</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Daily Pattern Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">📅 Daily Pattern</h3>
          <div className="h-48 sm:h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  interval={'preserveStartEnd'}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Pattern Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">🕐 Hourly Pattern</h3>
          <div className="h-48 sm:h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="transactions" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Food Item Analysis */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">🍽️ Food Item Performance & Predictions</h3>
        
        {/* Food Item Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="h-48 sm:h-56 lg:h-64">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Current vs Predicted Demand</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={foodItemChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="current" fill="#10B981" name="Current Avg" />
                <Bar dataKey="predicted" fill="#3B82F6" name="Predicted" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-48 sm:h-56 lg:h-64">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Waste Reduction Potential</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={foodItemChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="waste"
                  label={false}
                  labelLine={false}
                >
                  {foodItemChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${typeof value === 'number' ? value.toFixed(1) : value} units`,
                    `${props.payload.name}`
                  ]}
                  labelFormatter={() => 'Waste Reduction Potential'}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Food Item Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-white font-semibold px-2 sm:px-0">Food Item</th>
                  <th className="pb-3 text-white font-semibold hidden sm:table-cell">Current Avg/Day</th>
                  <th className="pb-3 text-white font-semibold hidden md:table-cell">Predicted</th>
                  <th className="pb-3 text-white font-semibold hidden lg:table-cell">Peak Hours</th>
                  <th className="pb-3 text-white font-semibold hidden lg:table-cell">Low Days</th>
                  <th className="pb-3 text-white font-semibold">Waste Reduction</th>
                </tr>
              </thead>
              <tbody>
                {(result.foodItems || []).slice(0, window.innerWidth < 768 ? 5 : 10).map((food: any) => (
                  <tr key={food.name} className="border-b border-gray-800">
                    <td className="py-3 text-white font-medium px-2 sm:px-0 max-w-[120px] truncate">{food.name}</td>
                    <td className="py-3 text-gray-300 hidden sm:table-cell">{(food.totalQuantity / (result.dailyPatterns?.length || 1)).toFixed(1)}</td>
                    <td className="py-3 text-green-300 hidden md:table-cell">{(food.totalQuantity * 1.1).toFixed(1)}</td>
                    <td className="py-3 text-blue-300 hidden lg:table-cell max-w-[100px] truncate">{food.peakHours?.join(', ') || 'N/A'}</td>
                    <td className="py-3 text-yellow-300 hidden lg:table-cell max-w-[100px] truncate">Weekend</td>
                    <td className="py-3 text-red-300">{(food.totalQuantity * 0.1).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(result.foodItems?.length || 0) > (window.innerWidth < 768 ? 5 : 10) && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Showing {window.innerWidth < 768 ? 5 : 10} of {result.foodItems?.length || 0} items
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">💡 AI Recommendations</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {result.recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`
                rounded-lg border p-4 sm:p-6
                ${rec.priority === 'high' ? 'bg-red-900/20 border-red-500/30' : 
                  rec.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-500/30' : 
                  'bg-green-900/20 border-green-500/30'}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-base sm:text-lg font-semibold text-white pr-2">{rec.title}</h4>
                <span className={`
                  px-2 py-1 rounded text-xs font-medium flex-shrink-0
                  ${rec.priority === 'high' ? 'bg-red-600 text-white' : 
                    rec.priority === 'medium' ? 'bg-yellow-600 text-white' : 
                    'bg-green-600 text-white'}
                `}>
                  {rec.priority.toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4 text-sm sm:text-base">{rec.description}</p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-green-300 mb-2">💥 Impact:</p>
                <p className="text-sm text-gray-400">{rec.impact}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-blue-300 mb-2">📋 Action Items:</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  {rec.actionItems?.map((item: any, itemIndex: number) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">🔮 AI Predictions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {result.predictions.map((pred, index) => (
            <div key={index} className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 rounded-lg border border-indigo-500/30 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base sm:text-lg font-semibold text-white capitalize">{pred.type}</h4>
                <div className="text-xs bg-indigo-600 text-white px-2 py-1 rounded flex-shrink-0">
                  {Math.round(pred.confidence * 100)}%
                </div>
              </div>
              
              <div className="text-xl sm:text-2xl font-bold text-indigo-300 mb-2">
                {pred.predictedValue.toFixed(1)}
              </div>
              
              <p className="text-sm text-gray-400 mb-3">
                <strong>{pred.identifier}</strong>
              </p>
              
              <p className="text-xs text-gray-500">{pred.reasoning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
