import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function IssueCredentialContent() {
  const [credentialType, setCredentialType] = useState("aadhar")
  const [walletAddress, setWalletAddress] = useState("")
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [post, setPost] = useState("")
  const [salary, setSalary] = useState("")
  const [yoe, setYoe] = useState("")

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Seed DID</label>
          <Input type="text" placeholder="Enter Seed DID" onChange={(e) => setWalletAddress(e.target.value)} className="w-full" />
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
}