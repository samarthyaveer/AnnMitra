'use client'

export default function TestBlur() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      {/* Background elements with bright colors to test blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 bg-red-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-32 right-20 w-56 h-56 bg-blue-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-60 left-1/3 w-44 h-44 bg-green-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-80 right-1/3 w-52 h-52 bg-yellow-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-[40vh] left-20 w-40 h-40 bg-purple-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-[60vh] right-10 w-48 h-48 bg-orange-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-[80vh] left-1/2 w-56 h-56 bg-pink-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-[100vh] right-1/4 w-44 h-44 bg-teal-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-[120vh] left-10 w-52 h-52 bg-indigo-500/40 rounded-full blur-lg"></div>
        <div className="absolute top-[140vh] right-20 w-40 h-40 bg-cyan-500/40 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto space-y-8 pt-20">
          {/* Title Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">
              🌈 Backdrop Blur Test Page
            </h1>
            <p className="text-xl text-gray-300">
              Scroll up and down to see the beautiful backdrop blur effect on the navbar!
            </p>
          </div>

          {/* Colorful Content Sections */}
          <div className="space-y-12">
            <div className="p-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border border-red-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🔴 Red Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                This red section has a bright background that will clearly show the blur effect
                when it scrolls behind the navbar. The backdrop-filter property creates a 
                beautiful glass-like effect that makes the navbar content easily readable
                while maintaining the aesthetic appeal of the underlying content.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl border border-blue-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🔵 Blue Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                The blue background creates a striking contrast when blurred behind the navbar.
                Modern browsers support the backdrop-filter CSS property which allows for
                real-time blurring of content behind an element, creating sophisticated
                UI effects that were previously only possible with complex workarounds.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl border border-green-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🟢 Green Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Green represents nature and freshness, and when blurred behind our navbar,
                it demonstrates how the backdrop blur effect works with different color
                temperatures. The saturation and brightness filters enhance the glass effect
                by making the blur more vibrant and appealing to the eye.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-yellow-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🟡 Yellow Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Yellow and orange create warm, energetic backgrounds. When these bright
                colors pass behind the navbar, the blur effect becomes very apparent,
                showing how the backdrop-filter creates a frosted glass appearance
                that diffuses the underlying content while preserving color information.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-purple-500/20 to-violet-500/20 backdrop-blur-sm rounded-2xl border border-purple-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🟣 Purple Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Purple adds a mystical quality to our test page. The backdrop blur effect
                works particularly well with purple because it creates a dreamy, ethereal
                appearance when blurred. This demonstrates the versatility of the effect
                across different parts of the color spectrum.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-sm rounded-2xl border border-pink-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🩷 Pink Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Pink brings a soft, gentle quality to our design. When this content
                scrolls behind the navbar, the backdrop blur creates a subtle, pleasant
                effect that maintains readability while adding visual interest. The
                combination of blur and transparency creates depth in the interface.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl border border-teal-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🔷 Teal Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Teal combines the calming properties of blue with the refreshing qualities
                of green. This section demonstrates how cooler colors interact with the
                backdrop blur effect. The glass-like appearance created by the blur
                enhances the overall modern aesthetic of the application.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-indigo-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🔵 Indigo Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Indigo represents depth and wisdom. As this deep blue content moves
                behind the navbar, the backdrop blur effect creates a sophisticated
                appearance that&apos;s both functional and beautiful. The blur radius and
                saturation work together to create the perfect balance of clarity and style.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl border border-orange-400/30">
              <h2 className="text-3xl font-bold text-white mb-4">🟠 Orange Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Orange is energetic and vibrant, making it perfect for testing the
                backdrop blur effect. As you scroll, notice how the navbar maintains
                perfect readability while the orange content becomes beautifully diffused
                behind it. This is the power of modern CSS backdrop-filter properties!
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-gray-600/20 to-gray-400/20 backdrop-blur-sm rounded-2xl border border-gray-400/30 mb-20">
              <h2 className="text-3xl font-bold text-white mb-4">⚫ Final Section</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                This final gray section provides a more subtle background to test the
                blur effect. The backdrop blur works with any color, creating consistent
                results that enhance the user interface. Scroll back up to see the effect
                in action with all the colorful sections above!
              </p>
              <div className="mt-6 p-4 bg-green-600/20 rounded-lg border border-green-400/30">
                <p className="text-green-200 font-medium">
                  ✅ If you can see a beautiful blur effect on the navbar as you scroll,
                  the implementation is working perfectly!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
