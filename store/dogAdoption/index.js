import DogAdoption from '@/ethereum/dogAdoption'
import Token from '@/ethereum/token'
import web3 from '@/ethereum/web3'

import {
  ADDDOGADOPTERS,
  SETDOGADOPTION,
  ADOPT,
  FETCHDOGADOPTIONS,
  FETCHDOGADOPTION,
  FETCHDOGADOPTERS,
  CREATEDOGADOPTION,
  ADDDOGADOPTIONS,
  RESETDOGADOPTIONS,
  RESETDOGADOPTERS,
  DOGADOPTIONCANCELED,
  CANCELDOGADOPTION,
  SETWINNER,
  MAKEWINNER,
  WITHDRAW,
  SETWITHDRAWAL
} from './types'

import { FAILED, SETLOADING } from '../types'

import {
  watchIfDogAdoptinCreated,
  watchIfDogAdoptinCanceled,
  watchIfDogAdopterAdded,
  watchIfDogAdopterApproved,
  watchIfDogAdopterRefunded
} from './events'

export const state = () => ({
  dogAdoptions: [],
  dogAdopters: {},
  currentDogAdoption: null
})

export const getters = {
  dogAdoptersByIndex: state => index => state.dogAdopters[index]
}

export const mutations = {
  [RESETDOGADOPTIONS] (state) {
    state.dogAdoptions = []
  },
  [ADDDOGADOPTIONS] (state, dogAdoption) {
    state.dogAdoptions.push(dogAdoption)
  },
  [DOGADOPTIONCANCELED] (state, index) {
    const dogAdoption = state.dogAdoptions.find(d => d.index === index)
    dogAdoption.canceled = true
  },
  [RESETDOGADOPTERS] (state) {
    state.dogAdopters = []
  },
  [ADDDOGADOPTERS] (state, { dogAdoptionId, dogAdopter }) {
    if (!state.dogAdopters[dogAdoptionId]) {
      state.dogAdopters[dogAdoptionId] = {}
    }
    state.dogAdopters[dogAdoptionId][dogAdopter.from] = dogAdopter
  },
  [SETDOGADOPTION] (state, currentDogAdoption) {
    state.currentDogAdoption = currentDogAdoption
  },
  [SETWINNER] (state, { adopterAddress, dogAdoptionId }) {
    const dogAdopter = state.dogAdopters[dogAdoptionId][adopterAddress]
    dogAdopter.winner = true
    dogAdopter.refunded = true
    state.currentDogAdoption.approved = true
  },
  [SETWITHDRAWAL] (state, { adopterAddress, dogAdoptionId }) {
    const dogAdopter = state.dogAdopters[dogAdoptionId][adopterAddress]
    dogAdopter.refunded = true
  }
}

