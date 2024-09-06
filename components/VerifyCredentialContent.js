import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Client } from '@xmtp/xmtp-js';
import { useWalletClient, useAccount } from 'wagmi';

export default function VerifyCredentialContent() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [uaddress, setAddress] = useState('');
  const [selectedCredential, setSelectedCredential] = useState('');
  const [aadharDetails, setAadharDetails] = useState({
    name: false,
    gender: false,
    age: false,
    ageOperator: 'equals',
    ageValue: '',
  });
  const [employerDetails, setEmployerDetails] = useState({
    companyName: false,
    joiningDate: false,
    position: false,
    salary: false,
    salaryOperator: 'equals',
    salaryValue: '',
  });

  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCredentialChange = (value) => {
    setSelectedCredential(value);
  };

  const handleCheckboxChange = (type, field) => {
    if (type === 'aadhar') {
      setAadharDetails(prev => ({ ...prev, [field]: !prev[field] }));
    } else if (type === 'employer') {
      setEmployerDetails(prev => ({ ...prev, [field]: !prev[field] }));
    }
  };

  const handleOperatorChange = (type, value) => {
    if (type === 'aadhar') {
      setAadharDetails(prev => ({ ...prev, ageOperator: value }));
    } else if (type === 'employer') {
      setEmployerDetails(prev => ({ ...prev, salaryOperator: value }));
    }
  };

  const handleValueChange = (type, value) => {
    if (type === 'aadhar') {
      setAadharDetails(prev => ({ ...prev, ageValue: value }));
    } else if (type === 'employer') {
      setEmployerDetails(prev => ({ ...prev, salaryValue: value }));
    }
  };

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [xmtp, setXmtp] = useState(null);

  useEffect(() => {
    const initXmtp = async () => {
      if (walletClient && !xmtp) {
        try {
          const xmtpClient = await Client.create(walletClient, { env: 'production' });
          setXmtp(xmtpClient);
        } catch (error) {
          console.error('Failed to initialize XMTP client:', error);
        }
      }
    };

    initXmtp();
  }, [walletClient, xmtp]);

  const handleRequest = async () => {
    if (xmtp) {
      try {
        const conversation = await xmtp.conversations.newConversation(uaddress);
        const message = {
          type: 'approval_request',
          company: companyName,
          data: selectedCredential === 'aadhar' ? JSON.stringify(aadharDetails) : JSON.stringify(employerDetails)
        };
        await conversation.send(JSON.stringify(message));
        console.log("Verification request sent", message);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <p className="text-gray-600 mb-4">Enter your company name to proceed.</p>
            <Input
              value={companyName}
              onChange={handleCompanyNameChange}
              placeholder="Your Company Name"
              className="mb-4"
            />
          </>
        );
      case 2:
        return (
          <>
            <p className="text-gray-600 mb-4">Enter your address to proceed.</p>
            <Input
              value={uaddress}
              onChange={handleAddressChange}
              placeholder="Seed DID"
              className="mb-4"
            />
          </>
        );
      case 3:
        return (
          <>
            <p className="text-gray-600 mb-4">Select the credential type and choose the details you want to verify.</p>
            <Select onValueChange={handleCredentialChange} className="mb-4">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Credential" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhar">Aadhar Card</SelectItem>
                <SelectItem value="employer">Job Details</SelectItem>
              </SelectContent>
            </Select>

            {selectedCredential === 'aadhar' && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aadhar-name"
                    checked={aadharDetails.name}
                    onCheckedChange={() => handleCheckboxChange('aadhar', 'name')}
                  />
                  <label htmlFor="aadhar-name">Name</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aadhar-gender"
                    checked={aadharDetails.gender}
                    onCheckedChange={() => handleCheckboxChange('aadhar', 'gender')}
                  />
                  <label htmlFor="aadhar-gender">Gender</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aadhar-age"
                    checked={aadharDetails.age}
                    onCheckedChange={() => handleCheckboxChange('aadhar', 'age')}
                  />
                  <label htmlFor="aadhar-age">Age</label>
                </div>
                {aadharDetails.age && (
                  <div className="flex items-center space-x-2 ml-6">
                    <Select value={aadharDetails.ageOperator} onValueChange={(value) => handleOperatorChange('aadhar', value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less">Less than</SelectItem>
                        <SelectItem value="equals">Equals to</SelectItem>
                        <SelectItem value="more">More than</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={aadharDetails.ageValue}
                      onChange={(e) => handleValueChange('aadhar', e.target.value)}
                      className="w-20"
                      placeholder="Age"
                    />
                  </div>
                )}
              </div>
            )}

            {selectedCredential === 'employer' && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="employer-company"
                    checked={employerDetails.companyName}
                    onCheckedChange={() => handleCheckboxChange('employer', 'companyName')}
                  />
                  <label htmlFor="employer-company">Company Name</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="employer-joining"
                    checked={employerDetails.joiningDate}
                    onCheckedChange={() => handleCheckboxChange('employer', 'joiningDate')}
                  />
                  <label htmlFor="employer-joining">Joining Date</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="employer-position"
                    checked={employerDetails.position}
                    onCheckedChange={() => handleCheckboxChange('employer', 'position')}
                  />
                  <label htmlFor="employer-position">Position</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="employer-salary"
                    checked={employerDetails.salary}
                    onCheckedChange={() => handleCheckboxChange('employer', 'salary')}
                  />
                  <label htmlFor="employer-salary">Salary</label>
                </div>
                {employerDetails.salary && (
                  <div className="flex items-center space-x-2 ml-6">
                    <Select value={employerDetails.salaryOperator} onValueChange={(value) => handleOperatorChange('employer', value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less">Less than</SelectItem>
                        <SelectItem value="equals">Equals to</SelectItem>
                        <SelectItem value="more">More than</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={employerDetails.salaryValue}
                      onChange={(e) => handleValueChange('employer', e.target.value)}
                      className="w-32"
                      placeholder="Salary"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Verify Credential</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex justify-between">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-1/3 h-2 ${
                s <= step ? 'bg-gray-500' : 'bg-gray-200'
              } ${s === 1 ? 'rounded-l-full' : s === 3 ? 'rounded-r-full' : ''}`}
            />
          ))}
        </div>

        {renderStepContent()}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button onClick={handlePreviousStep} variant="outline">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNextStep} className={step === 1 ? "w-full" : ""}>
              Next
            </Button>
          ) : (
            selectedCredential && (
              <Button onClick={handleRequest} className="w-full">
                Request Verification
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}