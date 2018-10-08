import Vue, { ComponentOptions } from 'vue';
import App from './App.vue';
import router from '@/router';
import { Web } from './utilities/web';

const WEB = new Web();
Vue.mixin({
  methods: {
    webGet: (url, options) => {
      return WEB.get(url, options || undefined);
    },
    webPost: (url, data, options) => {
      return WEB.post(url, data, options || undefined);
    }
  }
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
