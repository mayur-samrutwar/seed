import { useState, useEffect } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { useAccount, useWalletClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApprovalRequestContent() {
  const [xmtp, setXmtp] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [error, setError] = useState('');

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const initXmtp = async () => {
      if (walletClient && !xmtp) {
        try {
          const xmtpClient = await Client.create(walletClient, { env: 'production' });
          setXmtp(xmtpClient);
          loadApprovalRequests(xmtpClient);
        } catch (error) {
          console.error('Failed to initialize XMTP client:', error);
          setError('Failed to initialize XMTP client. Please try again.');
        }
      }
    };

    initXmtp();
  }, [walletClient, xmtp]);

  const loadApprovalRequests = async (client) => {
    const conversations = await client.conversations.list();
    const requests = [];

    for (const conversation of conversations) {
      const messages = await conversation.messages();
      for (const msg of messages) {
        try {
          const content = JSON.parse(msg.content);
          if (content.type === 'approval_request') {
            requests.push({
              id: msg.id,
              company: content.company,
              data: content.data,
              peerAddress: conversation.peerAddress
            });
          }
        } catch (error) {
          // Ignore non-JSON messages
        }
      }
    }

    setApprovalRequests(requests);
  };

  const handleApproval = async (requestId, isApproved) => {
    console.log(`Request ${requestId} ${isApproved ? 'approved' : 'rejected'}`);
    // Remove the request from the list
    setApprovalRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
  };

  if (!address) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Approval Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {approvalRequests.length === 0 ? (
          <p className="text-center text-gray-500">No pending approval requests</p>
        ) : (
          <div className="space-y-4">
            {approvalRequests.map((request) => (
              <Card key={request.id} className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{request.company} Data Request</h3>
                  <p className="text-sm text-gray-600 mb-2">From: {request.peerAddress}</p>
                  <p className="text-sm mb-4">Requested data: {request.data}</p>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      onClick={() => handleApproval(request.id, true)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleApproval(request.id, false)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}