import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import abi from '@/contracts/abi/did.json';

export default function HomeContent() {
  const { address, isConnected } = useAccount();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedCredId, setSelectedCredId] = useState(null);
  const [shareAddress, setShareAddress] = useState('');
  const [sharedCredential, setSharedCredential] = useState(null);

  const { data: credentials, isError, isLoading, error, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getCredentials',
    account: address,
    enabled: isConnected && address !== undefined,
  });

  const { writeContract, isLoading: isSharing } = useWriteContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'shareCredential',
  });

  const handleShare = async (credId) => {
    setSelectedCredId(credId);
    setIsShareDialogOpen(true);
  };

  const confirmShare = async () => {
    try {
      const result = await writeContract({
        args: [selectedCredId, shareAddress],
      });
      setSharedCredential(result);
    } catch (error) {
      console.error('Error sharing credential:', error);
    }
  };

  const renderCredentialDetails = (credential) => (
    <div className="space-y-2">
      <p><span className="font-semibold">ID:</span> {credential.credId.toString()}</p>
      <p><span className="font-semibold">Type:</span> {credential.credType}</p>
      {credential.publicDataKeys.map((key, index) => (
        <p key={index}><span className="font-semibold">{key}:</span> {credential.publicDataValues[index].toString()}</p>
      ))}
      {credential.encryptedDataKeys.map((key, index) => (
        <p key={index}><span className="font-semibold">{key}:</span> encrypted</p>
      ))}
    </div>
  );

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">My Credentials</h1>
        <p className="text-lg text-gray-600">Please connect your wallet to view your credentials.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 text-center">My Credentials</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center text-red-500">
          <p>Error loading credentials: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
            Retry
          </Button>
        </div>
      ) : credentials && credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((credential, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {renderCredentialDetails(credential)}
              <Button 
                onClick={() => handleShare(credential.credId)} 
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Share
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No credentials found.</p>
      )}

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Credential</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter recipient address"
            value={shareAddress}
            onChange={(e) => setShareAddress(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={confirmShare} disabled={isSharing}>
              {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm'}
            </Button>
          </DialogFooter>
          {sharedCredential && (
            <div className="mt-4">
              <h4 className="font-semibold">Shared Credential:</h4>
              <p>{sharedCredential}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}