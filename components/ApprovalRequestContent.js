import { useState, useEffect } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { useAccount, useWalletClient, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import abi from '@/contracts/abi/did.json';

export default function ApprovalRequestContent() {
  const [xmtp, setXmtp] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [error, setError] = useState('');

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: aadharData, refetch: refetchAadhar } = useReadContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getAadhar',
    args: [false, 0, 0],
    account: address,
  });

  const { data: jobData, refetch: refetchJob } = useReadContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getJob',
    args: [1, false, 0, 0],
    account: address,
  });

  useEffect(() => {
    console.log('Aadhar data:', aadharData);
    console.log('Job data:', jobData);
  }, [aadharData, jobData]);

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
    try {
      const conversations = await client.conversations.list();
      const requests = [];
      for (const conversation of conversations) {
        const messages = await conversation.messages();
        const approvalRequestMessages = messages.filter(msg => {
          try {
            const content = JSON.parse(msg.content);
            return content.type === 'approval_request' && msg.senderAddress !== address;
          } catch (error) {
            return false;
          }
        });
        
        for (const msg of approvalRequestMessages) {
          const content = JSON.parse(msg.content);
          const parsedData = JSON.parse(content.data);
          const hasReply = messages.some(replyMsg => {
            try {
              const replyContent = JSON.parse(replyMsg.content);
              return replyContent.type === 'request_response' && replyContent.requestId === msg.id;
            } catch (error) {
              return false;
            }
          });
          
          if (!hasReply) {
            requests.push({
              id: msg.id,
              company: content.company,
              data: parsedData,
              dataType: content.dataType,
              peerAddress: msg.senderAddress,
              timestamp: msg.sent,
            });
          }
        }
      }
      setApprovalRequests(requests);
      console.log('Loaded approval requests:', requests);
    } catch (error) {
      console.error('Error loading approval requests:', error);
      setError('Failed to load approval requests. Please try again.');
    }
  };

  const formatRequestedData = (request) => {
    const requestedFields = [];
    const { data } = request;
    if (data.name) requestedFields.push('Name');
    if (data.gender) requestedFields.push('Gender');
    if (data.age) {
      const ageCondition = `Age ${data.ageOperator || 'equals'} ${data.ageValue || 0}`;
      requestedFields.push(ageCondition);
    }
    if (data.companyId) requestedFields.push('Company ID');
    if (data.joinDate) requestedFields.push('Join Date');
    if (data.designation) requestedFields.push('Designation');
    if (data.salary) {
      const salaryCondition = `Salary ${data.salaryOperator || 'equals'} ${data.salaryValue || 0}`;
      requestedFields.push(salaryCondition);
    }
    return requestedFields.join(', ');
  };


  const handleApproval = async (requestId, isApproved) => {
    if (!xmtp) return;

    const request = approvalRequests.find(req => req.id === requestId);
    if (!request) return;

    try {
      const conversation = await xmtp.conversations.newConversation(request.peerAddress);
      let approvedData = {};

      if (isApproved) {
        if (request.dataType === 'aadhar' && aadharData) {
          const [name, gender, ageBool, signUrl] = aadharData;
          if (request.data.name) approvedData.name = name;
          if (request.data.gender) approvedData.gender = gender;
          if (request.data.age) {
            const ageOperator = request.data.ageOperator || 'equals';
            const ageValue = request.data.ageValue || 0;
            approvedData.age = `Age ${ageOperator} ${ageValue}: ${ageBool}`;
            
            const operatorValue = ageOperator === 'equals' ? 0 : ageOperator === 'less' ? 1 : 2;
            await refetchAadhar({
              args: [true, operatorValue, parseInt(ageValue)],
            });
          }
          approvedData.signUrl = signUrl;
        } else if (request.dataType === 'job' && jobData) {
          const [companyId, joinDate, designation, salaryBool, signUrl] = jobData;
          if (request.data.companyId) approvedData.companyId = companyId;
          if (request.data.joinDate) approvedData.joinDate = joinDate.toString();
          if (request.data.designation) approvedData.designation = designation;
          if (request.data.salary) {
            const salaryOperator = request.data.salaryOperator || 'equals';
            const salaryValue = request.data.salaryValue || 0;
            approvedData.salary = `Salary ${salaryOperator} ${salaryValue}: ${salaryBool}`;
            
            const operatorValue = salaryOperator === 'equals' ? 0 : salaryOperator === 'less' ? 1 : 2;
            await refetchJob({
              args: [1, true, operatorValue, parseInt(salaryValue)],
            });
          }
          approvedData.signUrl = signUrl;
        }
      }

      const response = {
        type: 'request_response',
        requestId: requestId,
        approved: isApproved,
        data: isApproved ? approvedData : null,
        dataType: request.dataType
      };
      await conversation.send(JSON.stringify(response));

      // Remove the request from the list
      setApprovalRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to send response:', error);
      setError('Failed to send response. Please try again.');
    }
  };


  return (
    <Card className="w-full max-w-4xl mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl font-bold">Pending Approval Requests</CardTitle>
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
                <p className="text-sm mb-2">Requested data: {formatRequestedData(request)}</p>
                <p className="text-sm text-gray-500 mb-4">Received: {new Date(request.timestamp).toLocaleString()}</p>
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => handleApproval(request.id, true)}>
                    Approve
                  </Button>
                  <Button onClick={() => handleApproval(request.id, false)} variant="outline">
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