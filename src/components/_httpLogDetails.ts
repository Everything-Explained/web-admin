import Vue from 'vue';
import Component from 'vue-class-component';
import { ILog } from '@/views/logs/_httpLogs';

@Component({
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
})
export default class HTTPLogDetails extends Vue {

  public getStatusColor(log: ILog) {
    if (log.level == 30) return 'good';
    if (log.level == 40) return 'warn';
    if (log.level == 50) return 'error';

    return '';
  }

}