export const actions = {
  async [FETCHDOGADOPTERS] ({ commit, dispatch, rootState }, dogAdoptionId) {
    try {
      commit(SETLOADING, true, { root: true })
      commit(RESETDOGADOPTERS)

      const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)
      let dogAdoptersCount = await dogAdoptionInstance.methods
        .dogAdopterAddressesCount(dogAdoptionId)
        .call()

      if (dogAdoptersCount == 0) {
        commit(SETLOADING, false, { root: true })
      } else {
        const originalDogAdopters = await Promise.all(
          Array(+dogAdoptersCount)
            .fill()
            .map((element, index) =>
              dogAdoptionInstance.methods
                .getDogAdopter(dogAdoptionId, index)
                .call()
            )
        )

        const tokenInstance = Token(rootState.tokenAddress)
        let count = 0

        originalDogAdopters.map(async (dogAdopters, index) => {
          try {
            const tokenURI = await tokenInstance.methods
              .tokenURI(dogAdopters.tokenId)
              .call()

            const url = process.env.ipfsUrl + tokenURI
            const response = await fetch(url)
            const ipfs = await response.json()

            commit(ADDDOGADOPTERS, {
              dogAdoptionId,
              dogAdopter: {
                index,
                ...dogAdopters,
                ...ipfs
              }
            })
            count === dogAdoptersCount - 1
              ? commit(SETLOADING, false, { root: true })
              : count++
          } catch (e) {
            dispatch(FAILED, e, { root: true })
          }
        })
      }
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  async [MAKEWINNER] (
    { commit, dispatch, rootState },
    { dogAdoptionId, adopterAddress }
  ) {
    try {
      commit(SETLOADING, true, { root: true })
      const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)
      await dogAdoptionInstance.methods
        .approveDogAdopter(dogAdoptionId, adopterAddress)
        .send({ from: rootState.currentAccount, gas: '1000000' })

      watchIfDogAdopterApproved(dogAdoptionInstance, async res => {
        if (res.event) {
          commit(SETWINNER, { adopterAddress, dogAdoptionId })
          commit(SETLOADING, false, { root: true })
        } else {
          dispatch(
            FAILED,
            `Couldn't make a winner: ${res.error}. Please try again`,
            { root: true }
          )
        }
      })
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  async [WITHDRAW] (
    { commit, dispatch, rootState },
    { dogAdoptionId, adopterAddress }
  ) {
    try {
      commit(SETLOADING, true, { root: true })
      const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)
      await dogAdoptionInstance.methods
        .withdraw(dogAdoptionId)
        .send({ from: rootState.currentAccount, gas: '1000000' })

      watchIfDogAdopterRefunded(dogAdoptionInstance, async res => {
        if (res.event) {
          commit(SETWITHDRAWAL, { adopterAddress, dogAdoptionId })
          commit(SETLOADING, false, { root: true })
        } else {
          dispatch(
            FAILED,
            `Couldn't withdraw: ${res.error}. Please try again`,
            { root: true }
          )
        }
      })
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  async [FETCHDOGADOPTION] ({ state, commit, dispatch, rootState }, index) {
    try {
      commit(SETLOADING, true, { root: true })

      const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)
      let dogAdoptionsCount = await dogAdoptionInstance.methods
        .dogAdoptionsCount()
        .call()

      if (dogAdoptionsCount == 0) {
        commit(SETLOADING, false, { root: true })
      } else {
        let dogAdoption = state.dogAdoptions.find(d => d.index == index)

        if (dogAdoption) {
          commit(SETDOGADOPTION, {
            index,
            ...dogAdoption
          })
        } else {
          dogAdoption = await dogAdoptionInstance.methods
            .dogAdoptions(index)
            .call()

          commit(SETDOGADOPTION, {
            index,
            ...dogAdoption
          })
        }
      }
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  async [FETCHDOGADOPTIONS] ({ commit, dispatch, rootState }) {
    try {
      commit(SETLOADING, true, { root: true })
      commit(RESETDOGADOPTIONS)

      const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)
      let dogAdoptionsCount = await dogAdoptionInstance.methods
        .dogAdoptionsCount()
        .call()

      if (dogAdoptionsCount == 0) {
        commit(SETLOADING, false, { root: true })
      } else {
        const originalDogAdoptions = await Promise.all(
          Array(+dogAdoptionsCount)
            .fill()
            .map((element, index) =>
              dogAdoptionInstance.methods.dogAdoptions(index).call()
            )
        )
        const tokenInstance = Token(rootState.tokenAddress)
        let count = 0

        originalDogAdoptions.map(async (dogAdoptions, index) => {
          try {
            const tokenURI = await tokenInstance.methods
              .tokenURI(dogAdoptions.tokenId)
              .call()

            const url = process.env.ipfsUrl + tokenURI
            const response = await fetch(url)
            const ipfs = await response.json()

            commit(ADDDOGADOPTIONS, {
              index,
              ...ipfs,
              ...dogAdoptions,
              ownerName: ipfs.name
            })
            count === dogAdoptionsCount - 1
              ? commit(SETLOADING, false, { root: true })
              : count++
          } catch (e) {
            dispatch(FAILED, e, { root: true })
          }
        })
      }
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  async [CANCELDOGADOPTION] ({ commit, dispatch, rootState }, index) {
    try {
      commit(SETLOADING, true, { root: true })

      const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)

      await dogAdoptionInstance.methods
        .cancelDogAdoption(index)
        .send({ from: rootState.currentAccount, gas: '1000000' })

      watchIfDogAdoptinCanceled(dogAdoptionInstance, async res => {
        if (res.event) {
          commit(DOGADOPTIONCANCELED, index)
          commit(SETLOADING, false, { root: true })
        } else {
          dispatch(
            FAILED,
            `Couldn't cancel dog adoption: ${res.error}. Please try again`,
            { root: true }
          )
        }
      })
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  [CREATEDOGADOPTION] (
    { commit, dispatch, rootState },
    { name, tokenId, endBlock }
  ) {
    return new Promise(async resolve => {
      try {
        const tokenAddress = rootState.tokenAddress
        const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)
        commit(SETLOADING, true, { root: true })

        await dogAdoptionInstance.methods
          .createDogAdoption(name, tokenAddress, +tokenId, endBlock)
          .send({ from: rootState.currentAccount, gas: '1000000' })

        watchIfDogAdoptinCreated(dogAdoptionInstance, async res => {
          if (res.event) {
            //  dispatch(FETCHDOGADOPTIONS)
            resolve()
          } else {
            dispatch(
              FAILED,
              `Couldn't create dog adoption with tokenId '${tokenId}': ${
                res.error
              }. Please try again`,
              { root: true }
            )
          }
        })
      } catch (e) {
        dispatch(FAILED, e, { root: true })
      }
    })
  },
  async [ADOPT] (
    { commit, dispatch, getters, rootState },
    { index, tokenId, value }
  ) {
    return new Promise(async resolve => {
      try {
        commit(SETLOADING, true, { root: true })

        const tokenAddress = rootState.tokenAddress
        const dogAdoptionInstance = DogAdoption(rootState.dogAdoptionAddress)

        await dogAdoptionInstance.methods
          .addDogAdopter(index, tokenAddress, +tokenId)
          .send({
            from: rootState.currentAccount,
            gas: '1000000',
            value: web3.utils.toWei(value.toString(), 'ether')
          })

        watchIfDogAdopterAdded(dogAdoptionInstance, async res => {
          if (res.event) {
            commit(SETLOADING, false, { root: true })
            resolve()
          } else {
            dispatch(
              FAILED,
              `Couldn't add dog adopter with tokenId '${tokenId}': ${
                res.error
              }. Please try again`,
              { root: true }
            )
          }
        })
      } catch (e) {
        dispatch(FAILED, e, { root: true })
      }
    })
  }
}
