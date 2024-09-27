import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FhenixClient } from "fhenixjs";
import { BrowserProvider } from "ethers";

export default function DataContent() {
  const [inputNumber, setInputNumber] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');

  const handleEncrypt = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const fhenixClient = new FhenixClient({ provider });
      const encryptedValue = await fhenixClient.encrypt_uint256(BigInt(inputNumber));
      setEncryptedOutput(encryptedValue.data.toString());
    } catch (error) {
      console.error('Encryption error:', error);
      setEncryptedOutput('Error occurred during encryption');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Encrypt Data</h1>
      <Input
        type="number"
        placeholder="Enter a number"
        value={inputNumber}
        onChange={(e) => setInputNumber(e.target.value)}
        className="w-full max-w-md mb-4"
      />
      <Button
        onClick={handleEncrypt}
        className="bg-black hover:bg-gray-800 text-white mb-4"
      >
        Encrypt Data
      </Button>
      <div className="w-full max-w-md p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Encrypted Output (euint256):</h2>
        <p className="break-all">{encryptedOutput}</p>
      </div>
    </div>
  );
}
