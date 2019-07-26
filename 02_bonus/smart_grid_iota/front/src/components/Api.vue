<template>
  <div class="container">
    <div class="api">
      <div class="screen_div" id="up">
        <div class="actor">
          <div v-if="searchActive(store.messages, 'storage')">
            <div v-if="getType(store.messages, 'storage', 'ask')">
              <img src="../assets/smart_grid_battery_3.png" alt="logo" width="170" height="170" style="margin: 6px">
            </div>
            <div v-else>
              <img src="../assets/smart_grid_battery_1.png" alt="logo" width="170" height="170" style="margin: 6px">
            </div>
          </div>
          <div v-else>
            <img src="../assets/smart_grid_battery_2.png" alt="logo" width="170" height="170" style="margin: 6px">
          </div>
          <div v-if="searchActive(store.messages, 'storage')">
          <at-progress :percent=getCharge(store.messages) :stroke-width="6"></at-progress>
        </div>
          <at-collapse id="producer_collapse" accordion :value="0" v-for="message in store.messages" v-if="message.id.split(':')[0] === 'storage'">
            <at-collapse-item name="collapse1">
              <div slot="title">Battery <i class="icon icon-zap"></i></div>
              <at-timeline class="timeline">
                <at-timeline-item color="blue">
                  <i slot="dot" class="icon icon-tag"></i>
                  <p>id: {{message.id}}</p>
                </at-timeline-item>
                <at-timeline-item color="red" >
                  <i slot="dot" class="icon icon-map-pin"></i>
                  <p class="truncate">address: {{message.address}}</p>
                </at-timeline-item>
                <at-timeline-item color="green">
                  <i slot="dot" class="icon icon-zap"></i>
                  <p>power: {{message.power}} W</p>
                </at-timeline-item>
                <at-timeline-item color="yellow">
                  <i slot="dot" class="icon icon-circle"></i>
                  <p>balance: {{message.balance}} IOTA</p>
                </at-timeline-item>
              </at-timeline>
            </at-collapse-item>
          </at-collapse>
        </div>
      </div>
    </div>
    <div class="screen_div" id="mid">
      <div class="robot">
        <div v-if="getBoolType(store.messages, 'ask') && getBoolType(store.messages, 'bid')">
          <img src="../assets/smart_grid_API_ON.png" alt="logo" width="170" height="170" style="margin: 6px">
        </div>
        <div v-else>
          <img src="../assets/smart_grid_API_OFF.png" alt="logo" width="170" height="170" style="margin: 6px">
        </div>
        <div id="flash">
          <at-badge :value="12" status="success"dot>
            <span>ask</span>
          </at-badge>
          <div>
            <div v-if="getBoolType(store.messages, 'ask') && getBoolType(store.messages, 'bid')">
              <img src="../assets/smart_grid_flash_ON.png" alt="logo" width="120" height="120" style="margin: 6px">
            </div>
            <div v-else>
              <img src="../assets/smart_grid_flash_OFF.png" alt="logo" width="70" height="70" style="margin: 6px">
            </div>
          </div>
          <at-badge :value="12"dot>
            <span>Bid</span>
          </at-badge>
        </div>
        <div class="ask_bid"></div>
        <at-button v-if="getBoolType(store.messages, 'ask')" type="success">{{getIDbyType(store.messages, 'ask').id}}</at-button>
        <at-button v-if="getBoolType(store.messages, 'bid')" type="error">{{getIDbyType(store.messages, 'bid').id}}</at-button>
      </div>
    </div>
    <div class="screen_div" id="down">
      <div class="actor" id="consumer">
        <div id="consumer_top">
          <div id="consumer_img">
            <div v-if="searchActive(store.messages, 'consumer')">
              <img src="../assets/smart_grid_house_ON.png" alt="logo" width="170" height="170" style="margin: 6px">
            </div>
            <div v-else>
              <img src="../assets/smart_grid_house_OFF.png" alt="logo" width="170" height="170" style="margin: 6px">
            </div>
          </div>
        </div>
        <at-collapse accordion :value="0" v-for="message in store.messages" v-if="message.id.split(':')[0] === 'consumer'">
          <at-collapse-item name="collapse1">
            <div slot="title">Consumer <i class="icon icon-home"></i></div>
            <at-timeline class="timeline">
              <at-timeline-item color="blue">
                <i slot="dot" class="icon icon-tag"></i>
                <p>id: {{message.id}}</p>
              </at-timeline-item>
              <at-timeline-item color="red">
                <i slot="dot" class="icon icon-map-pin"></i>
                <p class="truncate">address: {{message.address}}</p>
              </at-timeline-item>
              <at-timeline-item color="green">
                <i slot="dot" class="icon icon-zap"></i>
                <p>ask: {{message.power}} W</p>
              </at-timeline-item>
              <at-timeline-item color="yellow">
                <i slot="dot" class="icon icon-circle"></i>
                <p>balance: {{message.balance}} IOTA</p>
              </at-timeline-item>
            </at-timeline>
          </at-collapse-item>
        </at-collapse>
      </div>
      <div class="actor" id="producer">
        <div id="producer_top">
          <div id="producer_img">
            <div v-if="searchActive(store.messages, 'producer')">
              <img src="../assets/smart_grid_panel_ON.png" alt="logo" width="170" height="170" style="margin: 6px">
            </div>
            <div v-else>
              <img src="../assets/smart_grid_panel_OFF.png" alt="logo" width="170" height="170" style="margin: 6px">
            </div>
          </div>
        </div>
        <at-collapse id="producer_collapse" accordion :value="0" v-for="message in store.messages" v-if="message.id.split(':')[0] === 'producer'">
          <at-collapse-item name="collapse1">
            <div slot="title">Producer <i class="icon icon-zap"></i></div>
            <at-timeline class="timeline">
              <at-timeline-item color="blue">
                <i slot="dot" class="icon icon-tag"></i>
                <p>id: {{message.id}}</p>
              </at-timeline-item>
              <at-timeline-item color="red" >
                <i slot="dot" class="icon icon-map-pin"></i>
                <p class="truncate">address: {{message.address}}</p>
              </at-timeline-item>
              <at-timeline-item color="green">
                <i slot="dot" class="icon icon-zap"></i>
                <p>power: {{message.power}} W</p>
              </at-timeline-item>
              <at-timeline-item color="yellow">
                <i slot="dot" class="icon icon-circle"></i>
                <p>balance: {{message.balance}} IOTA</p>
              </at-timeline-item>
            </at-timeline>
          </at-collapse-item>
        </at-collapse>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
  export default {
    name: 'Api',
    props: ["store"],
    data() {

    },
    methods: {
      searchActive: function (msgs, name) {
        let active = false;
        if (msgs && name) {
          active = msgs.find(function (element) {
            if (element.id.split(':')[0] === name)
              return (true);
          })
        }
        return (active);
      },

      getType: function (msgs, name, order) {
        let active = false;
        if (msgs && name) {
          active = msgs.find(function (element) {
            if (element.id.split(':')[0] === name)
              if (element.type === order)
                return (true);
          })
        }
        return (active);
      },

      getBoolType: function (msgs, order) {
        let active = false;
        if (msgs && order) {
          active = msgs.find(function (element) {
            if (element.type === order)
              return (true);
          })
        }
        return (active);
      },

      getIDbyType: function (msgs, order) {
        let active = undefined;
        if (msgs && order) {
          active = msgs.find(function (element) {
            if (element.type === order)
              return (element.id);
          })
        }
        return (active);
      },

      getCharge: function (msgs) {
        let charge = 0;
        if (msgs) {
          charge = msgs.find(function (element) {
            if (element.id.split(':')[0] === 'storage')
              return (element.charge);
          })
        }
        if (charge)
          return (parseInt(charge.charge));
        else
          return (0);
      }
    },
    components: {
    },
    mounted () {
    }
  }
</script>

<style scoped>

.screen_div {
  width: 100%;
  padding-bottom: 4.5%;
}
#up .actor {
  text-align: center;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

#mid {
  text-align: center;
}

.robot {
  width: 50%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.robot #loading_robot{
  position: relative;
  bottom: 80px;
}

#down > .actor{
  display: inline-block;
  width:40%;
}

#consumer {
  float: right;
  position: relative;
  text-align:center;
}

#consumer_top #consumer_img {
  display:inline-block;
  position:relative;
  margin-right:0;
}

#producer_collapse {
  width:100%;
}

#producer {
  float: right;
  position: relative;
  text-align:center;
}

#producer_top #producer_img {
  display:inline-block;
  position:relative;
  margin-right:0;
}

#producer_collapse {
  width:100%;
}
/*#producer img {
float: right;
}*/

#consumer {
  float: left;
}
.actor {
  transition: all ease .25s;
  width: 35%;
}

.timeline {
  text-align:left;
}

.truncate {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
}

#flash {
  display:flex;
  justify-content: center;
  align-items: center;
}

</style>
