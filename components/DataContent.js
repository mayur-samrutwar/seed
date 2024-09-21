import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DataContent() {
  const [sealedOutput, setSealedOutput] = useState('');

  const handleDecrypt = () => {
    // Implement decryption logic here
    console.log('Decrypting:', sealedOutput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Sealed Output</h1>
      <Input
        type="text"
        placeholder="Enter sealed output"
        value={sealedOutput}
        onChange={(e) => setSealedOutput(e.target.value)}
        className="w-full max-w-md mb-4"
      />
      <Button
        onClick={handleDecrypt}
        className="bg-black hover:bg-gray-800 text-white"
      >
        Decrypt Data
      </Button>
    </div>
  );
}