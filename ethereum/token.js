import web3 from './web3'
import TokenRepository from './build/contracts/TokenRepository.json'

export default address => new web3.eth.Contract(TokenRepository.abi, address)
