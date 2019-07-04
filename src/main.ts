import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import { Web } from './utilities/web';
import { LogHelper } from './views/logs/_logHelper';

const WEB = new Web();
const logHelper = new LogHelper(WEB);

Vue.mixin({
  methods: {
    initWeb: () => WEB,
    initLogHelper: () => logHelper,
  },
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
