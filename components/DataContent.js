import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FhenixClient, getPermit } from "fhenixjs";
import { BrowserProvider } from "ethers";
import { Clipboard } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function DataContent() {
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [provider, setProvider] = useState(null);
  const [fhenixClient, setFhenixClient] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeProvider = async () => {
      const newProvider = new BrowserProvider(window.ethereum);
      setProvider(newProvider);
    };
    initializeProvider();
  }, []);

  useEffect(() => {
    const initializeFhenixClient = async () => {
      if (!provider) return;
      try {
        const client = new FhenixClient({ provider });
        setFhenixClient(client);
      } catch (error) {
        console.error("Failed to initialize Fhenix client:", error);
      }
    };
    initializeFhenixClient();
  }, [provider]);

  const handleDecrypt = async () => {
    if (!fhenixClient) {
      toast({
        title: "Error",
        description: "Fhenix client is not initialized.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      console.log("Initializing provider...");
      const provider = new BrowserProvider(window.ethereum);
  
      console.log("Getting permit...");
      const permit = await getPermit(process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS, provider);
      console.log("Permit:", permit);
  
      console.log("Storing permit...");
      await fhenixClient.storePermit(permit);
  
      console.log("Decrypting input...");
      const decrypted = await fhenixClient.unseal(process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS, JSON.stringify(decryptInput));
      console.log("Decrypted result:", decrypted);
  
      setDecryptedOutput(`Unsealed result: ${decrypted}`);
    } catch (error) {
      console.error('Decryption error:', error);
      let errorMessage = 'An error occurred during decryption. Please try again.';
      if (error.message) {
        errorMessage = `Error details: ${error.message}`;
      }
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
      if (error.cause) {
        console.error('Error cause:', error.cause);
      }
      toast({
        title: "Decryption Error",
        description: errorMessage,
        variant: "destructive",
      });
      setDecryptedOutput(`Decryption failed: ${errorMessage}`);
    }
  };
  

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDecryptInput(text);
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
      toast({
        title: "Clipboard Error",
        description: "Failed to read from clipboard. Please try pasting manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Decrypt Data</h1>
      <div className="w-full max-w-md mb-4 flex">
        <Textarea
          placeholder="Enter encrypted data to decrypt"
          value={decryptInput}
          onChange={(e) => setDecryptInput(e.target.value)}
          className="flex-grow"
          rows={4}
        />
        <Button
          onClick={pasteFromClipboard}
          className="ml-2 p-2 self-start"
          variant="outline"
        >
          <Clipboard size={16} />
        </Button>
      </div>
      <Button
        onClick={handleDecrypt}
        className="bg-black hover:bg-gray-800 text-white mb-4"
      >
        Decrypt Data
      </Button>
      {decryptedOutput && (
        <div className="w-full max-w-md p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Decrypted Output:</h2>
          <p className="break-all">{decryptedOutput}</p>
        </div>
      )}
    </div>
  );
}
