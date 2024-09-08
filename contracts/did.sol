// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@fhenixprotocol/contracts/FHE.sol";

contract DIDRegistry {
    address public owner;
    uint256 public currentYear;

    struct Aadhar {
        string name;
        string gender;
        euint32 dob;
        string signUrl;
    }

    struct Job {
        uint256 companyId;
        uint256 joiningDate;
        string designation;
        euint32 salary;
        string signUrl;
    }

    enum CredentialType { Aadhar, Job }

    struct Credential {
        CredentialType credentialType;
        Aadhar aadhar;
        Job job;
    }

    /// @notice DID registry to map all the credentials to user address

    mapping(address => Credential[]) private userCredentials;

    /// @notice Initializes the contract, setting the deployer as the owner and current year to 2024
    constructor() {
        owner = msg.sender;
        currentYear = 2024;
    }

    /// @notice Ensures that only the contract owner can call the function
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /* 
        @notice Sets the current year
        @param _year The year to set as current
        @dev Only the owner can call this function
    */
    function setCurrentYear(uint256 _year) external onlyOwner {
        currentYear = _year;
    }

    /*
        @notice Retrieves the current year
        @return The current year set in the contract
    */
    function getCurrentYear() external view returns (uint256) {
        return currentYear;
    }

    /*
        @notice Adds an Aadhar credential for a specific address
        @param _address The address to associate the credential with
        @param _name The name on the Aadhar
        @param _gender The  der on the Aadhar
        @param _dob The date of birth as a uint32
        @dev _dob is stored in encrypted form
        @param _signUrl The Sign protocol's attestation URL
        @dev Only the owner can call this function. The DOB is encrypted using FHE. //REMOVING onlyOwner
    */
    
    function addAadharCredential(address _address, string memory _name, string memory _gender, uint32 _dob, string memory _signUrl) external {
        Credential memory newCredential;
        newCredential.credentialType = CredentialType.Aadhar;
        newCredential.aadhar = Aadhar(_name, _gender, FHE.asEuint32(_dob), _signUrl);
        userCredentials[_address].push(newCredential);
    }

    /*
        @notice Adds a Job credential for a specific address
        @param _address The address to associate the credential with
        @param _companyId The ID of the company
        @param _joiningDate The date of joining the company
        @param _designation The job designation
        @param _salary The salary, which will be encrypted
        @param _signUrl The Sign protocol's attestation URL
        @dev Only the owner can call this function. The salary is encrypted using FHE. //REMOVING onlyOwner
    */
    function addJobCredential(address _address, uint256 _companyId, uint256 _joiningDate, string memory _designation, uint32 _salary, string memory _signUrl) external {
        Credential memory newCredential;
        newCredential.credentialType = CredentialType.Job;
        newCredential.job = Job(_companyId, _joiningDate, _designation, FHE.asEuint32(_salary), _signUrl);
        userCredentials[_address].push(newCredential);
    }

    /*
        @notice Retrieves all credentials associated with the caller's address
        @return An array of Credential structs
    */
    
    function getAllCredentialsOfUser() external view returns (Credential[] memory) {
        return userCredentials[msg.sender];
    }

    /*
        @notice Retrieves Aadhar information and performs age comparison if requested
        @param isDobRequested Whether to perform age comparison
        @param comparisonType The type of comparison (0: equal, 1: less than, 2: greater than)
        @param comparisonAge The age to compare against
        @return name The name on the Aadhar
        @return gender The gender on the Aadhar
        @return ageBool The result of the age comparison (if requested)
        @return signUrl The Sign protocol's attestation URL
        @dev Uses FHE for encrypted age calculations
    */
    function getAadhar(bool isDobRequested, uint8 comparisonType, uint32 comparisonAge) external view returns (string memory, string memory, bool, string memory) {
        Credential[] memory credentials = userCredentials[msg.sender];
        for (uint i = 0; i < credentials.length; i++) {
            if (credentials[i].credentialType == CredentialType.Aadhar) {
                Aadhar memory aadhar = credentials[i].aadhar;
                bool ageBool = false;
                ebool result = FHE.asEbool(0);
                euint32 ecomparisonAge = FHE.asEuint32(comparisonAge);

                if (isDobRequested) {
                    euint32 birthYear = aadhar.dob % FHE.asEuint32(10000);
                    euint32 currentAge = FHE.asEuint32(currentYear) - birthYear;

                    if (comparisonType == 0) {
                        result = currentAge.eq(ecomparisonAge);
                    } else if (comparisonType == 1) {
                        result = currentAge.lt(ecomparisonAge);
                    } else if (comparisonType == 2) {
                        result = currentAge.gt(ecomparisonAge);
                    }
                }
                ageBool = FHE.decrypt(result);
                return (aadhar.name, aadhar.gender, ageBool, aadhar.signUrl);
            }
        }
        revert("Aadhar credential not found");
    }

    /*
        @notice Retrieves Job information and performs salary comparison if requested
        @param companyId The ID of the company to retrieve job information for
        @param isSalaryRequested Whether to perform salary comparison
        @param comparisonType The type of comparison (0: equal, 1: less than, 2: greater than)
        @param comparisonSalary The salary to compare against (encrypted)
        @return companyId The ID of the company
        @return joiningDate The date of joining the company
        @return designation The job designation
        @return salaryBool The result of the salary comparison (if requested)
        @return signUrl The Sign protocol's attestation URL
        @dev Uses FHE for encrypted salary comparisons
    */
    function getJob(uint256 companyId, bool isSalaryRequested, uint8 comparisonType, euint32 comparisonSalary) external view returns (uint256, uint256, string memory, bool, string memory) {
        Credential[] memory credentials = userCredentials[msg.sender];
        for (uint i = 0; i < credentials.length; i++) {
            if (credentials[i].credentialType == CredentialType.Job && credentials[i].job.companyId == companyId) {
                Job memory job = credentials[i].job;
                bool salaryBool = false;
                ebool result = FHE.asEbool(0);
                if (isSalaryRequested) {
                    if (comparisonType == 0) {
                        result = job.salary.eq(comparisonSalary);
                    } else if (comparisonType == 1) {
                        result = job.salary.lt(comparisonSalary);
                    } else if (comparisonType == 2) {
                        result = job.salary.gt(comparisonSalary);
                    }
                }
                salaryBool = FHE.decrypt(result);
                return (job.companyId, job.joiningDate, job.designation, salaryBool, job.signUrl);
            }
        }
        revert("Job credential not found for the given company ID");
    }
}