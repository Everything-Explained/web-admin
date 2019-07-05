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


  private getBrowser(agentStr: string) {
    const getBrowserVersion =
      (platform: string) => {
        return agentStr.match(`${platform}\/[0-9]+\.[0-9]`)[0].split('/')[1];
      }
    ;

    if (agentStr) {
      if (~agentStr.indexOf('Firefox')) {
        return 'FireFox: ' + getBrowserVersion('Firefox');
      }

      else if (~agentStr.indexOf('Chrome')) {
        return 'Chrome: ' + getBrowserVersion('Chrome');
      }

      else if (~agentStr.indexOf('Safari')) {
        return 'Safari: ' + getBrowserVersion('Safari');
      }

      else if (~agentStr.indexOf('Netcraft')) {
        return 'Netcraft SSL Survey';
      }

      else {
        return `UNKNOWN:  [${agentStr}]`;
      }
    }
  }

}
