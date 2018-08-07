import { Component, Vue } from 'vue-property-decorator';

@Component({
  created: () => {
    console.log('hello world');
  },
})

export default class Logs extends Vue {}
