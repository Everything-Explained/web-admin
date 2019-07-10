
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import moment from '../node_modules/moment';


Vue.filter('dateTime', (date: string, format: string) => {
  return moment(date).format(format);
});


@Component
export default class App extends Vue {

  public noteText = '';
  public title = '';

  public created() {
    this.$data.MenuFlag = document.getElementById('MenuFlag');
    this.title = this.$route.name;

    this.$router.afterEach((to, from) => {
      setTimeout(() => {
        let el = this.$refs.flag as HTMLInputElement;
        el.checked = false;
      }, 30);
    });
  }

  public goTo(route: string) {
    const router = this.$router;
    router.push(route);
    this.title = route;
  }


  public setNote(text: string) {
    this.noteText = text;
  }
}
