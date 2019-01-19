pragma solidity ^0.4.24;

import "./TokenRepository.sol";

contract DogAdoptionRepository {
    
    // Dog adoption struct
    struct DogAdoption {
        string name;
        address tokenRegistrationAddress; 
        uint tokenId;
        address owner;
        bool approved;
        bool canceled;
        uint endBlock;
    }
    
    // Array with all dog adoptions
    DogAdoption[] public dogAdoptions; 
   
    // Dog adopter to hold dog adopter address, amount, tokenId, and refunded
    struct DogAdopter {
        address from;
        uint amount;
        uint tokenId;
        bool refunded;
        bool winner;
    }
   
    // Mapping from dog adoption index to dog adopter addresses
    mapping(uint => address[]) public dogAdopterAddresses;
    
    // Mapping from dog adoption index to mapping from dog adopter address to dog adopter
    mapping(uint => mapping(address => DogAdopter)) dogAdopters;
   
    /**
    * @dev Creates a dog adoption with the given information
    * @param name string containing dog adoption name
    * @param tokenRegistrationAddress address of the TokenRepository contract
    * @param tokenId uint of the token registered in TokenRepository
    * @param endBlock uint of an Ethereum block
    */
    function createDogAdoption(string name, address tokenRegistrationAddress, uint tokenId, uint endBlock) 
        public contractIsTokenOwner(tokenRegistrationAddress, tokenId) beforeEnd(endBlock) {
        
        DogAdoption memory newDogAdoption = DogAdoption({
            name: name,
            tokenRegistrationAddress: tokenRegistrationAddress,
            tokenId: tokenId,
            owner: msg.sender,
            approved: false,
            canceled: false,
            endBlock: endBlock
        });
        
        dogAdoptions.push(newDogAdoption);
        
        emit DogAdoptinCreated(msg.sender, dogAdoptions.length - 1);
    }
    
    /**
    * @dev Adding a dog adopter
    * @dev Dog adoption should be an active and not ended
    * @param dogAdoptionId uint of the dog adoption
    * @param tokenRegistrationAddress address of the TokenRepository contract
    * @param tokenId uint of the token registered in TokenRepository
    */
    function addDogAdopter(uint dogAdoptionId, address tokenRegistrationAddress, uint tokenId) 
        public contractIsTokenOwner(tokenRegistrationAddress, tokenId) isNotOwner(dogAdoptionId) isActive(dogAdoptionId) payable {

        DogAdopter memory existingAdopter = dogAdopters[dogAdoptionId][msg.sender];
        
        require(existingAdopter.tokenId == 0, "You already have been added as a dog adopter to this dog adoption");
        
        DogAdopter memory adopter = DogAdopter({
            from: msg.sender,
            amount: msg.value,
            tokenId: tokenId,
            refunded: false,
            winner: false
        });
    
        dogAdopters[dogAdoptionId][msg.sender] = adopter;
        dogAdopterAddresses[dogAdoptionId].push(msg.sender);
        
        emit DogAdopterAdded(msg.sender, dogAdoptionId);
    }
    
    /**
    * @dev Cancels an ongoing dog adoption by the owner
    * @dev TokenId is transfered back to the dog adotion owner
    * @param dogAdoptionId uint ID of the created dog adoption
    */
    function cancelDogAdoption(uint dogAdoptionId) 
        public isOwner(dogAdoptionId) isActive(dogAdoptionId) {
            
        DogAdoption storage dogAdoption = dogAdoptions[dogAdoptionId];
        
        if(approveAndTransfer(address(this), dogAdoption.owner, dogAdoption.tokenRegistrationAddress, dogAdoption.tokenId)) {
            dogAdoption.canceled = true;
            emit DogAdoptionCanceled(msg.sender, dogAdoptionId);
        }
    }
    
    /**
    * @dev Dog adoption owner approves a dog adopter
    * @param dogAdoptionId uint ID of the created dog adoption 
    * @param dogAdopterAddress address of a dog adopter 
    */ 
    function approveDogAdopter(uint dogAdoptionId, address dogAdopterAddress) 
        public isOwner(dogAdoptionId) isActive(dogAdoptionId) {

        DogAdopter storage dogAdopter = dogAdopters[dogAdoptionId][dogAdopterAddress];
        
        require(dogAdopter.tokenId != 0, "Dog Adopter is not found");
        
        DogAdoption storage dogAdoption = dogAdoptions[dogAdoptionId];
        
        if(dogAdopter.refunded == false) {
            // Money goes to dog adoption owner
            if(!dogAdoption.owner.send(dogAdopter.amount)) {
                revert("Can not send money to dog adotption owner");
            }
            
            // approve and transfer from this contract to approved dog adopter the dog adopter tokenId
            if(approveAndTransfer(address(this), dogAdopter.from, dogAdoption.tokenRegistrationAddress, dogAdopter.tokenId)) {
                
                // approve and transfer from this contract to approved dog adopter the dog adoption tokenId
                if(approveAndTransfer(address(this), dogAdopter.from, dogAdoption.tokenRegistrationAddress, dogAdoption.tokenId)) {
                    dogAdopter.refunded = true;
                    dogAdopter.winner = true;
                    dogAdoption.approved = true;
                    emit DogAdopterApproved(msg.sender, dogAdoptionId);
                }
            }
        }
    }
    
    /**
    * @dev Dog adopter withrows his/her money for the dog adoption
    * @param dogAdoptionId uint ID of the created dog adoption
    */
    function withdraw(uint dogAdoptionId) public isNotOwner(dogAdoptionId) isNotActive(dogAdoptionId) {
        
        DogAdopter storage dogAdopter = dogAdopters[dogAdoptionId][msg.sender];
        
        if(dogAdopter.refunded == false) {
            //Refund the dog adopter
            if(!dogAdopter.from.send(dogAdopter.amount)) {
                revert("Failed to send money to a registered dog adopter");
            }
            
            DogAdoption memory dogAdoption = dogAdoptions[dogAdoptionId];
            
            // approve and transfer from this contract to the dog adopter the dogadoption tokenId
            if(approveAndTransfer(address(this), dogAdopter.from, dogAdoption.tokenRegistrationAddress, dogAdopter.tokenId)) {
                dogAdopter.refunded = true;
                emit DogAdopterRefunded(msg.sender, dogAdoptionId);
            }
        }
    }
    
    /**
    * @dev Gets dog adoptions count 
    * @return uint representing the dog adoptions count
    */
    function dogAdoptionsCount() public view returns(uint) {
        return dogAdoptions.length;
    }
    
    /**
    * @dev Gets dog adopters addresses for a dog adoption 
    * @param dogAdoptionId uint ID of the created dog adoption
    * @return uint representing the dog adopters count
    */
    function dogAdopterAddressesCount(uint dogAdoptionId) public view returns(uint){
        return dogAdopterAddresses[dogAdoptionId].length;
    }
    
    /**
    * @dev Gets dog adopter info
    * @param dogAdoptionId uint ID of the created dog adoption 
    * @param position uint of dog adopter addresses of the specified dog adoption
    * @return from address of a dog adopter
    * @return amount uint of a dog adopter
    * @return refunded bool of a dog adopter
    */
    function getDogAdopter(uint dogAdoptionId, uint position) public view returns (
            uint tokenId, 
            address from, 
            uint amount, 
            bool winner, 
            bool refunded) {
        address dogAdopteraddress = dogAdopterAddresses[dogAdoptionId][position];
        
        DogAdopter memory dogAdopter = dogAdopters[dogAdoptionId][dogAdopteraddress];
        
        require(dogAdopter.tokenId != 0, "Dog Adopter is not found");
        
        return(
            dogAdopter.tokenId,
            dogAdopter.from,
            dogAdopter.amount,
            dogAdopter.winner,
            dogAdopter.refunded
        );
    }

    //Only for Remix testing
    function currentBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    //Only for remix testing
    function blockNumber() public view returns(uint) {
        return block.number;
    }
    
    /**
    * @dev Disallow payments to this contract directly
    */
    function() public payable {
        revert("Direct payments to this contract is disallowed");
    }
    
    function approveAndTransfer(address from, address to, address tokenRegistrationAddress, uint tokenId) internal returns(bool) {
        TokenRepository remoteContract = TokenRepository(tokenRegistrationAddress);
        remoteContract.approve(to, tokenId);
        remoteContract.transferFrom(from, to, tokenId);
        return true;
    }
    
    /**
    * @dev Guarantees this contract is owner of the given token
    * @param tokenRegistrationAddress address of the token respository to validate from
    * @param tokenId uint ID of the token which has been registered in the token repository
    */
    modifier contractIsTokenOwner(address tokenRegistrationAddress, uint tokenId) {
        address tokenOwner = TokenRepository(tokenRegistrationAddress).ownerOf(tokenId);
        require(tokenOwner == address(this), "Contract is not owner of given token");
        _;
    }
    
    /**
    * @dev Guarantees msg.sender is onwer of the given dog adoption
    * @param dogAdoptionId uint ID of the dog adoption to validate its ownership belongs to msg.sender
    */
    modifier isOwner(uint dogAdoptionId) {
        require(dogAdoptions[dogAdoptionId].owner == msg.sender, "Message sender is not dog adoption owner");
        _;
    }
    
    /**
     * @dev Guarantees msg.sender is not onwer of the given dog adoption
     * @param dogAdoptionId uint ID of the dog adoption to validate its ownership does not belong to msg.sender
    */
    modifier isNotOwner(uint dogAdoptionId) {
        require(dogAdoptions[dogAdoptionId].owner != msg.sender, "Message sender is dog adoption owner");
        _;
    }
  
    /**
    * @dev Guarantees dog adoption block number is less than the current Ethereum block number
    * @param endBlock uint of the end block
    */
    modifier beforeEnd(uint endBlock) {
        require(block.number < endBlock, "Dog adoption endBlock must be greather than the current ethereum block number");
        _;
    }
    
    /**
    * @dev Guarantees dog adoption is either canceled, approved or ended
    * @param dogAdoptionId uint ID of the created dog adoption
    */
    modifier isNotActive(uint dogAdoptionId) {
        require(
            dogAdoptions[dogAdoptionId].canceled == true
            || dogAdoptions[dogAdoptionId].approved == true  
            || block.number >= dogAdoptions[dogAdoptionId].endBlock,
            "Dog adoption is neither canceled nor approved nor ended");
        _;
    }
    
    /**
    * @dev Guarantees dog adoption is neither caneled, nor approved nor ended
    * @param dogAdoptionId uint ID of the created dog adoption
    */
    modifier isActive(uint dogAdoptionId) {
        require(
            dogAdoptions[dogAdoptionId].canceled == false
            && dogAdoptions[dogAdoptionId].approved == false 
            && block.number < dogAdoptions[dogAdoptionId].endBlock,
            "Dog adoption is either canceled or approved or ended");
        _;
    }
    
    // DogAdoptinCreated is fired when a dog adoption is created
    event DogAdoptinCreated(address owner, uint dogAdoptionId);
    
    // DogAdopterApproved is fired when a dog adopter is selected
    event DogAdopterApproved(address owner, uint dogAdoptionId);
    
    // DogAdopterAdded is fired when a dog adopter is added
    event DogAdopterAdded(address from, uint dogAdoptionId);
    
    // DogAdoptionCanceled is fired when a dog adoption is canceled
    event DogAdoptionCanceled(address owner, uint dogAdoptionId);
    
    // DogAdopterRefunded is fired when a dog adopter is refunded
    event DogAdopterRefunded(address from, uint dogAdoptionId);    
}