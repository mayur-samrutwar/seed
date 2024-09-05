import {useState, useEffect, useCallback} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HomeIcon, FileCheckIcon, ShieldCheckIcon, ClipboardCheckIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, BellIcon, UserIcon, GlobeIcon, CalendarIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi'

export default function AirbnbStyleDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState("Home")
  const [credentialType, setCredentialType] = useState("aadhar")
  const [walletAddress, setWalletAddress] = useState("")
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [dob, setDob] = useState("")
  const [post, setPost] = useState("")
  const [salary, setSalary] = useState("")
  const [yoe, setYoe] = useState("")

  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const handleSignMessage = useCallback(async () => {
    // if address is not available
    if (!address) {
      console.error("No address available");
      return;
    }
    try {
      const signature = await signMessageAsync({ message: "Login to the application" });
      console.log("Signature received:", signature);
      setIsSigned(true);
      // handleLogin(address, signature);
    } catch (error) {
      console.error("Error during sign message:", error);
      await handleReconnect();
    }
  }, [address, signMessageAsync]);

  // attemp to reconnect
  const handleReconnect = async () => {
    try {
      await disconnectAsync();
      const result = await connectAsync({ connector: connectors[0] });
      if (result?.account) {
        handleSignMessage();
      } else {
      }
    } catch (error) {
      console.error("Error during reconnect:", error);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      console.log("Wallet connected. Address:", address);
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isReady) {
      handleSignMessage();
    }
  }, [isReady, handleSignMessage]);

  const menuItems = [
    { icon: HomeIcon, label: "Home" },
    { icon: FileCheckIcon, label: "Issue Credential" },
    { icon: ShieldCheckIcon, label: "Verify Credential" },
    { icon: ClipboardCheckIcon, label: "Approval Request" },
    ...(isSigned ? [{ icon: UserIcon, label: "Profile" }] : []),
  ]

  const renderContent = () => {
    switch (activePage) {
      case "Home":
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
      case "Issue Credential":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Issue New Credential</h1>
            <p className="text-gray-600 mb-6 text-lg">Select the credential type and provide the required information.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credential Type</label>
                <Select onValueChange={(value) => setCredentialType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhar">Aadhar Card</SelectItem>
                    <SelectItem value="job">Job Details</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                <Input type="text" placeholder="Enter wallet address" onChange={(e) => setWalletAddress(e.target.value)} className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <Input type="text" value='2345678bvcf' readOnly className="w-full bg-gray-100" />
              </div>

              {credentialType === 'aadhar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input type="text" placeholder="Enter name" onChange={(e) => setName(e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <Input type="number" placeholder="Enter age" onChange={(e) => setAge(e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {credentialType === 'job' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <Input type="text" value="Seed Inc." readOnly className="w-full bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post</label>
                    <Input type="text" placeholder="Enter post" onChange={(e) => setPost(e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                    <Input type="number" placeholder="Enter salary" onChange={(e) => setSalary(e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <Input type="number" placeholder="Enter years of experience" onChange={(e) => setYoe(e.target.value)} className="w-full" />
                  </div>
                </>
              )}

              <Button className="w-full mt-6 bg-black text-white hover:bg-gray-800">Issue Credential</Button>
            </div>
          </div>
        )
      case "Verify Credential":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Verify Credential</h1>
            <p className="text-gray-600 mb-8 text-lg">Enter the credential details below to verify its authenticity.</p>
            {/* Add a form or more content here */}
          </div>
        )
      case "Approval Request":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Approval Requests</h1>
            <p className="text-gray-600 mb-8 text-lg">Review and manage pending approval requests.</p>
            {/* Add a list of approval requests or more content here */}
          </div>
        )
      case "Profile":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">User Profile</h1>
            <p className="text-gray-600 mb-8 text-lg">View and edit your profile information.</p>
            {/* Add profile information and edit form here */}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
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
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <>
            {isCollapsed ? (
              <w3m-button balance="hide" label="S" />
            ) : (
              <w3m-button balance="hide" label="Connect Wallet" />
            )}
          </>
        </div>
        <Button
          variant="ghost"
          className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white text-gray-400 hover:text-gray-900 rounded-full shadow-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-200">
          <div className="relative flex-1 max-w-lg">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search credentials, users, or requests..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-black focus:ring-black text-base"
            />
          </div>
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="icon">
              <BellIcon className="h-5 w-5 text-gray-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}