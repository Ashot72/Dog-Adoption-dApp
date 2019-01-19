var DogAdoptionRepository = artifacts.require('./DogAdoptionRepository.sol')
var TokenRepository = artifacts.require('./TokenRepository.sol')

module.exports = function (deployer) {
  deployer.deploy(DogAdoptionRepository)
  deployer.deploy(TokenRepository, 'Dog Adoption', 'DA')
}
