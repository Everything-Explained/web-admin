import Vue from 'vue';
import Component from 'vue-class-component';
import { IHttpLog } from './_httpLogs';

@Component({
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
})
export default class HTTPLogDetails extends Vue {

  public getStatusColor(log: IHttpLog) {
    if (log.level == 'default' || log.level == 'special') return 'good';
    if (log.level == 'forbidden') return 'forbidden';
    if (log.level == 'warn') return 'warn';
    if (log.level == 'error') return 'error';

    return '';
  }

}
