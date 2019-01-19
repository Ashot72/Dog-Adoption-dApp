import web3 from './web3'
import DogAdoptionRepository from './build/contracts/DogAdoptionRepository.json'

export default address =>
  new web3.eth.Contract(DogAdoptionRepository.abi, address)
