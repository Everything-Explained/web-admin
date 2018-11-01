import Vue from 'vue';
import { ILog } from '@/views/logs/_logHelper';
import Component from 'vue-class-component';

@Component({
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
})
export default class ServerLogDetails extends Vue {

  public getStatusColor(log: ILog) {
    if (log.level == 30) return 'good';
    if (log.level == 40) return 'warn';
    if (log.level == 50) return 'error';

    return '';
  }

}

