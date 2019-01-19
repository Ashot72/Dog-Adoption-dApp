import Dialog from '@/components/Dialog'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { SETLOADING, FAILED } from '@/store/types'
import {
  REGISTERTOKEN,
  FETCHOWNEDTOKENS,
  FETCHIPFSDATA,
  TRANSFEROWNERSHIP,
  REMOVETOKEN
} from '@/store/token/types'
const BigNumber = require('bignumber.js')
const ipfsAPI = require('ipfs-api')

export const dogAdoptMixin = {
  props: ['btnClass', 'btnColor', 'index'],
  data () {
    return {
      tokenId: '',
      selectedToken: null,
      imageName: '',
      btnLoading: false,
      btnRemoveTokenLoading: false,
      stepperIndex: 1,
      dogAdoptDialog: false,
      ipfsDataDialog: false,
      dialog: false,
      snackbar: false,
      loadingMessage: '',
      inputMinRules: [
        v => !!v || 'The field is required',
        v => (v && v.length >= 3) || 'Minimum length is 3 characters'
      ],
      inputSpecificLengthRules: [
        v => !!v || 'The field is required',
        v => /^\d+$/.test(v) || 'Must be number',
        v => /^\d{9}/.test(v) || 'Length must be 9 characters'
      ],
      ipfs: {
        name: '',
        phone: '',
        info: '',
        image: ''
      },
      dialogSlot: {
        title: '',
        content: ''
      },
      snackbarProp: {
        content: '',
        timeout: 3000
      }
    }
  },
  computed: {
    ...mapGetters(['networkReady']),
    ...mapState(['loading', 'error', 'currentBlock']),
    ...mapState('token', ['tokens', 'ipfsData']),
    ipfsApi () {
      const { host, post, protocol } = process.env.infura
      return ipfsAPI(host, post, { protocol })
    },
    isImage () {
      return (
        this.ipfs.image.indexOf('image/png') != -1 ||
        this.ipfs.image.indexOf('image/gif') != -1 ||
        this.ipfs.image.indexOf('image/jpeg') != -1
      )
    }
  },
  watch: {
    loading (state) {
      if (!state) {
        this.btnLoading = false
        this.btnRemoveTokenLoading = false
      }
    },
    error (message) {
      this.btnLoading = false
      this.resetImage()
      if (message) {
        this.failed('')
        const revert = message.lastIndexOf('revert')
        revert !== -1
          ? this.showDialog('Error', message.substring(revert))
          : this.showDialog('Error', message)
      }
    }
  },
  components: {
    Dialog
  },
  methods: {
    ...mapMutations({ setLoading: SETLOADING }),
    ...mapActions({ failed: FAILED }),
    ...mapActions('token', {
      registerToken: REGISTERTOKEN,
      fetchOwnedTokens: FETCHOWNEDTOKENS,
      fetchIPFSData: FETCHIPFSDATA,
      transferOwnership: TRANSFEROWNERSHIP,
      removeToken: REMOVETOKEN
    }),
    async removeSelToken () {
      if (this.$refs.transferOwnershipForm.validate()) {
        let res = await this.$confirm(
          `Do you really want to remove token '${this.selectedToken}'?`,
          {
            title: 'Warning'
          }
        )
        if (res) {
          this.btnRemoveTokenLoading = true
          this.loadingMessage = 'Please wait while removing the token'
          this.removeToken(this.selectedToken).then(() => {
            this.$refs.transferOwnershipForm.reset()
            this.btnRemoveTokenLoading = false
          })
        }
      }
    },
    changeToken () {
      this.loadingMessage = 'Please wait while getting info from IPFS'
      this.fetchIPFSData(this.selectedToken)
      this.ipfsDataDialog = true
    },
    openDialog () {
      this.setDefault(true)
      this.tokenId = new BigNumber(`${this.getRandomInt(123456789, 999999999)}`)
    },
    resetImage () {
      ;(this.imageName = ''), (this.ipfs.image = '')
    },
    getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    },
    skipAssets () {
      this.$refs.assetForm.reset()
      this.stepperIndex++
      setTimeout(() => {
        this.loadingMessage = 'Please wait while getting tokens'
        this.fetchOwnedTokens()
      }, 100)
    },
    submitAsset () {
      if (this.$refs.assetForm.validate()) {
        this.btnLoading = true
        this.setLoading(true)
        this.ipfsApi
          .add([Buffer.from(JSON.stringify(this.ipfs))])
          .then(res => {
            const hash = res[0].hash

            this.registerToken({
              tokenId: this.tokenId,
              uri: hash
            }).then(() => {
              this.loadingMessage = 'Please wait while getting tokens'
              this.fetchOwnedTokens()
              this.btnLoading = false
              this.stepperIndex++
              this.setLoading(false)
              this.resetImage()
              this.showSnackbar(`Token ${this.tokenId} successfully created`)
              console.log('IPFS path: ', process.env.ipfsUrl + hash)
            })
          })
          .catch(err => {
            this.btnLoading = false
            this.showDialog('IPFS Error', err.message)
          })
      }
    },
    submitTransferOwnership () {
      if (this.$refs.transferOwnershipForm.validate()) {
        this.btnLoading = true
        this.loadingMessage = 'Please wait while transfering ownership'
        this.transferOwnership(this.selectedToken).then(() => {
          this.btnLoading = false
          this.stepperIndex++
          this.setLoading(false)
        })
      }
    },
    showSnackbar (content, timeout = 3000) {
      this.snackbarProp.timeout = timeout
      this.snackbarProp.content = content
      this.snackbar = true
    },
    showDialog (title, content) {
      this.dialogSlot.title = title
      this.dialogSlot.content = content
      this.dialog = true
    },
    pickFile () {
      this.$refs.image.click()
    },
    onFilePicked (e) {
      const files = e.target.files
      if (files[0] !== undefined) {
        this.imageName = files[0].name
        if (this.imageName.lastIndexOf('.') <= 0) {
          this.showDialog('Image File', 'Selected file must be an image')
          return
        }

        const fr = new FileReader()
        fr.readAsDataURL(files[0])
        fr.addEventListener('load', () => {
          this.ipfs.image = fr.result

          if (!this.isImage) {
            this.resetImage()
            this.showDialog(
              'Image Type Error',
              "Selected file must be an image of type 'png', 'jpg' or 'gif'"
            )
          }
        })
      } else {
        this.resetImage()
      }
    },
    setDefault (open = false) {
      this.btnLoading = false
      this.btnRemoveTokenLoading = false
      this.loadingMessage = ''
      this.selectedToken = ''

      if (this.$refs.assetForm) {
        this.$refs.assetForm.reset()
      }
      if (this.$refs.transferOwnershipForm) {
        this.$refs.transferOwnershipForm.reset()
      }
      if (this.$refs.dogAdoptionForm) {
        this.$refs.dogAdoptionForm.reset()
      }
      if (this.$refs.paymentForm) {
        this.$refs.paymentForm.reset()
        this.payment = 0
      }
      this.resetImage()
      this.setLoading(false)

      open ? (this.stepperIndex = 1) : (this.dogAdoptDialog = false)
    },
    close () {
      this.setDefault()
    }
  }
}
