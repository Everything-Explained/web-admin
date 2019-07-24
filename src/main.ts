import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import { Web } from './utilities/web';
import { LogHelper } from './views/logs/_logHelper';

const apiBasePath =
  (window.location.hostname == 'localhost')
    ? 'https://localhost:3003'
    : ''
;
const WEB = new Web();
const logHelper = new LogHelper(WEB, apiBasePath);


Vue.mixin({
  methods: {
    initWeb: () => WEB,
    initLogHelper: () => logHelper,
  },
});


Vue.use({
  install: () => {
    Vue.prototype.$apiURI = apiBasePath;
  }
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
