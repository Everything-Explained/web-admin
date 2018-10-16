import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/home/home.vue';
import About from './views/about/about.vue';
import Logs from './views/logs/logs.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/logs',
      name: 'logs',
      component: Logs,
    },
  ],
});
