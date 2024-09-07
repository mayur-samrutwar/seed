import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAccount } from 'wagmi';
import axios from 'axios';

export default function DataContent() {
  const [approvedData, setApprovedData] = useState(null);
  const { address } = useAccount();

  useEffect(() => {
    const fetchApprovedData = async () => {
      try {
        const response = await axios.get(`/api/data/getapproved?address=${address}`);
        setApprovedData(response.data);
      } catch (error) {
        console.error('Error fetching approved data:', error);
      }
    };
    fetchApprovedData();
  }, [address]);

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Approved Data</h1>
      <p className="text-gray-600 mb-8 text-lg">View your approved data requests.</p>
      {approvedData ? (
        <div className="space-y-4">
          {Object.entries(approvedData).map(([key, value]) => (
            <div key={key} className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-800">{key}</h2>
              <p className="text-gray-600">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No approved data requests found.</p>
      )}
    </div>
  );
}
