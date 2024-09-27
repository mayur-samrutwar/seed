import { Button } from "@/components/ui/button"
import { HomeIcon, FileCheckIcon, ChevronLeftIcon, ChevronRightIcon, Mail } from "lucide-react"

export default function Sidebar({ isCollapsed, setIsCollapsed, activePage, setActivePage, isSigned }) {
  const menuItems = [
    { icon: HomeIcon, label: "Home" },
    { icon: FileCheckIcon, label: "Issue Credential" },
    { icon: Mail, label: "Decrypt Data" },
  ]

  return (
    <aside className={`relative bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6">
        <div className="flex items-center mb-10">
          {!isCollapsed && (
            <>
              <div className="w-8 h-8 bg-black rounded-lg mr-3 flex items-center justify-center">
                <span className="text-white">S</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-black">SeedID</h1>
            </>
          )}
          {isCollapsed && <div className="w-8 h-8 bg-black rounded-lg mx-auto flex items-center justify-center">
            <span className="text-white">S</span>
          </div>}
        </div>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-gray-600 hover:text-black hover:bg-gray-100 ${
                    isCollapsed ? 'px-2' : ''
                  } ${activePage === item.label ? 'bg-gray-100 text-black' : ''}`}
                  onClick={() => setActivePage(item.label)}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="font-normal">{item.label}</span>}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-auto p-6">
        {isCollapsed ? (
          <w3m-button balance="hide" label="S" />
        ) : (
          <w3m-button balance="hide" label="Connect Wallet" />
        )}
      </div>
      <Button
        variant="ghost"
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white text-gray-400 hover:text-gray-900 rounded-full shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
      </Button>
    </aside>
  )
}