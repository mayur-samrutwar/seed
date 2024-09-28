import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FhenixClient } from "fhenixjs";
import { BrowserProvider } from "ethers";
import { Clipboard } from 'lucide-react';

export default function DataContent() {
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');

  const handleDecrypt = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const fhenixClient = new FhenixClient({ provider });
      // Use the correct method for decryption
      const decryptedValue = await fhenixClient.unseal_uint256(decryptInput);
      setDecryptedOutput(decryptedValue.toString());
    } catch (error) {
      console.error('Decryption error:', error);
      setDecryptedOutput('Error occurred during decryption');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDecryptInput(text);
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
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
      <div className="w-full max-w-md p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Decrypted Output:</h2>
        <p className="break-all">{decryptedOutput}</p>
      </div>
    </div>
  );
}
