
import { Component, Vue } from 'vue-property-decorator';
import moment from '../node_modules/moment';


Vue.filter('dateTime', (date: string, format: string) => {
  return moment(date).format(format);
});

@Component({
  created: function() {
    this.$data.MenuFlag = document.getElementById('MenuFlag');
  },
  methods: {
    goTo: function(route) {
      const router = this.$router
        , el = this.$refs.flag as HTMLInputElement
      ;

      router.push(route);

      // Wait for Vue router to replace div
      setTimeout(() => {
        el.checked = false;
      }, 70);
    },
  },
})

export default class App extends Vue {}
