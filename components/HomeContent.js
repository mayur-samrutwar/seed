import { Loader2 } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { Button } from "@/components/ui/button";
import abi from '@/contracts/abi/did.json';

export default function HomeContent() {
  const { address, isConnected } = useAccount();

  const { data: credentials, isError, isLoading, error, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getAllCredentialsOfUser',
    account: address,
    enabled: isConnected && address !== undefined,
  });

  const renderCredentialDetails = (credential) => {
    if (credential.credentialType === 0) { // Aadhar
      return (
        <>
          <p><span className="font-semibold">Name:</span> {credential.aadhar.name}</p>
          <p><span className="font-semibold">Gender:</span> {credential.aadhar.gender}</p>
        </>
      );
    } else { // Job
      return (
        <>
          <p><span className="font-semibold">Company ID:</span> 
          Y Combinator
          </p>
          <p><span className="font-semibold">Joining Date:</span> {`${credential.job.joiningDate.toString().slice(-8, -6)}-${credential.job.joiningDate.toString().slice(-6, -4)}-${credential.job.joiningDate.toString().slice(-4)}`}</p>
          <p><span className="font-semibold">Designation:</span> {credential.job.designation}</p>
        </>
      );
    }
  };

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
              <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 text-gray-700">
                {credential.credentialType === 0 ? 'Aadhar' : 'Job'}
              </h3>
              <div className="space-y-3">
                {renderCredentialDetails(credential)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No credentials found.</p>
      )}
    </div>
  );
}