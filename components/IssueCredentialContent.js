import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SignProtocolClient, SpMode, OffChainSignType } from "@ethsign/sp-sdk"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWriteContract, useSwitchChain, useChainId } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import abi from '@/contracts/abi/did.json'

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
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [transactionResult, setTransactionResult] = useState(null)
  const [isMainnetSwitchDialogOpen, setIsMainnetSwitchDialogOpen] = useState(false)
  const [isFhenixSwitchDialogOpen, setIsFhenixSwitchDialogOpen] = useState(false)
  const [attestationId, setAttestationId] = useState(null)

  const { writeContract, isLoading: isContractWriteLoading, isSuccess, isError } = useWriteContract()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()

  const formatDob = (dob) => {
    const date = new Date(dob);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const createAttestation = async () => {
    setIsProcessingDialogOpen(true)
    setIsLoading(true)
    try {
      const client = new SignProtocolClient(SpMode.OffChain, {
        signType: OffChainSignType.EvmEip712
      });

      if (credentialType === 'aadhar') {
        const aadharSchemaId = 'SPS_JkbwYNcmsJVgICFWJipMV';
        const id = await client.createAttestation({
          schemaId: aadharSchemaId,
          data: { name: name, gender: gender },
          recipients: [walletAddress],
          indexingValue: '4'
        });
        setAttestationId(id);
      } else {
        const jobSchemaId = 'SPS_pJ2DeXAr033pnItPEQwHH';
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        const validUntil = Math.floor(oneYearFromNow.getTime() / 1000);
        const id = await client.createAttestation({
          schemaId: jobSchemaId,
          data: { companyId: 1, doj: formatDob(doj), designation: post },
          recipients: [walletAddress],
          indexingValue: '4',
          validUntil: validUntil
        });
        setAttestationId(id);
      }
      setCurrentStep(4);
    } catch (error) {
      console.error('Error creating attestation:', error);
      toast({
        title: "Error",
        description: "Failed to create attestation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsProcessingDialogOpen(false)
    }
  };

  const issueCredential = async () => {
    setIsProcessingDialogOpen(true)
    setIsLoading(true)
    try {
      if (chainId !== 8008135) {
        setIsFhenixSwitchDialogOpen(true)
        return
      }
      let result;
      if (credentialType === 'aadhar') {
        result = await writeContract({
          address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
          abi: abi,
          functionName: 'addAadharCredential',
          args: [walletAddress, name, gender, formatDob(dob), attestationId],
        });
      } else {
        result = await writeContract({
          address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
          abi: abi,
          functionName: 'addJobCredential',
          args: [walletAddress, 1, formatDob(doj), post, salary, attestationId],
        });
      }
      setTransactionResult(result)
    } catch (error) {
      console.error('Error issuing credential:', error);
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
    setTransactionResult(null)
    setIsProcessingDialogOpen(false)
    setIsMainnetSwitchDialogOpen(false)
    setIsFhenixSwitchDialogOpen(false)
    setAttestationId(null)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <Input type="text" placeholder="Enter wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {credentialType === 'aadhar' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <Select value={gender} onValueChange={(value) => setGender(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <Input type="text" placeholder="Enter designation" value={post} onChange={(e) => setPost(e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <Input type="number" placeholder="Enter salary" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                  <Input type="date" value={doj} onChange={(e) => setDoj(e.target.value)} className="w-full" />
                </div>
              </>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Details</h3>
            <p><span className="font-medium">Credential Type:</span> {credentialType === 'aadhar' ? 'Aadhar Card' : 'Job Details'}</p>
            <p><span className="font-medium">Wallet Address:</span> {walletAddress}</p>
            {credentialType === 'aadhar' ? (
              <>
                <p><span className="font-medium">Name:</span> {name}</p>
                <p><span className="font-medium">Gender:</span> {gender}</p>
                <p><span className="font-medium">Date of Birth:</span> {dob}</p>
              </>
            ) : (
              <>
                <p><span className="font-medium">Designation:</span> {post}</p>
                <p><span className="font-medium">Salary:</span> {salary}</p>
                <p><span className="font-medium">Date of Joining:</span> {doj}</p>
              </>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Issue Credential</h3>
            <p>Attestation has been created. Click the button below to issue the credential on Fhenix Helium.</p>
            <Button
              onClick={issueCredential}
              disabled={isLoading || isContractWriteLoading}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Issue Credential
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 3) {
      if (chainId !== mainnet.id) {
        setIsMainnetSwitchDialogOpen(true);
      } else {
        createAttestation();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Issue New Credential</h1>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
        <div className="flex justify-between mb-8 relative">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`flex flex-col items-center ${currentStep >= step ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step ? 'border-gray-600 bg-gray-100' : 'border-gray-300'}`}>
                {currentStep > step ? '✓' : step}
              </div>
              <span className="mt-2 text-xs text-black">
                {step === 1 ? 'Select' : step === 2 ? 'Enter Details' : step === 3 ? 'Review' : 'Issue'}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>
        </div>

        {renderStepContent()}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button onClick={handleBack} className="bg-gray-300 hover:bg-gray-400 text-black">
              Back
            </Button>
          )}
          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              disabled={isLoading || isContractWriteLoading}
              className="ml-auto bg-black hover:bg-gray-800 text-white"
            >
              {currentStep < 3 ? 'Next' : 'Create Attestation'}
            </Button>
          )}
        </div>

        <Dialog open={isProcessingDialogOpen} onOpenChange={setIsProcessingDialogOpen}>
          <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold mb-2">Processing</h3>
              {isLoading || isContractWriteLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Processing transaction...</span>
                </div>
              ) : isSuccess ? (
                <div>
                  <p className="text-green-600 font-medium">Transaction successful!</p>
                </div>
              ) : isError ? (
                <p className="text-red-600 font-medium">Transaction failed. Please try again.</p>
              ) : null}
              {!isLoading && !isContractWriteLoading && (
                <Button
                  onClick={resetForm}
                  className="w-full bg-black hover:bg-gray-800 text-white mt-4"
                >
                  Close
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isMainnetSwitchDialogOpen} onOpenChange={setIsMainnetSwitchDialogOpen}>
          <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Switch to Mainnet</h3>
            <p className="mb-4">Please switch to Mainnet to create the attestation.</p>
            <Button 
              onClick={() => {
                switchChain({ chainId: mainnet.id })
                setIsMainnetSwitchDialogOpen(false)
                createAttestation()
              }} 
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Switch to Mainnet
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={isFhenixSwitchDialogOpen} onOpenChange={setIsFhenixSwitchDialogOpen}>
          <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Switch to Fhenix Helium</h3>
            <p className="mb-4">Please switch to Fhenix Helium to issue the credential.</p>
            <Button 
              onClick={async () => {
                await switchChain({ chainId: 8008135 })
                setIsFhenixSwitchDialogOpen(false)
                issueCredential()
              }} 
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Switch to Fhenix Helium
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}