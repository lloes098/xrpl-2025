export default function Home() {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          XRPL ETF Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          XRPL 블록체인 기반의 혁신적인 ETF 거래 플랫폼
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            지갑 연결하기
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50">
            더 알아보기
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">$0</div>
          <div className="text-gray-600">총 거래량</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-gray-600">활성 ETF</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-gray-600">등록 사용자</div>
        </div>
      </div>

      {/* ETF List Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">인기 ETF</h2>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 text-center text-gray-500">
            ETF 목록이 준비 중입니다...
          </div>
        </div>
      </div>
    </div>
  )
}