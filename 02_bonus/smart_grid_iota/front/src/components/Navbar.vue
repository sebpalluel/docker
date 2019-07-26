<template>
  <div id="nav">
    <div class="container">
      <nav class="navbar">
        <div class="navbar-brand">
          <router-link :to="{ name: 'Home' }" class="navbar-item">
            <!--<router-link :to="{ name: 'Home' }" class="navbar-item">-->
            <img src="../assets/logo.png" alt="logo" width="32" height="32" style="margin : 3px 8px 8px 8px">
            <h1 class="heading title"></h1>
              <h1 class="heading title is-5">IOTA SMART GRID</h1>
            </router-link>
            <div class="navbar-burger" v-bind:class="{ 'is-active': navVisible }" @click="navVisible = !navVisible">
              <span></span>
              <span></span>
              <span></span>
            </div>
        </div>
        <div class="navbar-menu" v-bind:class="{ 'is-active': navVisible }">
          <div class="navbar-start">

          </div>
          <div class="navbar-end">

            <div class="navbar-item animated":store="store" v-bind:class="{'fadeInDown': priceUSD !== 0}" style="opacity: 0">
              <a href="https://www.cryptocompare.com/coins/iot/overview/USD" class="button is-info" target="_blank">
                ${{priceUSD}}/Mi
              </a>
            </div>

            <div class="navbar-item">
              <b-dropdown @change="connectToIOTA" v-model="iota.provider" position="is-bottom-left">

                <button type="button" slot="trigger" class="button" :class="{
                'is-loading': iota.status === 'Connecting',
                'is-primary': iota.status === 'Connected',
                'is-danger': iota.status === 'Failed'}">
                  <span> {{ this.iota.status }} </span>
                  <b-icon icon="arrow_drop_down"></b-icon>
                </button>

                <b-dropdown-item custom>
                  <h1 class="title is-6">Latest Milestone:</h1>
                  <b-field class="subtitle">
                    <b-input expanded spellcheck="false" readonly :value="iota.latestMilestone"></b-input>
                    <p class="control">
                      <button class="button is-primary" v-clipboard:copy="iota.latestMilestone">Copy</button>
                    </p>
                  </b-field>
                </b-dropdown-item>
                <b-dropdown-item custom>
                  <h1 class="title is-6">Latest Solid Milestone:</h1>
                  <b-field class="subtitle">
                    <b-input expanded spellcheck="false" readonly :value="iota.latestSolidMilestone"></b-input>
                    <p class="control">
                      <button class="button is-primary" v-clipboard:copy="iota.latestSolidMilestone">Copy</button>
                    </p>
                  </b-field>
                </b-dropdown-item>
                <b-dropdown-item custom>
                  Node version: <b>{{ iota.version || "..." }}</b>
                </b-dropdown-item>
                <b-dropdown-item custom>
                  Node health: <b>{{ providerHealth }}</b>
                </b-dropdown-item>
                <hr class="dropdown-divider">
                <div v-for="prov in providerList">
                  <b-dropdown-item :value="prov">
                    <div class="media">
                      <b-icon v-if="prov.includes('https:')" class="media-left" icon="lock"></b-icon>
                      <b-icon v-else class="media-left" icon="public"></b-icon>
                      <div class="media-content">
                        <h3>{{ prov }}</h3>
                      </div>
                    </div>
                  </b-dropdown-item>
                </div>
                <b-dropdown-item custom>
                  <h1 class="title is-6">Custom Provider:</h1>
                  <b-field class="subtitle">
                    <b-input expanded spellcheck="false" v-model.sync="customProvider"></b-input>
                    <p class="control">
                      <button class="button is-primary" @click="addProvider">Add</button>
                    </p>
                  </b-field>
                </b-dropdown-item>
              </b-dropdown>

            </div>
            <at-menu @on-select="handleClick" theme="light" mode="horizontal" active-name="0">
              <at-menu-item name="api"><i class="icon icon-info"></i>API</at-menu-item>
              <at-menu-item name="consumer"><i class="icon icon-home" to="Consumer"></i>Consumer</at-menu-item>
              <at-menu-item name="producer"><i class="icon icon-zap"></i>Producer</at-menu-item>
              <at-menu-item name="battery"><i class="icon icon-battery"></i>Battery</at-menu-item>
            </at-menu>
            <!--<span class="icon">-->
            <!--<img src="../assets/smart_grid_house_OFF.png" alt="logo" width="42" height="42" style="margin: 6px">-->
            <!--</span>-->
            <!--<span>Consumer</span>-->
            <!--</router-link>-->
            <!--<router-link :to="{ name: 'Consumer' }" class="button">-->
            <!--<span class="icon">-->
            <!--<img src="../assets/smart_grid_panel_OFF.png" alt="logo" width="42" height="42" style="margin: 6px">-->
            <!--</span>-->
            <!--<span>Producer</span>-->
            <!--</router-link>-->
            <!--<router-link :to="{ name: 'Consumer' }" class="button">-->
            <!--<span class="icon">-->
            <!--<img src="../assets/smart_grid_battery_2.png" alt="logo" width="42" height="42" style="margin: 6px">-->
            <!--</span>-->
            <!--<span>Battery</span>-->
            <!--</router-link>-->
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
  import IOTA from 'iota.lib.js'
