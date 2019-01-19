import web3 from '@/ethereum/web3'
import TokenRepository from '@/ethereum/build/contracts/TokenRepository.json'
import DogAdoptionRepository from '@/ethereum/build/contracts/DogAdoptionRepository.json'

import {
  SETADDRESS,
  SETLOADING,
  SETNETWORKID,
  SETCURRENTACCOUNT,
  SETCURRENTBLOCK,
  FETCHCURRENTBLOCK,
  FAILEDERROR,
  FAILED,
  ADDNETWORKADDRESS,
  FETCHCURRENTACCOUNT
} from './types'

export const state = () => ({
  currentAccount: '',
  tokenAddress: '',
  dogAdoptionAddress: '',
  currentBlock: '',
  networkId: '',
  error: '',
  loading: false
})

export const getters = {
  networkReady: ({ currentAccount, networkId }) => {
    return (
      web3.currentProvider.isMetaMask &&
      currentAccount !== '' &&
      networkId !== ''
    )
  }
}

export const mutations = {
  [SETADDRESS] (state, { tokenAddress, dogAdoptionAddress }) {
    state.tokenAddress = tokenAddress
    state.dogAdoptionAddress = dogAdoptionAddress
    console.log(
      `Token Address: ${tokenAddress}, Dog Adoption Address ${dogAdoptionAddress}`
    )
  },
  [SETCURRENTACCOUNT] (state, currentAccount) {
    state.currentAccount = currentAccount
  },
  [SETNETWORKID] (state, networkId) {
    state.networkId = networkId
  },
  [SETLOADING] (state, loading) {
    state.loading = loading
  },
  [SETCURRENTBLOCK] (state, currentBlock) {
    state.currentBlock = currentBlock
  },
  [FAILEDERROR] (state, error) {
    state.loading = false
    state.error = error.message
  }
}

export const actions = {
  [ADDNETWORKADDRESS] ({ commit, dispatch, rootState }, networkId) {
    return new Promise(resolve => {
      try {
        const tokenAddress = TokenRepository['networks'][networkId].address

        const dogAdoptionAddress =
          DogAdoptionRepository['networks'][networkId].address

        commit(SETNETWORKID, networkId)
        commit(SETADDRESS, { tokenAddress, dogAdoptionAddress })
        resolve()
      } catch (e) {
        dispatch(FAILED, e, { root: true })
      }
    })
  },
  [FETCHCURRENTACCOUNT] ({ commit }) {
    setInterval(() => {
      web3.eth.getAccounts().then(accounts => {
        if (accounts.length > 0) {
          commit(SETCURRENTACCOUNT, accounts[0])
        }
      })
    }, 2000)
  },
  [FETCHCURRENTBLOCK] ({ commit }) {
    return web3.eth.getBlockNumber().then(currentBlock => {
      commit(SETCURRENTBLOCK, currentBlock)
    })
  },
  [FAILED] ({ commit }, error) {
    commit(FAILEDERROR, error)
  }
}
