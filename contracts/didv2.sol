// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;
import {FHE, euint256, inEuint256, ebool} from "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

contract DecentralizedIDDirectory is Permissioned {
    // @notice Credential Schema to store credentials
    // @param credId Incremental credential ID unique to each credential
    // @param credType Name of the credential
    // @param publicDataKeys keys for unencrypted data ex Name, Company Name
    // @param publicDataValues values for unencrypted data ex 12345, 1256
    // @dev values are stored in int format - String and Bool(0 and 1) are converted to numbers
    // @param encryptedDataKeys keys for encrypyted data ex Salary DOB
    // @param encryptedDataValues values for unencrypted data
    struct Credential {
        uint256 credId;
        string credType;
        string[] publicDataKeys;
        int256[] publicDataValues;
        string[] encryptedDataKeys;
        euint256[] encryptedDataValues;
    }

    // @notice Each user can have multiple credentials
    mapping(address => Credential[]) private didRegistry;

    // @notice counter for crendentials
    // @dev incremental int to keep each credential unique
    uint256 private credCounter;

    // @notice Add new credential to the directory mapped to userAddress
    // @param userAddress User to whom credential is issued
    function addCredential(
        address userAddress,
        string memory credType,
        string[] memory publicDataKeys,
        string[] memory encryptedDataKeys,
        int256[] memory publicDataValues,
        inEuint256[] memory encryptedDataValues
    ) public {
        require(
            publicDataKeys.length == publicDataValues.length,
            "Public data - keys and values length mismatch"
        );
        require(
            encryptedDataKeys.length == encryptedDataValues.length,
            "Encrypted data - keys and values length mismatch"
        );

        Credential storage newCredential = didRegistry[userAddress].push();
        newCredential.credId = ++credCounter;
        newCredential.credType = credType;
        newCredential.publicDataKeys = publicDataKeys;
        newCredential.publicDataValues = publicDataValues;
        newCredential.encryptedDataKeys = encryptedDataKeys;
        newCredential.encryptedDataValues = new euint256[](encryptedDataValues.length);
        for (uint256 j = 0; j < encryptedDataKeys.length; j++) {
            newCredential.encryptedDataValues[j] = FHE.asEuint256(encryptedDataValues[j]);
        }
    }

    // @notice Fetch all credential of the message sender 
    function getCredentials() public view returns (Credential[] memory) {
        uint256 credentialCount = didRegistry[msg.sender].length;
        Credential[] memory credentials = new Credential[](credentialCount);

        for (uint256 k = 0; k < credentialCount; k++) {
            Credential storage credential = didRegistry[msg.sender][k];
            credentials[k] = credential;
        }
        return credentials;
    }

    // @notice Share credential data with third party
    // @param credId ID of the Credential to be shared
    // @param publicKey Public key of the third party with whom data is to be shared
    // @dev sealedEncryptedDataValues is being sealed for the provided public key
    function shareCredential(uint256 credId, bytes32 publicKey) public view returns (string memory) {
        Credential[] storage credentials = didRegistry[msg.sender];
        for (uint256 i = 0; i < credentials.length; i++) {
            if (credentials[i].credId == credId) {
                // Serialize and seal each part of the credential
                string memory sealedCredId = FHE.sealoutput(FHE.asEuint256(credentials[i].credId), publicKey);
                string memory sealedCredType = credentials[i].credType; // Public data, no need to seal
                string memory sealedPublicDataKeys = arrayToString(credentials[i].publicDataKeys); // Public data, no need to seal
                string memory sealedPublicDataValues = intArrayToString(credentials[i].publicDataValues); // Public data, no need to seal
                string memory sealedEncryptedDataKeys = arrayToString(credentials[i].encryptedDataKeys); // Public data, no need to seal
                string memory sealedEncryptedDataValues = euintArrayToString(credentials[i].encryptedDataValues, publicKey);

                // Combine all parts into a single string
                string memory sealedCredential = string(abi.encodePacked(
                    "credId:", sealedCredId,
                    ",credType:", sealedCredType,
                    ",publicDataKeys:", sealedPublicDataKeys,
                    ",publicDataValues:", sealedPublicDataValues,
                    ",encryptedDataKeys:", sealedEncryptedDataKeys,
                    ",encryptedDataValues:", sealedEncryptedDataValues
                ));
                return sealedCredential;
            }
        }
        revert("Credential not found");
    }

    function arrayToString(string[] memory array) internal pure returns (string memory) {
        string memory result = "[";
        for (uint256 i = 0; i < array.length; i++) {
            result = string(abi.encodePacked(result, array[i]));
            if (i < array.length - 1) {
                result = string(abi.encodePacked(result, ","));
            }
        }
        result = string(abi.encodePacked(result, "]"));
        return result;
    }

    function intArrayToString(int256[] memory array) internal pure returns (string memory) {
        string memory result = "[";
        for (uint256 i = 0; i < array.length; i++) {
            result = string(abi.encodePacked(result, int2str(array[i])));
            if (i < array.length - 1) {
                result = string(abi.encodePacked(result, ","));
            }
        }
        result = string(abi.encodePacked(result, "]"));
        return result;
    }

    function euintArrayToString(euint256[] memory array, bytes32 publicKey) internal pure returns (string memory) {
        string memory result = "[";
        for (uint256 i = 0; i < array.length; i++) {
            result = string(abi.encodePacked(result, FHE.sealoutput(array[i], publicKey)));
            if (i < array.length - 1) {
                result = string(abi.encodePacked(result, ","));
            }
        }
        result = string(abi.encodePacked(result, "]"));
        return result;
    }

    function int2str(int256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        bool negative = _i < 0;
        uint256 j = uint256(negative ? -_i : _i);
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length + (negative ? 1 : 0));
        uint256 k = length + (negative ? 1 : 0);
        if (negative) {
            bstr[0] = '-';
        }
        while (_i != 0) {
            k = k - 1;
            uint8 temp = uint8(48 + uint256(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
