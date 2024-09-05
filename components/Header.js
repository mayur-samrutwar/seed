import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchIcon, BellIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Header() {
  return (
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
      </div>
    </header>
  )
}