
<template>
  <div>
    <div class="userlist">
      <div class="user-container">
        <div
          class="user-container"
          v-for="(user, i) of users"
          :key="i"
        >
          <div class="user">
            <img
              :src="user.picture"
              @click="toggleUserStats(user)"
              alt=""
            />
            <div class="id">{{ user.id.split('-')[0] }}</div>
            <div
              class="alias"
              :class="getProvider(user.provider)"
                >{{ user.alias }}
            </div>
            <div class="email">{{ user.email }}</div>
          </div>
          <div class="user-details" v-if="user.stats">
            <div class="table" data-key='messages'>
              <div class="tr">
                <div class="cell">Normal =></div>
                <div class="cell">{{ user.stats.messages.normal }}</div>
              </div>
              <div class="tr">
                <div class="cell">Simple =></div>
                <div class="cell">{{ user.stats.messages.simple }}</div>
              </div>
              <div class="tr">
                <div class="cell">Quip =></div>
                <div class="cell">{{ user.stats.messages.quip }}</div>
              </div>
              <div class="tr">
                <div class="cell">Notice =></div>
                <div class="cell">{{ user.stats.messages.notice }}</div>
              </div>
              <div class="tr">
                <div class="cell">Emote =></div>
                <div class="cell">{{ user.stats.messages.emote }}</div>
              </div>
              <div class="tr">
                <div class="cell">Total =></div>
                <div class="cell">{{ getMessageTotal(user.stats) }}</div>
              </div>
            </div>
            <div class="table" data-key='xp messages'>
              <div class="tr">
                <div class="cell">Normal =></div>
                <div class="cell">{{ user.stats.xp.messages.normal }}</div>
              </div>
              <div class="tr">
                <div class="cell">Simple =></div>
                <div class="cell">{{ user.stats.xp.messages.simple }}</div>
              </div>
              <div class="tr">
                <div class="cell">Quip =></div>
                <div class="cell">{{ user.stats.xp.messages.quip }}</div>
              </div>
              <div class="tr">
                <div class="cell">Total =></div>
                <div class="cell">{{ getXPMsgTotal(user.stats.xp) }}</div>
              </div>
            </div>
            <div class="table" data-key='time' style='width: 230px;'>
              <div class="tr">
                <div class="cell">Active =></div>
                <div class="cell long">{{ formatTime(user.stats.time.active) }}</div>
              </div>
              <div class="tr">
                <div class="cell">Idle =></div>
                <div class="cell long">{{ formatTime(user.stats.time.idle) }}</div>
              </div>
              <div class="tr">
                <div class="cell">Away =></div>
                <div class="cell long">{{ formatTime(user.stats.time.away) }}</div>
              </div>
              <div class="tr">
                <div class="cell">Invis =></div>
                <div class="cell long">{{ formatTime(user.stats.time.invisible) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>






<script lang='ts'>

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Web } from '../../utilities/web';
import Stats from '../../../../server/models/stats.json';




const userAccessMap = new Map();
userAccessMap.set(1, 'user');
userAccessMap.set(2, 'vip');
userAccessMap.set(3, 'mod');
userAccessMap.set(4, 'admin');


interface IUser {
  id            : string;
  alias         : string;
  email         : string;
  email_verified: boolean;
  access_level  : number;
  provider      : string;
  provider_id   : string;
  picture       : string;
  profile       : string;
  stat_id       : number;
}

interface IUserDetails extends IUser {
  stats: undefined|Object;
}

interface IUserResponse {
  status: number;
  data: IUserDetails[];
}




@Component
export default class Users extends Vue {

  users = [] as IUserDetails[];

  private usersURI = `${this.$apiURI}/users`;
  private web = new Web();




  async created() {
    let {status, data} =
      await this.web.get(this.usersURI) as IUserResponse
    ;

    // "stats" is not a part of "data" and therefore
    // needs to be added to be observed by Vue
    data = data.map(v => {
      v.stats = undefined;
      return v;
    });

    this.users = data as IUserDetails[];
  }



  getProvider(provider: string) {
    return (
      (provider == 'google')
        ? 'g'
        : 'f'
    );
  }

  /**
   * Hides or Shows user stats, based on active stats.
   */
  // TODO: This is horribly inefficient
  async toggleUserStats(user: IUserDetails) {
    if (user.stats) {
      user.stats = undefined;
      return;
    }

    this.users.map(v => {
      return v.stats = undefined;
    });

    const {status, data} = await this.web.get(`${this.$apiURI}/user/stats/${user.stat_id}`);
    user.stats = data;
    console.log(user.stats);
  }


  getMessageTotal(stats: typeof Stats) {
    const msgs = stats.messages;

    return (
      msgs.quip
      + msgs.simple
      + msgs.normal
      + msgs.emote
      + msgs.notice
    );
  }


  getXPMsgTotal(stats: typeof Stats.xp) {
    const msgs = stats.messages;

    return (
      msgs.normal
      + msgs.quip
      + msgs.simple
    );
  }


  formatTime(seconds: number) {
    let minutes = seconds / 60;
    let hours = minutes / 60;

    if (minutes < 60) {
      return `${Math.floor(minutes)}m`;
    }
    else {
      minutes = Math.floor((hours % 1) * 60);
      hours = Math.floor(hours);

      return `${hours}h ${minutes}s`;
    }
  }




}
</script>


<style lang='scss' src="./_users.scss"></style>