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
    {
      path: '/about',
      name: 'about',
      component: About,
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});
