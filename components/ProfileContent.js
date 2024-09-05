import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAccount } from 'wagmi';
import { ethers, parseUnits } from 'ethers';
import axios from 'axios';

export default function ProfileContent() {
  const [did, setDid] = useState(null);
  const { address } = useAccount();

  useEffect(() => {
    const fetchDid = async () => {
      try {
        const response = await axios.get(`/api/did/getdid?address=${address}`);
        setDid(`did:ethr:${response.data.did}`);
      } catch (error) {
        console.error('Error fetching DID:', error);
      }
    };
    fetchDid();
  }, [address]);

  const generateDID = async () => {
    // Generate key pair
    const wallet = ethers.Wallet.createRandom();
    const publicKey = wallet.publicKey;
    const privateKey = wallet.privateKey;

    // Generate initial DID document
    const didDocument = {
      "@context": "https://www.w3.org/ns/did/v1",
      "id": `did:ethr:${publicKey}`,
      "verificationMethod": [{
        "id": `did:ethr:${publicKey}#keys-1`,
        "type": "EcdsaSecp256k1VerificationKey2019",
        "controller": `did:ethr:${publicKey}`,
        "publicKeyHex": publicKey.slice(2)
      }]
    };

    try {
      // Send data to backend
      const response = await axios.post('/api/did/savedid', {
        address,
        publicKey,
        privateKey
      });
      setDid(`did:ethr:${publicKey}`);
    } catch (error) {
      console.error('Error saving DID:', error);
      alert('Error generating DID. Please try again.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">User Profile</h1>
      <p className="text-gray-600 mb-8 text-lg">View and edit your profile information.</p>
      {did ? (
        <div>
          <p>Your DID: {did}</p>
        </div>
      ) : (
        <Button onClick={generateDID} className="bg-black text-white hover:bg-gray-800">
          Generate My DID
        </Button>
      )}
    </div>
  );
}