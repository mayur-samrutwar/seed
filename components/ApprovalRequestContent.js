import { useState, useEffect, use } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { useAccount, useWalletClient, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import abi from '@/contracts/abi/did.json';


export default function ApprovalRequestContent() {
  const [xmtp, setXmtp] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [error, setError] = useState('');

  const [responseOperator, setResponseOperator] = useState('equals to');
  const [responseValue, setResponseValue] = useState(0);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: aadharData, refetch: refetchAadhar } = useReadContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getAadhar',
    args: [false, 0, 0], // Default values, will be updated in handleApproval
    account: address,
  });

  const { data: jobData, refetch: refetchJob } = useReadContract({
    address: process.env.NEXT_PUBLIC_DID_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getJob',
    args: [1, false, 0, 0], // Default values, will be updated in handleApproval
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
              data: content.data,
              dataType: content.dataType,
              peerAddress: msg.senderAddress,
              timestamp: msg.sent
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

  const handleApproval = async (requestId, isApproved) => {
    if (!xmtp) return;

    const request = approvalRequests.find(req => req.id === requestId);
    if (!request) return;

    try {
      const conversation = await xmtp.conversations.newConversation(request.peerAddress);
      const requestData = JSON.parse(request.data);
      let approvedData = {};

      if (isApproved) {
        if (request.dataType === 'aadhar' && aadharData) {
          const [name, gender, ageBool, signUrl] = aadharData;
          if (requestData.name) approvedData.name = name;
          if (requestData.gender) approvedData.gender = gender;
          if (requestData.age) {
            const ageOperator = requestData.age.operator || 'equals';
            const ageValue = requestData.age.value || 0;
            approvedData.age = `Age ${ageOperator} ${ageValue}: ${ageBool}`;
          }
          approvedData.signUrl = signUrl; // Always send signUrl
        } else if (request.dataType === 'job' && jobData) {
          const [companyId, joinDate, designation, salaryBool, signUrl] = jobData;
          if (requestData.companyId) approvedData.companyId = companyId;
          if (requestData.joinDate) approvedData.joinDate = joinDate.toString(); // Convert BigInt to string
          if (requestData.designation) approvedData.designation = designation;
          if (requestData.salary) {
            const salaryOperator = requestData.salary.operator || 'equals';
            const salaryValue = requestData.salary.value || 0;
            approvedData.salary = `Salary ${salaryOperator} ${salaryValue}: ${salaryBool}`;
          }
          approvedData.signUrl = signUrl; // Always send signUrl
        }
      }

      const response = {
        type: 'request_response',
        requestId: requestId,
        approved: isApproved,
        data: isApproved ? approvedData : null,
        dataType: request.dataType === 'aadhar' ? 'Aadhar' : 'Job'
      };
      await conversation.send(JSON.stringify(response));

      if (isApproved) {
        if (request.dataType === 'aadhar') {
          const ageOperator = requestData.age?.operator || 'equals';
          const ageValue = requestData.age?.value || 0;
          const operatorValue = ageOperator === 'equals' ? 0 : ageOperator === 'less' ? 1 : 2;
          const result = await refetchAadhar({
            args: [requestData.age !== undefined, operatorValue, ageValue],
          });
          console.log('Aadhar data after refetch:', result.data);
        } else if (request.dataType === 'job') {
          const salaryOperator = requestData.salary?.operator || 'equals';
          const salaryValue = requestData.salary?.value || 0;
          const operatorValue = salaryOperator === 'equals' ? 0 : salaryOperator === 'less' ? 1 : 2;
          const result = await refetchJob({
            args: [1, requestData.salary !== undefined, operatorValue, salaryValue],
          });
          console.log('Job data after refetch:', result.data);
        }
      }

      // Remove the request from the list
      setApprovalRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to send response:', error);
      setError('Failed to send response. Please try again.');
    }
  };

  const formatRequestedData = (data) => {
    const requestedFields = [];
    const parsedData = JSON.parse(data);
    if (parsedData.name) requestedFields.push('Name');
    if (parsedData.gender) requestedFields.push('Gender');
    if (parsedData.age) {
      const ageOperator = parsedData.age.operator || 'equals';
      const ageValue = parsedData.age.value || 0;
      requestedFields.push(`Age ${ageOperator} ${ageValue}`);
    }
    if (parsedData.companyId) requestedFields.push('Company ID');
    if (parsedData.joinDate) requestedFields.push('Join Date');
    if (parsedData.designation) requestedFields.push('Designation');
    if (parsedData.salary) {
      const salaryOperator = parsedData.salary.operator || 'equals';
      const salaryValue = parsedData.salary.value || 0;
      requestedFields.push(`Salary ${salaryOperator} ${salaryValue}`);
    }
    return requestedFields.join(', ');
  };

  if (!address) {
    return <div>Please connect your wallet</div>;
  }

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