import Vue, { ComponentOptions } from 'vue';
import App from './App.vue';
import router from '@/router';
import { Web } from './utilities/web';

const WEB = new Web();
Vue.mixin({
  methods: {
    initWeb: () => WEB,
  },
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
