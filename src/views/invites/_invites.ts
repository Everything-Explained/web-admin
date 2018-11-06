import Vue from 'vue';
import Component from 'vue-class-component';
import MySelect from '@/components/elements/MySelect.vue';

@Component({
  components: {
    MySelect
  }
})
export default class Invites extends Vue {

  public uses = ['1', '5', '10', '100', 'Infinite'];
  public days = ['1', '7', '30', '365', 'Infinite'];

  public created() { console.log('hello world'); }

}


