import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState('initial');
  const [did, setDid] = useState('');
  const [selectedCredential, setSelectedCredential] = useState('');

  const mockDIDData = {
    did: 'did:example:123456789abcdefghi',
    credentials: ['EmployeeCredential', 'AadharCredential']
  };

  const mockCredentialData = {
    EmployeeCredential: { 
      status: 'Verified', 
      companyName: 'TechCorp',
      position: 'Software Engineer',
      startDate: '2022-01-15'
    },
    AadharCredential: { 
      status: 'Verified', 
      name: 'John Doe',
      ageAbove18: true,
      addressVerified: true
    }
  };

  const handleResolve = () => {
    // In a real app, this would fetch data from the blockchain
    setStep('resolved');
  };

  const handleViewCredential = (credential) => {
    setSelectedCredential(credential);
    setStep('credentialView');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DID Resolver</h1>
      
      {step === 'initial' && (
        <div>
          <input 
            type="text" 
            placeholder="Enter DID" 
            className="border p-2 mr-2"
            value={did}
            onChange={(e) => setDid(e.target.value)}
          />
          <button 
            onClick={handleResolve}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Resolve DID
          </button>
        </div>
      )}

      {step === 'resolved' && (
        <div>
          <h2 className="text-xl font-semibold mt-4">Resolved DID: {mockDIDData.did}</h2>
          <h3 className="text-lg font-semibold mt-2">Credentials:</h3>
          <ul>
            {mockDIDData.credentials.map((cred) => (
              <li key={cred} className="flex items-center mt-2">
                <span>{cred}</span>
                <button 
                  onClick={() => handleViewCredential(cred)}
                  className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-sm"
                >
                  View/Verify
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'credentialView' && (
        <div>
          <h2 className="text-xl font-semibold mt-4">{selectedCredential}</h2>
          <p>Status: {mockCredentialData[selectedCredential].status}</p>
          {Object.entries(mockCredentialData[selectedCredential]).map(([key, value]) => {
            if (key !== 'status') {
              return <p key={key}>{key}: {value.toString()}</p>
            }
          })}
          <button 
            onClick={() => setStep('resolved')}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Back to DID
          </button>
        </div>
      )}
    </div>
  );
}