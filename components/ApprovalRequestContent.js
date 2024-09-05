import { useState, useEffect } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { useAccount, useWalletClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApprovalRequestContent() {
  const [xmtp, setXmtp] = useState(null);
  const [error, setError] = useState('');
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const checkNetwork = async () => {
      if (walletClient) {
        try {
          const isOnNetwork = await Client.canMessage(address);
          setIsOnNetwork(isOnNetwork);
          if (isOnNetwork) {
            await initXmtp();
          }
        } catch (error) {
          console.error('Failed to check XMTP network status:', error);
        }
      }
    };

    checkNetwork();
  }, [walletClient, address]);

  const initXmtp = async () => {
    if (walletClient) {
      try {
        const xmtpClient = await Client.create(walletClient, { env: 'production' });
        setXmtp(xmtpClient);
        setIsOnNetwork(true);
        await loadConversations(xmtpClient);
      } catch (error) {
        console.error('Failed to initialize XMTP client:', error);
        setError('Failed to initialize XMTP client. Please try again.');
      }
    }
  };

  const loadConversations = async (client) => {
    const convos = await client.conversations.list();
    setConversations(convos);
    if (convos.length > 0) {
      setSelectedConversation(convos[0]);
      await loadMessages(convos[0]);
    }
  };

  const loadMessages = async (conversation) => {
    const messageList = await conversation.messages();
    setMessages(messageList);
  };

  const handleApproval = async (messageId, isApproved) => {
    if (selectedConversation) {
      const responseMessage = {
        type: 'approval_response',
        originalMessageId: messageId,
        response: isApproved ? 'approved' : 'rejected'
      };
      await selectedConversation.send(JSON.stringify(responseMessage));
      await loadMessages(selectedConversation);
    }
  };

  const renderMessage = (msg) => {
    try {
      const content = JSON.parse(msg.content);
      if (content.type === 'approval_request') {
        return (
          <Card key={msg.id} className="mb-4">
            <CardHeader>
              <CardTitle>Approval Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{content.company} wants to see this data: {content.data}</p>
              <div className="mt-4 space-x-2">
                <Button onClick={() => handleApproval(msg.id, true)} className="bg-green-500 hover:bg-green-600">
                  Approve
                </Button>
                <Button onClick={() => handleApproval(msg.id, false)} className="bg-red-500 hover:bg-red-600">
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      } else if (content.type === 'approval_response') {
        return (
          <Card key={msg.id} className="mb-4">
            <CardContent>
              <p>Request {content.response} for message {content.originalMessageId}</p>
            </CardContent>
          </Card>
        );
      }
    } catch (error) {
      // If it's not JSON, render as plain text
      return (
        <div key={msg.id} className="mb-2">
          <span className="bg-gray-100 p-2 rounded inline-block">
            {msg.content}
          </span>
        </div>
      );
    }
  };

  if (!address) {
    return <div>Please connect your wallet</div>;
  }

  if (!isOnNetwork) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join XMTP Network</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You need to join the XMTP network to send and receive messages.</p>
          <Button onClick={initXmtp}>
            Join XMTP Network
          </Button>
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 border-r pr-4">
            <h2 className="text-xl font-semibold mb-4">Conversations</h2>
            <ul>
              {conversations.map((convo) => (
                <li 
                  key={convo.peerAddress} 
                  className={`cursor-pointer hover:bg-gray-100 p-2 rounded ${selectedConversation === convo ? 'bg-gray-200' : ''}`}
                  onClick={() => {
                    setSelectedConversation(convo);
                    loadMessages(convo);
                  }}
                >
                  {convo.peerAddress}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {selectedConversation ? `Messages with ${selectedConversation.peerAddress}` : 'Select a conversation'}
            </h2>
            <div className="h-96 overflow-y-auto mb-4 border p-2 rounded">
              {messages.map((msg) => renderMessage(msg))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}