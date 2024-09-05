export default function HomeContent() {
    return (
      <>
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Welcome back, Alex</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Total Credentials", value: "1,234", change: "+5.2%" },
            { title: "Pending Approvals", value: "56", change: "-2.1%" },
            { title: "Verified This Month", value: "789", change: "+10.3%" },
          ].map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-gray-500 text-sm font-semibold mb-2">{card.title}</h3>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold mr-2 text-gray-900">{card.value}</p>
                <span className={`text-sm font-semibold ${card.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {card.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }