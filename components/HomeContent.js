import { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useAccount, useReadContract, useChainId, useSwitchChain } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import abi from '@/contracts/abi/did.json';
import { IndexService } from "@ethsign/sp-sdk";

export default function HomeContent() {
  const [isFhenixSwitchDialogOpen, setIsFhenixSwitchDialogOpen] = useState(false);
  const [isLoadingDialogOpen, setIsLoadingDialogOpen] = useState(false);
  const [isAttestationDialogOpen, setIsAttestationDialogOpen] = useState(false);
  const [attestationData, setAttestationData] = useState(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const indexService = new IndexService("mainnet");

  const { data: credentials, isError, isLoading, error, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getAllCredentialsOfUser',
    account: address,
    enabled: isConnected && address !== undefined,
  });

  useEffect(() => {
    if (isLoading) {
      setIsLoadingDialogOpen(true);
    } else {
      setIsLoadingDialogOpen(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isConnected && chainId !== 8008135) {
      setIsFhenixSwitchDialogOpen(true);
    }
  }, [isConnected, chainId]);

  const fetchAttestationData = async (attestationId) => {
    setIsLoadingDialogOpen(true);
    try {
      const data = await indexService.queryAttestation(attestationId);
      setAttestationData(data);
      setIsAttestationDialogOpen(true);
    } catch (error) {
      console.error("Error fetching attestation data:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoadingDialogOpen(false);
    }
  };

  const renderCredentialDetails = (credential) => {
    if (credential.credentialType === 0) { // Aadhar
      return (
        <>
          <p><span className="font-semibold">Name:</span> {credential.aadhar.name}</p>
          <p><span className="font-semibold">Gender:</span> {credential.aadhar.gender}</p>
          <p className="flex items-center">
            <span className="flex items-center">
              {credential.aadhar.signUrl ? (
                <Button onClick={() => fetchAttestationData(credential.aadhar.signUrl)}>
                  Show Attestation
                </Button>
              ) : 'No'}
            </span>
          </p>
        </>
      );
    } else { // Job
      return (
        <>
          <p><span className="font-semibold">Company ID:</span> 
          {/* {credential.job.companyId.toString()} */}
          Y Combinator
          </p>
          <p><span className="font-semibold">Joining Date:</span> {`${credential.job.joiningDate.toString().slice(-8, -6)}-${credential.job.joiningDate.toString().slice(-6, -4)}-${credential.job.joiningDate.toString().slice(-4)}`}</p>
          <p><span className="font-semibold">Designation:</span> {credential.job.designation}</p>
          <p className="flex items-center">
            <span className="flex items-center">
              {credential.job.signUrl ? (
                <Button onClick={() => fetchAttestationData(credential.job.signUrl)}>
                  Show Attestation
                </Button>
              ) : 'No'}
            </span>
          </p>
        </>
      );
    }
  };

  const renderAttestationDetails = () => {
    console.log(attestationData)
    if (!attestationData) return <p>No attestation data available.</p>;

    return (
      <div className="space-y-3">
        <p><span className="font-semibold">Attestation ID:</span> {attestationData.id}</p>
        <p><span className="font-semibold">Issuer:</span> {attestationData.attester}</p>
        <p><span className="font-semibold">Issued to:</span> {attestationData.recipients[0]}</p>
        <p><span className="font-semibold">Issued at:</span> {new Date(Number(attestationData.attestTimestamp)).toLocaleString()}</p>
        <p><span className="font-semibold">Expiry:</span> {attestationData.validUntil ? (attestationData.validUntil === "0" ? 'Never' : new Date(attestationData.validUntil * 1000).toLocaleString()) : 'N/A'}</p>
        <a href={`https://scan.sign.global/attestation/${attestationData.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:text-blue-600">
        Show on Sign Scan <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
    );
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
      {isError ? (
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
      <Dialog open={isFhenixSwitchDialogOpen} onOpenChange={setIsFhenixSwitchDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Switch to Fhenix Network</h3>
          <p className="mb-4">Please switch to Fhenix Network to view your credentials.</p>
          <Button
            onClick={() => {
              switchChain({ chainId: 8008135 });
              setIsFhenixSwitchDialogOpen(false);
            }}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            Switch to Fhenix Network
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isLoadingDialogOpen} onOpenChange={setIsLoadingDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isAttestationDialogOpen} onOpenChange={setIsAttestationDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Attestation Details</h3>
          {renderAttestationDetails()}
        </DialogContent>
      </Dialog>
    </div>
  );
}