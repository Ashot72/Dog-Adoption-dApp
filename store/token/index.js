import Token from '@/ethereum/token'

import {
  SETOWNEDTOKENS,
  SETIPFSDATA,
  REGISTERTOKEN,
  TRANSFEROWNERSHIP,
  FETCHOWNEDTOKENS,
  FETCHIPFSDATA,
  REMOVETOKEN
} from './types'
import { FAILED, SETLOADING } from '../types'

import { watchIfTokenRegistered } from './events'

export const state = () => ({
  tokens: [],
  ipfsData: null
})

export const mutations = {
  [SETOWNEDTOKENS] (state, tokens) {
    state.tokens = tokens
  },
  [SETIPFSDATA] (state, ipfsData) {
    state.ipfsData = ipfsData
  }
}

export const actions = {
  [REGISTERTOKEN] ({ commit, dispatch, rootState }, { tokenId, uri }) {
    return new Promise(async resolve => {
      try {
        const tokenInstance = Token(rootState.tokenAddress)
        commit(SETLOADING, true, { root: true })
        await tokenInstance.methods
          .registerToken(+tokenId, uri)
          .send({ from: rootState.currentAccount, gas: '1000000' })

        watchIfTokenRegistered(tokenInstance, async res => {
          if (res.event) {
            resolve()
          } else {
            dispatch(
              FAILED,
              `Couldn't verify asset creation process: ${
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
  async [REMOVETOKEN] ({ commit, dispatch, rootState }, tokenId) {
    try {
      const tokenInstance = Token(rootState.tokenAddress)
      commit(SETLOADING, true, { root: true })

      await tokenInstance.methods
        .removeToken(rootState.currentAccount, +tokenId)
        .send({ from: rootState.currentAccount, gas: '1000000' })

      dispatch(FETCHOWNEDTOKENS)
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  async [FETCHOWNEDTOKENS] ({ commit, dispatch, rootState }) {
    try {
      const tokenInstance = Token(rootState.tokenAddress)
      commit(SETLOADING, true, { root: true })

      const ownedTokens = await tokenInstance.methods
        .getOwnedTokens(rootState.currentAccount)
        .call()

      commit(SETOWNEDTOKENS, ownedTokens)
      commit(SETLOADING, false, { root: true })
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  async [FETCHIPFSDATA] ({ commit, dispatch, rootState }, tokenId) {
    try {
      const tokenInstance = Token(rootState.tokenAddress)
      commit(SETLOADING, true, { root: true })

      const tokenURI = await tokenInstance.methods.tokenURI(+tokenId).call()

      const url = process.env.ipfsUrl + tokenURI
      const response = await fetch(url)
      const ipfsData = await response.json()

      commit(SETIPFSDATA, ipfsData)
      commit(SETLOADING, false, { root: true })
    } catch (e) {
      dispatch(FAILED, e, { root: true })
    }
  },
  [TRANSFEROWNERSHIP] ({ commit, dispatch, rootState }, tokenId) {
    return new Promise(async resolve => {
      try {
        const tokenInstance = Token(rootState.tokenAddress)
        commit(SETLOADING, true, { root: true })

        await tokenInstance.methods
          .transferFrom(
            rootState.currentAccount,
            rootState.dogAdoptionAddress,
            +tokenId
          )
          .send({ from: rootState.currentAccount, gas: '1000000' })
        resolve()
      } catch (e) {
        dispatch(FAILED, e, { root: true })
      }
    })
  }
}
