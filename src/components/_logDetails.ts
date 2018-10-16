import Vue from 'vue';
import Component from 'vue-class-component';
import Logs, { ILog } from '@/views/logs/_logs';
import { LogRequests } from '@/views/logs/_logRequests';

@Component({
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
})
export default class LogDetails extends Vue {

  public logLevels = [] as number[];

  public LogRequests = LogRequests;

  public created() {
    const lls = this.$data.logLevels;

    lls[20] = 'debug';
    lls[30] = 'default';
    lls[40] = 'warn';
    lls[50] = 'error';
  }


  public getStatusColor(log: ILog) {
    if (log.level == 30) return 'good';
    if (log.level == 40) return 'warn';
    if (log.level == 50) return 'error';

    return '';
  }

}
