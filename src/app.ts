
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


function padTime(num: number) {
  return (
    (num == 0)
      ? '00'
      : (num < 10)
        ? `0${num}`
        : `${num}`
  );
}

function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const h =
    (hours > 12)
      ? hours - 12
      : (hours == 0)
        ? 12
        : hours
  ;
  const ampm = hours >= 12 ? 'pm' : 'am';
  const m = padTime(minutes);
  const s = padTime(seconds);

  return `${h}:${m}:${s}${ampm}`;
}


Vue.filter('dateTime', (timeInMills: number) => {
  const date = new Date(timeInMills);
  const month = date.getMonth() + 1; // Jan is 0
  const day = date.getDate();

  return `${day}/${month} => ${formatTime(date)}`;
});


Vue.filter('timeOnly', (timeInMills: number) => {
  return formatTime(new Date(timeInMills));
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
