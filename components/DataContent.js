import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Client } from '@xmtp/xmtp-js';
import { ExternalLink } from 'lucide-react';
import { IndexService } from "@ethsign/sp-sdk";

export default function DataContent() {
  const [approvedData, setApprovedData] = useState({});
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const indexService = new IndexService("mainnet");

  useEffect(() => {
    const fetchApprovedData = async () => {
      if (!walletClient || !address) return;
      try {
        const xmtp = await Client.create(walletClient, { env: 'production' });
        const conversations = await xmtp.conversations.list();
        const newApprovedData = {};

        for (const conversation of conversations) {
          const messages = await conversation.messages();
          for (const message of messages) {
            try {
              const content = JSON.parse(message.content);
              if (content.type === 'request_response' && content.approved && content.data) {
                const dataType = content.dataType || 'Unknown Type';
                if (!newApprovedData[dataType]) {
                  newApprovedData[dataType] = [];
                }
                newApprovedData[dataType].push(content.data);
              }
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          }
        }
        setApprovedData(newApprovedData);
      } catch (error) {
        console.error('Error fetching approved data:', error);
      }
    };
    fetchApprovedData();
  }, [walletClient, address]);

  const renderCredentialDetails = (credential) => {
    return Object.entries(credential).map(([field, value]) => (
      field !== 'signUrl' && (
        <p key={field} className="text-sm">
          <span className="font-semibold">{field.charAt(0).toUpperCase() + field.slice(1)}:</span> {value?.toString() || 'N/A'}
        </p>
      )
    ));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 text-center">Approved Data Requests</h1>
      {Object.keys(approvedData).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(approvedData).map(([dataType, credentials]) =>
            credentials.map((credential, index) => (
              <div key={`${dataType}-${index}`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 text-gray-700">
                  {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
                </h3>
                <div className="space-y-3">
                  {renderCredentialDetails(credential)}
                  {credential.signUrl && (
                    <a href={`https://scan.sign.global/attestation/${credential.signUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 mt-4">
                      Show Attestation <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <p className="text-center text-gray-600">No approved data requests found.</p>
      )}
    </div>
  );
}