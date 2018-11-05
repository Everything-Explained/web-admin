import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/home/home.vue';
import Logs from './views/logs/logs.vue';
import Invites from './views/invites/invites.vue';

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
    {
      path: '/invites',
      name: 'invites',
      component: Invites
    }
  ],
});
