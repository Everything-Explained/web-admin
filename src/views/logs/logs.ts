import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import * as moment from '../../../node_modules/moment';
const logs = require('./tempdata.json') as ILog[];



interface ILog {
  uid: string;
  msg: string;
  level: number;
  time: string;
  req_type?: string;
  reqLink: string;
  data?: any;
  identity: string; // IP
  browser?: string; // USER-AGENT
  children?: ILog[];
  open?: boolean;
  hasChildren?: boolean;
  err?: {
    message: string;
    name: string;
    stack: string;
  };
}



@Component
export default class Logs extends Vue {

  public logs: ILog[] = [];
  public logLevels = [] as number[];


  public created() {
    const l = logs.length - 2
        , newLogs = [logs[0]]
        , logLevels = this.$data.logLevels
    ;

    logLevels[30] = 'default';
    logLevels[40] = 'warn';
    logLevels[50] = 'error';

    for (let i = l; i > 0; i--) {
      if (!logs[i].reqLink) {
        newLogs.push(logs[i]);
        continue;
      }

      newLogs.push(logs[i]);
    }

    this.logs = this.filterLogs(newLogs.reverse());

    // console.log(newLogs);
  }


  public filterLogs(logs: ILog[]) {
    const _logs: ILog[] = [];

    for (let i = 0; i < logs.length; i++) {
      let tempLogs = [];
      logs[i].children = [];
      if (logs[i].identity) {
        const log = logs[i + 1];
        tempLogs =
          logs
            .filter(v => v.identity == log.identity)
            .filter(v => !!v.req_type)
        ;
        tempLogs.splice(0, 1);
        logs = logs.filter(v => v.identity !== log.identity);
        log.children = tempLogs;
        log.hasChildren = !!log.children.length;
        log.open = false;
        _logs.push(log);

      } else if (logs[i].level == 50) {
        const log = logs[i];
        if (log.err) {
          logs = logs.filter(v => !v.err || v.err && v.err.stack !== log.err!.stack);
          log.hasChildren = !!log.children!.length;
          log.open = false;
          _logs.push(log);
        }
      }
      else _logs.push(logs[i]);
    }
    console.log(_logs);
    return _logs;
  }


  public getMethod(log: ILog) {
    return log.req_type
            ? log.req_type.split(' ', 1)[0]
            : log.msg.split(' ', 1)[0]
    ;
  }


  public getLevel(log: ILog) {
    const level = log.level;

    if (log.req_type)
      if (~log.req_type.indexOf('/protected') || ~log.req_type.indexOf('/internal')) return 'good'
    ;
    else
      if (~log.msg.indexOf('/protected') || ~log.msg.indexOf('/internal')) return 'good'
    ;

    return this.$data.logLevels[level];
  }


  public formatDate(date: string, format: string) {
    return moment.parseZone(date).format(format);
  }


  public toggle(ev: MouseEvent, log: ILog) {
    // TODO - Uncomment to hide all, on toggle
    // this.logs.forEach(l => {
    //   if (log.identity == l.identity) return;
    //   l.open = false;
    // });
    log.open = !log.open;
  }


}

// @Component({
//   data: () => {
//     return {
//       logs: logs,
//       logLevels: [],
//     };
//   },

//   created: function() {
//     const l = logs.length - 2
//         , newLogs = [logs[0]]
//         , logLevels = this.$data.logLevels
//     ;

//     logLevels[30] = 'default';
//     logLevels[40] = 'warn';
//     logLevels[50] = 'error';

//     for (let i = l; i > 0; i--) {
//       if (!logs[i].reqLink) {
//         newLogs.push(logs[i]);
//         continue;
//       }

//       if (logs[i].reqLink != logs[i + 1].reqLink) {
//         newLogs.push(logs[i]);
//       }
//     }

//     this.$data.logs = newLogs.reverse();
//     console.log(newLogs);
//   },


//   methods: {
//     getMethod(log: ILog) {
//       return log.req_type
//               ? log.req_type.split(' ', 1)[0]
//               : log.msg.split(' ', 1)[0]
//       ;

//     },
//     getLevel(log: ILog) {
//       const level = log.level;

//       if (log.req_type)
//         if (~log.req_type.indexOf('/protected') || ~log.req_type.indexOf('/internal')) return 'good'
//       ;
//       else
//         if (~log.msg.indexOf('/protected') || ~log.msg.indexOf('/internal')) return 'good'
//       ;

//       return this.$data.logLevels[level];
//     },
//     formatDate(date: string) {
//       return moment.parseZone(date).format('D/M => h:mm:ss');
//     },
//   },
// })

// export default class Logs extends Vue {}
