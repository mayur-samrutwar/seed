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
      let lastRequest = null;
      let hasResponse = false;

      for (const msg of messages) {
        try {
          const content = JSON.parse(msg.content);
          if (content.type === 'approval_request' && msg.senderAddress !== address) {
            lastRequest = {
              id: msg.id,
              company: content.company,
              data: content.data,
              peerAddress: msg.senderAddress,
              timestamp: msg.sent
            };
          } else if (content.type === 'request_response' && lastRequest) {
            hasResponse = true;
            break;
          }
        } catch (error) {
          // Ignore non-JSON messages
        }
      }

      if (lastRequest && !hasResponse) {
        requests.push(lastRequest);
      }
    }
    setApprovalRequests(requests);
  };

  const handleApproval = async (requestId, isApproved) => {
    if (!xmtp) return;

    const request = approvalRequests.find(req => req.id === requestId);
    if (!request) return;

    try {
      const conversation = await xmtp.conversations.newConversation(request.peerAddress);
      const response = {
        type: 'request_response',
        requestId: requestId,
        approved: isApproved
      };
      await conversation.send(JSON.stringify(response));

      // Remove the request from the list
      setApprovalRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to send response:', error);
      setError('Failed to send response. Please try again.');
    }
  };

  const formatRequestedData = (data) => {
    const requestedFields = [];
    for (const [key, value] of Object.entries(JSON.parse(data))) {
      if (value === true) {
        requestedFields.push(key.charAt(0).toUpperCase() + key.slice(1));
      } else if (typeof value === 'object' && value.operator && value.value) {
        requestedFields.push(`${key.charAt(0).toUpperCase() + key.slice(1)} ${value.operator} ${value.value}`);
      }
    }
    return requestedFields.join(', ');
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
                  <p className="text-sm mb-2">Requested data: {formatRequestedData(request.data)}</p>
                  <p className="text-sm text-gray-500 mb-4">Received: {new Date(request.timestamp).toLocaleString()}</p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => handleApproval(request.id, true)}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval(request.id, false)}
                      variant="outline"
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