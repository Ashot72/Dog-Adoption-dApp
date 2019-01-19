const TokenRepository = artifacts.require('./TokenRepository.sol')
const fs = require('fs')

contract('TokenRepository', async accounts => {
  let instance
  let dogAdoptionContractAddress = ''

  beforeEach('Setup contract for each test', async () => {
    instance = await TokenRepository.deployed()
    dogAdoptionContractAddress = fs
      .readFileSync('./test/dogAdoptionAddress/')
      .toString()
  })

  it('It should create a token repoistory with DA as symbol', async () => {
    let symbol = await instance.symbol()
    assert.equal(symbol.valueOf(), 'DA', 'Symbol should be DA')
  })

  it(`It should register token with 1111 by account ${
    accounts[0]
  }`, async () => {
    await instance.registerToken(1111, 'hash1')
    let tokenExists = await instance.exists(1111)
    assert.equal(tokenExists.valueOf(), true, 'Result should be true')
  })

  it(`It should register token with 11112 by account ${
    accounts[0]
  }`, async () => {
    await instance.registerToken(11112, 'hash12')
    let tokenExists = await instance.exists(11112)
    assert.equal(tokenExists.valueOf(), true, 'Result should be true')
  })

  it('It should receive tokenURI hash12 for token 11112', async () => {
    let tokenURI = await instance.tokenURI(11112)
    assert.equal(tokenURI.valueOf(), 'hash12', 'tokenURI should be hash12')
  })

  it(`It should check balance of ${accounts[0]}`, async () => {
    let balance = await instance.balanceOf(accounts[0])
    assert.equal(balance.valueOf(), 2, `balance ${balance} should be 2`)
  })

  it(`It should check total supply of the repository`, async () => {
    let supply = await instance.totalSupply()
    assert.equal(supply.valueOf(), 2, `total supply ${supply} should be 2`)
  })

  it(`It should register token with 2222 by account ${
    accounts[1]
  }`, async () => {
    await instance.registerToken(2222, 'hash2', { from: accounts[1] })
    let tokenExists = await instance.exists(2222)
    assert.equal(tokenExists.valueOf(), true, 'Result should be true')
  })

  it(`It should check balance of ${accounts[1]}`, async () => {
    let balance = await instance.balanceOf(accounts[1])
    assert.equal(balance.valueOf(), 1, `balance ${balance} should be 1`)
  })

  it(`It should check total supply of the repository`, async () => {
    let supply = await instance.totalSupply()
    assert.equal(supply.valueOf(), 3, `total supply ${supply} should be 3`)
  })

  it(`It should check the length of owned tokens of ${
    accounts[0]
  }`, async () => {
    let ownedTokens = await instance.getOwnedTokens(accounts[0])
    assert.equal(
      ownedTokens.valueOf().length,
      2,
      `Owned tokens of ${accounts[0]} should be 2`
    )
  })

  it(`It should get the address of owner 2222`, async () => {
    let ownerOf = await instance.ownerOf(2222)
    assert.equal(
      ownerOf.valueOf(),
      accounts[1],
      `Owner of 1111 should be ${accounts[1]}`
    )
  })

  it('It should approve transfer the ownership of 1111 to dogAdoptionRepository address', async () => {
    await instance.approve(dogAdoptionContractAddress, 1111)
    let address = await instance.getApproved(1111)

    assert.equal(
      address.valueOf(),
      dogAdoptionContractAddress,
      `${address} should be equal to ${dogAdoptionContractAddress}`
    )
  })

  it('It should transfer ownership of token 1111 to this contract', async () => {
    await instance.transferFrom(accounts[0], dogAdoptionContractAddress, 1111, {
      from: accounts[0]
    })
    let newOwnerAddress = await instance.ownerOf(1111)
    assert.equal(
      newOwnerAddress.valueOf(),
      dogAdoptionContractAddress,
      `${newOwnerAddress} should be ${dogAdoptionContractAddress}`
    )
  })
})
