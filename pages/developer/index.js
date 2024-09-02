import { useState } from 'react'
import { Bell, ChevronDown, Copy, Frame, Key, Layers, BarChart, Settings, LogOut, Users, Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function Component() {
  const [selectedProject, setSelectedProject] = useState("project-a")
  const [apiKey, setApiKey] = useState("")
  const [activeView, setActiveView] = useState("project-info")

  const { toast } = useToast()

  const generateApiKey = () => {
    const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setApiKey(key)
  }

  const projectInfo = {
    name: "Project A",
    description: "A cutting-edge web application",
    status: "Active",
    createdAt: "2023-06-01",
    lastUpdated: "2023-06-15",
  }

  const users = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Developer" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Viewer" },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Frame className="w-5 h-5 text-blue-500" />
          <span className="ml-2 text-base font-semibold">Dashboard</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project-a">Project A</SelectItem>
                <SelectItem value="project-b">Project B</SelectItem>
                <SelectItem value="project-c">Project C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
          <Button
              onClick={() => setActiveView("create-api-key")}
              className="ml-4 my-4 text-sm"
            >
              <Plus className="w-3 h-3 mr-2" />
              Create New API Key
            </Button>
            <Link
              href="#"
              onClick={() => setActiveView("project-info")}
              className={`flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 ${activeView === "project-info" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
            >
              <Layers className="w-4 h-4 mr-3" />
              Project Info
            </Link>
            <Link
              href="#"
              onClick={() => setActiveView("users")}
              className={`flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 ${activeView === "users" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
            >
              <Users className="w-4 h-4 mr-3" />
              Users
            </Link>
            <Link
              href="#"
              onClick={() => setActiveView("analytics")}
              className={`flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 ${activeView === "analytics" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
            >
              <BarChart className="w-4 h-4 mr-3" />
              Analytics
            </Link>
            <Link
              href="#"
              onClick={() => setActiveView("settings")}
              className={`flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 ${activeView === "settings" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>
         
          </div>
        </nav>
        {/* Profile Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2">
                <img
                  src="https://ui.shadcn.com/avatars/01.png"
                  alt="User avatar"
                  className="rounded-full mr-2"
                  width={32}
                  height={32}
                />
                <span>John Doe</span>
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeView === "project-info" && (
            <>
              <h1 className="text-2xl font-semibold mb-6">Project Information</h1>
              <Card>
                <CardHeader>
                  <CardTitle>{projectInfo.name}</CardTitle>
                  <CardDescription>{projectInfo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Status:</strong> {projectInfo.status}</p>
                    <p><strong>Created At:</strong> {projectInfo.createdAt}</p>
                    <p><strong>Last Updated:</strong> {projectInfo.lastUpdated}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeView === "users" && (
            <>
              <h1 className="text-2xl font-semibold mb-6">Users</h1>
              <Card>
                <CardHeader>
                  <CardTitle>User List</CardTitle>
                  <CardDescription>Manage users for your project</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {activeView === "create-api-key" && (
            <>
              <h1 className="text-2xl font-semibold mb-6">Create New API Key</h1>
              <Card>
                <CardHeader>
                  <CardTitle>API Key Details</CardTitle>
                  <CardDescription>Fill in the details to generate a new API key for your project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">API Key Name</Label>
                      <Input id="key-name" placeholder="Enter a name for your API key" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiration">Expiration</Label>
                      <Select>
                        <SelectTrigger id="expiration">
                          <SelectValue placeholder="Select expiration time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="30d">30 days</SelectItem>
                          <SelectItem value="90d">90 days</SelectItem>
                          <SelectItem value="no-expiration">No expiration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Required User Information</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 bg-gray-100 p-3 rounded-md">
                          <Label className="text-sm font-medium">General</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="name" />
                            <label htmlFor="name" className="text-sm">Name</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="email" />
                            <label htmlFor="email" className="text-sm">Email</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="phone" />
                            <label htmlFor="phone" className="text-sm">Phone</label>
                          </div>
                        </div>
                        <div className="space-y-2 bg-gray-100 p-3 rounded-md">
                          <Label className="text-sm font-medium">Tech-related</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="github" />
                            <label htmlFor="github" className="text-sm">GitHub Username</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="codeforces" />
                            <label htmlFor="codeforces" className="text-sm">Codeforces Rating</label>
                          </div>
                        </div>
                        <div className="space-y-2 bg-gray-100 p-3 rounded-md">
                          <Label className="text-sm font-medium">Finance-related</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="credit-score" />
                            <label htmlFor="credit-score" className="text-sm">Credit Score</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={generateApiKey}>Generate API Key</Button>
                </CardFooter>
              </Card>

              {apiKey && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Your New API Key</CardTitle>
                    <CardDescription>Make sure to copy your API key now. You won't be able to see it again!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Input value={apiKey} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey);
                          toast({
                            title: "Copied",
                            description: "API key copied to clipboard",
                            duration: 3000,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy API key</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}