import ValueHelper from '../components/mixins/ValuesHelper'
import BModal from 'buefy/src/components/modal/Modal'
import WebSocketClient from 'websocket'

// public node list from IOTA's mainnet nodes, https://iotasupport.com/providers.json, and http://iotanode.host/
const defaultProviderList = [
  'https://turnip.iotasalad.org:14265',
  'http://p103.iotaledger.net:14700',
  'https://testnet140.tangle.works:443',
  'http://p101.iotaledger.net:14700'
]

const initialProvider = 'https://turnip.iotasalad.org:14265'

export default {
  name: 'Navbar',
  mixins: [ValueHelper],
  props: ["store"],
  data () {
    return {
      navVisible: false,
      customProvider: '',
      donationAddress: 'Coming soon...',
      providerList: defaultProviderList,
      iota: {
        status: '',
        link: null,
        provider: initialProvider,
        connected: false,
        latestMilestone: '',
        latestSolidMilestone: '',
        latestMilestoneIndex: 0,
        latestSolidSubtangleMilestoneIndex: 0
      },
      isProviderModalActive: false,
      intendedHTTPSite: null
    }
  },
  computed: {
    providerHealth () {
      return this.iota.latestSolidSubtangleMilestoneIndex + ' / ' + this.iota.latestMilestoneIndex
    }
  },
  methods: {
    handleClick: function(txt) {
      console.log('info click', txt);
    },
    showMessage: function () {
      //this.$Message('Thanks for using AT-UI')
      console.log('thanks');
    },
    addProvider () {
      if(this.customProvider) {
        this.providerList.push(this.customProvider)
        this.customProvider = ''
      }
    },
    connectToIOTA () {
      // if(window.location.protocol.includes('http:')) {
      if(window.location.protocol.includes('https:') && this.iota.provider.includes('http:')) {
        this.intendedHTTPSite = this.iota.provider
        this.isProviderModalActive = true
        // FIXME: this.iota.provider is stale
        // this.iota.provider = this.iota.link.provider ?
        return
      }

      this.iota.status = 'Connecting' // TODO: rename this.iota to this.iotaConnectionController
      this.iota.connected = false
      this.iota.latestMilestoneIndex = 0
      this.iota.latestSolidSubtangleMilestoneIndex = 0
      this.iota.version = null

      this.iota.link = new IOTA({
        provider: this.iota.provider
      })

      let currentLink = this.iota.link

      this.iota.link.api.getNodeInfo((err, success) => {
        if(currentLink !== this.iota.link) { return }
        if (err) {
          this.iota.status = 'Failed'
          return
        }
        this.iota.status = 'Connected'
        this.iota.connected = true
        this.iota.latestMilestone = success.latestMilestone
        this.iota.latestSolidMilestone = success.latestSolidSubtangleMilestone
        this.iota.latestMilestoneIndex = success.latestMilestoneIndex
        this.iota.latestSolidSubtangleMilestoneIndex = success.latestSolidSubtangleMilestoneIndex
        this.iota.version = success.appVersion
        this.store.iota = this.iota
      })
    },

  },
  mounted () {
    this.connectToIOTA()
    let lastAddress = []
	const ipMachine = '192.168.99.100'
    this.ws = new WebSocketClient.w3cwebsocket('ws://' + ipMachine + ':3021', 'smart-grid');
    this.ws.onmessage = async (e) => { try {
      //console.log(e.data.toString());
      this.store.messages = JSON.parse(e.data.toString())
      //console.log(this.store.messages);
      //if (this.store.messages.length)
      //this.$router.push({path: `/search/address/${this.store.messages[0].address}`})
    } catch (err) { console.error(err) }
    }
  }
}
</script>
