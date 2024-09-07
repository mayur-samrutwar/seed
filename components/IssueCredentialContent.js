import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SignProtocolClient, SpMode, OffChainSignType } from "@ethsign/sp-sdk"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function IssueCredentialContent() {
  const { toast } = useToast()
  const [credentialType, setCredentialType] = useState("aadhar")
  const [walletAddress, setWalletAddress] = useState("")
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [dob, setDob] = useState("")
  const [post, setPost] = useState("")
  const [salary, setSalary] = useState("")
  const [doj, setDoj] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const formatDob = (dob) => {
    const date = new Date(dob);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const handleCreateAttestation = async () => {
    setIsLoading(true)
    try {
      const client = new SignProtocolClient(SpMode.OffChain, {
        signType: OffChainSignType.EvmEip712
      });

      const aadharSchemaId = 'SPS_JkbwYNcmsJVgICFWJipMV';
      const jobSchemaId = ''

      const res = await client.createAttestation({
        schemaId: credentialType === 'aadhar' ? aadharSchemaId : jobSchemaId,
        data: credentialType === 'aadhar' 
          ? { name: name, gender: gender }
          : { post, salary },
        recipients: [walletAddress],
        indexingValue: '4'
      });

      setCurrentStep(3)
      toast({
        title: "Success!",
        description: "Credential has been issued successfully.",
      })
      resetForm()
    } catch (error) {
      console.error('Error creating attestation:', error);
      toast({
        title: "Error",
        description: "Failed to issue credential. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  };

  const resetForm = () => {
    setWalletAddress("")
    setName("")
    setGender("")
    setDob("")
    setPost("")
    setSalary("")
    setDoj("")
    setCurrentStep(1)
    setIsDialogOpen(false)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col space-y-4">
            <Input type="text" placeholder="Wallet Address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
            {credentialType === 'aadhar' ? (
              <>
                <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Select value={gender} onValueChange={(value) => setGender(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </>
            ) : (
              <>
                <Input type="text" placeholder="Designation" value={post} onChange={(e) => setPost(e.target.value)} />
                <Input type="number" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
                <Input type="date" value={doj} onChange={(e) => setDoj(e.target.value)} />
              </>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirm Details</h3>
            <p><span className="font-semibold">Wallet Address:</span>{walletAddress}</p>
            {credentialType === 'aadhar' ? (
              <>
                <p><span className="font-semibold">Name:</span> <span className="text-gray-700">{name}</span></p>
                <p><span className="font-semibold">Gender:</span> <span className="text-gray-700">{gender}</span></p>
                <p><span className="font-semibold">Date of Birth:</span> <span className="text-gray-700">{dob}</span></p>
              </>
            ) : (
              <>
                <p><span className="font-semibold">Designation:</span> <span className="text-gray-700">{post}</span></p>
                <p><span className="font-semibold">Salary:</span> <span className="text-gray-700">{salary}</span></p>
                <p><span className="font-semibold">Date of Joining:</span> <span className="text-gray-700">{doj}</span></p>
              </>
            )}
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Credential Issued Successfully</h3>
            <p>Your credential has been issued and sent to the provided wallet address.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Issue New Credential</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credential Type</label>
          <Select value={credentialType} onValueChange={(value) => setCredentialType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select credential type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aadhar">Aadhar Card</SelectItem>
              <SelectItem value="job">Job Details</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-6 bg-black text-white hover:bg-gray-800">Issue Credential</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-6">
            <div className="flex justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-1/3 text-center ${
                    currentStep === step ? 'font-bold' : 'text-gray-400'
                  }`}
                >
                  Step {step}
                </div>
              ))}
            </div>
            <div className="py-6">
              {renderStepContent()}
            </div>
            <div className="flex justify-between mt-6">
              {currentStep < 3 && (
                <Button
                  onClick={() => currentStep === 2 ? handleCreateAttestation() : setCurrentStep((prev) => prev + 1)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentStep === 2 ? (isLoading ? 'Issuing...' : 'Issue Credential') : 'Next'}
                </Button>
              )}
              {currentStep === 3 && (
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}