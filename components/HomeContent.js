import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const mockData = [
  {
    type: 'Aadhar Card',
    name: 'Mayur Samrutwar',
    gender: 'Male',
    dob: '15-05-1990'
  },
  {
    type: 'Job Experience',
    company: 'Y Combinator',
    designation: 'Senior Software Engineer',
    joiningDate: '01-03-2019',
    salary: '120,000 USD'
  }
];

export default function HomeContent() {
  const [showDob, setShowDob] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

  const toggleVisibility = (setter) => {
    setter(prev => !prev);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Welcome back, Mayur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockData.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 text-gray-700">{card.type}</h3>
            <div className="space-y-3">
              {card.type === 'Aadhar Card' ? (
                <>
                  <p className="text-sm"><span className="text-gray-500">Name:</span> <span className="font-medium">{card.name}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Gender:</span> <span className="font-medium">{card.gender}</span></p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      <span className="text-gray-500">DOB:</span> <span className="font-medium">{showDob ? card.dob : '••••••••'}</span>
                    </p>
                    <button onClick={() => toggleVisibility(setShowDob)} className="text-blue-500 hover:text-blue-600">
                      {showDob ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm"><span className="text-gray-500">Company:</span> <span className="font-medium">{card.company}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Designation:</span> <span className="font-medium">{card.designation}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Joining Date:</span> <span className="font-medium">{card.joiningDate}</span></p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      <span className="text-gray-500">Salary:</span> <span className="font-medium">{showSalary ? card.salary : '••••••••'}</span>
                    </p>
                    <button onClick={() => toggleVisibility(setShowSalary)} className="text-blue-500 hover:text-blue-600">
                      {showSalary ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}