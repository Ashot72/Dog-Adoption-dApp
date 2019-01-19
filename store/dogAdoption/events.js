import web3 from '@/ethereum/web3'

const getCurrentBlock = () => web3.eth.getBlockNumber()

const watchEvent = async (dogAdoptionInstance, cb, name) => {
  const currentBlock = await getCurrentBlock()

  const f = dogAdoptionInstance.events[name]
  f(
    {
      fromBlock: currentBlock,
      toBlock: 'latest'
    },
    (error, event) => (error ? cb({ error }) : cb({ event }))
  )
}

const watchIfDogAdoptinCreated = async (dogAdoptionInstance, cb) =>
  watchEvent(dogAdoptionInstance, cb, 'DogAdoptinCreated')

const watchIfDogAdoptinCanceled = async (dogAdoptionInstance, cb) =>
  watchEvent(dogAdoptionInstance, cb, 'DogAdoptionCanceled')

const watchIfDogAdopterAdded = async (dogAdoptionInstance, cb) =>
  watchEvent(dogAdoptionInstance, cb, 'DogAdopterAdded')

const watchIfDogAdopterApproved = async (dogAdoptionInstance, cb) =>
  watchEvent(dogAdoptionInstance, cb, 'DogAdopterApproved')

const watchIfDogAdopterRefunded = async (dogAdoptionInstance, cb) =>
  watchEvent(dogAdoptionInstance, cb, 'DogAdopterRefunded')

export {
  watchIfDogAdoptinCreated,
  watchIfDogAdoptinCanceled,
  watchIfDogAdopterAdded,
  watchIfDogAdopterApproved,
  watchIfDogAdopterRefunded
}
