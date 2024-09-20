import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWriteContract, useSwitchChain, useChainId } from 'wagmi';
import abi from '@/contracts/abi/did.json';
import { JsonRpcProvider } from "ethers";
import { FhenixClient } from "fhenixjs";

export default function IssueCredentialContent() {
  const [fhenixClient, setFhenixClient] = useState(null);

  useEffect(() => {
    const initializeFhenixClient = async () => {
      try {
        const provider = new JsonRpcProvider('https://api.helium.fhenix.zone');
        const client = new FhenixClient({ provider });
        await client.init(); // Ensure the client is properly initialized
        return client;
      } catch (error) {
        console.error("Failed to initialize Fhenix client:", error);
        throw error;
      }
    };
  }, []);
  const { toast } = useToast();
  const [credentialType, setCredentialType] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newSchemaName, setNewSchemaName] = useState("");
  const [newSchemaFields, setNewSchemaFields] = useState([{ name: "", type: "string", value: "", isEncrypted: false }]);
  const [existingSchemas, setExistingSchemas] = useState([]);
  const [customSchemaValues, setCustomSchemaValues] = useState({});
  const [provider, setProvider] = useState(null);

  const { writeContract, isLoading: isContractWriteLoading, isSuccess, isError } = useWriteContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: "addCredential",
  });
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  useEffect(() => {
    setProvider(new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL));
  }, []);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const response = await fetch('/api/schema/getAllSchema');
        const data = await response.json();
        if (Array.isArray(data)) {
          setExistingSchemas(data);
        } else {
          console.error('Fetched data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching schemas:', error);
      }
    };

    fetchSchemas();
  }, []);

  const issueCredential = async () => {
    setIsProcessingDialogOpen(true);
    setIsLoading(true);
  
    try {
      if (credentialType === 'new') {
        // Save new schema to the database
        const response = await fetch('/api/schema/addSchema', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newSchemaName,
            fields: newSchemaFields,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to add new schema');
        }
  
        // After successfully adding the schema, update the existing schemas list
        setExistingSchemas([...existingSchemas, { name: newSchemaName, fields: newSchemaFields }]);
      }
  
      const fhenixClient = new FhenixClient({ provider });
  
      const publicDataKeys = [];
      const publicDataValues = [];
      const encryptedDataKeys = [];
      const encryptedDataValues = [];
  
      const schemaFields = credentialType === 'new' ? newSchemaFields : existingSchemas.find(s => s.name === credentialType).fields;
  
      for (const field of schemaFields) {
        if (field.isEncrypted) {
          encryptedDataKeys.push(field.name);
          const encryptedValue = await fhenixClient.encrypt_uint256(parseInt(field.value));
          encryptedDataValues.push(encryptedValue);
        } else {
          publicDataKeys.push(field.name);
          publicDataValues.push(parseInt(field.value));
        }
      }
  
      await writeContract({
        args: [
          credentialType === 'new' ? newSchemaName : credentialType,
          publicDataKeys,
          encryptedDataKeys,
          publicDataValues,
          encryptedDataValues,
        ],
      });
  
      toast({
        title: "Success",
        description: "Credential issued successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error issuing credential:', error);
      toast({
        title: "Error",
        description: `Failed to issue credential. Please try again. Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const resetForm = () => {
    setWalletAddress("");
    setCurrentStep(1);
    setIsProcessingDialogOpen(false);
    setCustomSchemaValues({});
    setNewSchemaName("");
    setNewSchemaFields([{ name: "", type: "string", value: "", isEncrypted: false }]);
    setCredentialType("");
  };

  const handleAddField = () => {
    setNewSchemaFields([...newSchemaFields, { name: "", type: "string", value: "", isEncrypted: false }]);
  };

  const handleRemoveField = (index) => {
    const updatedFields = newSchemaFields.filter((_, i) => i !== index);
    setNewSchemaFields(updatedFields);
  };

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...newSchemaFields];
    updatedFields[index][key] = value;
    setNewSchemaFields(updatedFields);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderCredentialTypeSelection();
      case 2:
        return renderCredentialDetails();
      case 3:
        return renderUserAddress();
      case 4:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderCredentialTypeSelection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Credential Type</label>
        <Select value={credentialType} onValueChange={(value) => setCredentialType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select credential type" />
          </SelectTrigger>
          <SelectContent>
            {existingSchemas.map((schema, index) => (
              <SelectItem key={index} value={schema.name}>{schema.name}</SelectItem>
            ))}
            <SelectItem value="new">Create New Type</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderCredentialDetails = () => {
    if (credentialType === 'new') {
      return renderNewSchemaCreation();
    } else {
      return renderExistingSchemaDetails();
    }
  };

  const renderNewSchemaCreation = () => (
    <div className="space-y-6">
      <Input
        type="text"
        placeholder="Enter Credential name"
        value={newSchemaName}
        onChange={(e) => setNewSchemaName(e.target.value)}
        className="w-full"
      />
      {newSchemaFields.map((field, index) => (
        <div key={index} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Field name"
            value={field.name}
            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
            className="w-1/5"
          />
          <Select
            value={field.type}
            onValueChange={(value) => handleFieldChange(index, 'type', value)}
          >
            <SelectTrigger className="w-1/5">
              <SelectValue placeholder="Field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="address">Address</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            placeholder="Field value"
            value={field.value}
            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
            className="w-1/5"
          />
          <Select
            value={field.isEncrypted.toString()}
            onValueChange={(value) => handleFieldChange(index, 'isEncrypted', value === 'true')}
          >
            <SelectTrigger className="w-1/5">
              <SelectValue placeholder="Encrypted?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Encrypted</SelectItem>
              <SelectItem value="false">Not Encrypted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleRemoveField(index)} variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={handleAddField} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Field
      </Button>
    </div>
  );

  const renderExistingSchemaDetails = () => {
    const schema = existingSchemas.find(s => s.name === credentialType);
    return (
      <div className="space-y-6">
        {schema && schema.fields.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.name}</label>
            <div className="flex space-x-2">
              {field.type === 'boolean' ? (
                <Select
                  value={customSchemaValues[field.name]?.value || ''}
                  onValueChange={(value) => setCustomSchemaValues({...customSchemaValues, [field.name]: {...customSchemaValues[field.name], value}})}
                >
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  placeholder={`Enter ${field.name}`}
                  value={customSchemaValues[field.name]?.value || ''}
                  onChange={(e) => setCustomSchemaValues({...customSchemaValues, [field.name]: {...customSchemaValues[field.name], value: e.target.value}})}
                  className="w-1/2"
                />
              )}
              <Select
                value={customSchemaValues[field.name]?.isEncrypted?.toString() || 'false'}
                onValueChange={(value) => setCustomSchemaValues({...customSchemaValues, [field.name]: {...customSchemaValues[field.name], isEncrypted: value === 'true'}})}
              >
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder="Encrypted?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Encrypted</SelectItem>
                  <SelectItem value="false">Not Encrypted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderUserAddress = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User Address</label>
        <Input type="text" placeholder="Enter wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full" />
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Confirm Details</h3>
      <p><span className="font-medium">Credential Type:</span> {credentialType === 'new' ? newSchemaName : credentialType}</p>
      <p><span className="font-medium">Wallet Address:</span> {walletAddress}</p>
      {credentialType === 'new' ? (
        newSchemaFields.map((field, index) => (
          <p key={index}>
            <span className="font-medium">{field.name}:</span> {field.value} 
            <span className="ml-2 text-sm text-gray-500">({field.isEncrypted ? 'Encrypted' : 'Not Encrypted'})</span>
          </p>
        ))
      ) : (
        Object.entries(customSchemaValues).map(([key, { value, isEncrypted }]) => (
          <p key={key}>
            <span className="font-medium">{key}:</span> {value} 
            <span className="ml-2 text-sm text-gray-500">({isEncrypted ? 'Encrypted' : 'Not Encrypted'})</span>
          </p>
        ))
      )}
      <Button
        onClick={issueCredential}
        disabled={isLoading || isContractWriteLoading}
        className="w-full bg-black hover:bg-gray-800 text-white mt-4"
      >
        Issue Credential
      </Button>
    </div>
  );

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900 text-center">Issue New Credential</h1>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
        <div className="flex justify-between mb-8 relative">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`flex flex-col items-center ${currentStep >= step ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step ? 'border-gray-600 bg-gray-100' : 'border-gray-300'}`}>
                {currentStep > step ? '✓' : step} 
              </div>
              <span className="mt-2 text-xs text-black">
                {step === 1 ? 'Select' : step === 2 ? 'Enter Details' : step === 3 ? 'User Address' : 'Review'}
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
              Next
            </Button>
          )}
        </div>

        <Dialog open={isProcessingDialogOpen} onOpenChange={setIsProcessingDialogOpen}>
          <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center space-y-4">
              {isLoading || isContractWriteLoading ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">Processing</h3>
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Processing transaction...</span>
                  </div>
                </>
              ) : isSuccess ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">Success</h3>
                  <p className="text-green-600 font-medium">Credential issued successfully!</p>
                </>
              ) : isError ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">Error</h3>
                  <p className="text-red-600 font-medium">Transaction failed. Please try again.</p>
                </>
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
      </div>
    </div>
  );
}
