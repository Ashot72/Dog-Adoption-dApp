pragma solidity ^0.4.24;

import "./ERC721/ERC721Token.sol";

/**
* @title Repository of ERC721 Tokens
* This contract contains the list of tokens registered by users
* Shows how tokens can be minted and added to the repository
*/
contract TokenRepository is ERC721Token {

    /**
    * @dev Created a TokenRepository with a name and symbol
    * @param name string represents the name of the repository
    * @param symbol string represents the symbol of the repository
    */
    constructor(string name, string symbol) public ERC721Token(name, symbol) { }
    
    /**
    * @dev Registers a new token and add metadata to a token
    * @dev Call the ERC721Token minter
    * @param tokenId uint represents s pecific token
    * @param uri string containing metadata/uri that characterised a given token
    */
    function registerToken(uint tokenId, string uri) public {
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        emit TokenRegistered(msg.sender, tokenId);
    }
   
    /**
    * @dev Gets list of owned token IDs
    * @param owner address representing the owner
    * @return list of owned tokens
    */
    function getOwnedTokens(address owner) public view returns(uint[]){
        return ownedTokens[owner];
    }
   
    /**
    * @dev Removes a token ID from the list of a given address
    * @param from address representing the previous owner of the given token ID
    * @param tokenId uint ID of the token to be removed from the tokens list of the given address
    */
    function removeToken(address from, uint tokenId) public {
        removeTokenFrom(from, tokenId);
    }
   
    /**
    * @dev Event is registered if token is registered
    * @param by address of the registrar
    * @param tokenId uint represents a specific token
    */
    event TokenRegistered(address by, uint tokenId);
}