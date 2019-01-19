import { mapState } from 'vuex'

export const pagesMixin = {
  data () {
    return {
      updatedIndex: -1
    }
  },
  computed: {
    ...mapState(['currentAccount', 'loading', 'currentBlock'])
  },
  methods: {
    isInActive (dogAdoption) {
      return (
        dogAdoption.canceled ||
        dogAdoption.approved ||
        this.currentBlock >= dogAdoption.endBlock
      )
    },
    isActive (dogAdoption) {
      return (
        !dogAdoption.canceled &&
        !dogAdoption.approved &&
        this.currentBlock < dogAdoption.endBlock
      )
    },
    isNotOwner (owner) {
      return this.currentAccount !== owner
    },
    isOwner (owner) {
      return this.currentAccount === owner
    },
    showHideInfo (index) {
      this.updatedIndex === index
        ? (this.updatedIndex = -1)
        : (this.updatedIndex = index)
    }
  }
}
