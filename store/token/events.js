import web3 from '@/ethereum/web3'

const getCurrentBlock = () => web3.eth.getBlockNumber()

export const watchIfTokenRegistered = async (tokenInstance, cb) => {
  const currentBlock = await getCurrentBlock()

  tokenInstance.events.TokenRegistered(
    {
      fromBlock: currentBlock,
      toBlock: 'latest'
    },
    (error, event) => (error ? cb({ error }) : cb({ event }))
  )
}
