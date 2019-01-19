const DogAdoptionRepository = artifacts.require('./DogAdoptionRepository.sol')
const TokenRepository = artifacts.require('./TokenRepository.sol')
const fs = require('fs')

contract('DogAdoptionRepository', async accounts => {
  it('It should check if dog adoption repository is initialized', async () => {
    let instance = await DogAdoptionRepository.deployed()
    fs.writeFileSync('./test/dogAdoptionAddress', instance.address)
    let dogAdoptionsLength = await instance.dogAdoptionsCount()
    assert.equal(dogAdoptionsLength.valueOf(), 0, 'dog adoptions instead of 0')
  })

  it('It should check  the contract flow', async () => {
    try {
      let dogAdoptionInstance = await DogAdoptionRepository.deployed()
      let tokenInstance = await TokenRepository.deployed()

      const dogAdoptAddress = dogAdoptionInstance.address
      const tokenAddress = tokenInstance.address

      // register token 1111, first account
      await tokenInstance.registerToken('1111', 'hash1')

      // register token 11112, first account
      await tokenInstance.registerToken('11112', 'hash12')

      // transwer the ownership from accounts[0] to dog adoption address
      await tokenInstance.transferFrom(accounts[0], dogAdoptAddress, 1111)

      // create dog adoption by accounts[0]
      await dogAdoptionInstance.createDogAdoption(
        'dog adoption 1',
        tokenAddress,
        1111,
        1150011
      )

      // register token 2222, second account
      await tokenInstance.registerToken('2222', 'hash2', {
        from: accounts[1]
      })

      // transwer the ownership from accounts[1] to dog adoption address
      await tokenInstance.transferFrom(accounts[1], dogAdoptAddress, 2222, {
        from: accounts[1]
      })

      // add dog adopter from accounts[1] sending 5 ether
      await dogAdoptionInstance.addDogAdopter(0, tokenAddress, 2222, {
        from: accounts[1],
        value: web3.toWei('5', 'ether')
      })

      // register token 3333, third account
      await tokenInstance.registerToken('3333', 'hash3', {
        from: accounts[2]
      })

      // transwer the ownership from accounts[2] to dog adoption address
      await tokenInstance.transferFrom(accounts[2], dogAdoptAddress, 3333, {
        from: accounts[2]
      })

      // add dog adopter from accounts[2] sending 10 ether
      await dogAdoptionInstance.addDogAdopter(0, tokenAddress, 3333, {
        from: accounts[2],
        value: web3.toWei('10', 'ether')
      })

      // approve dog adoption by the owner accounts[0], selecting first dog adopter
      await dogAdoptionInstance.approveDogAdopter(0, accounts[1])

      // withdraw accounts[2]
      await dogAdoptionInstance.withdraw(0, { from: accounts[2] })

      // register token 4444, forth account
      await tokenInstance.registerToken('4444', 'hash4', {
        from: accounts[3]
      })

      // transwer the ownership from accounts[3] to dog adoption address
      await tokenInstance.transferFrom(accounts[3], dogAdoptAddress, 4444, {
        from: accounts[3]
      })

      // create dog adoption by accounts[3]
      await dogAdoptionInstance.createDogAdoption(
        'dog adoption 2',
        tokenAddress,
        4444,
        1150011,
        { from: accounts[3] }
      )

      // register token 5555, fifth account
      await tokenInstance.registerToken('5555', 'hash5', {
        from: accounts[4]
      })

      // transwer the ownership from accounts[4] to dog adoption address
      await tokenInstance.transferFrom(accounts[4], dogAdoptAddress, 5555, {
        from: accounts[4]
      })

      // add dog adopter from accounts[4] sending 20 ether
      await dogAdoptionInstance.addDogAdopter(1, tokenAddress, 5555, {
        from: accounts[4],
        value: web3.toWei('20', 'ether')
      })

      // cancel dog adoption by the owner accounts[3]
      await dogAdoptionInstance.cancelDogAdoption(1, { from: accounts[3] })

      // withdraw accounts[4]
      await dogAdoptionInstance.withdraw(1, { from: accounts[4] })
    } catch (error) {
      assert(false, error.message)
    }
  })
})
