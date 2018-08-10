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
  identity: string; // IP
  browser?: string; // USER-AGENT
  err?: {
    message: string;
    name: string;
    stack: string;
  };
}


interface ILogView extends Vue {
  getMethod(log: ILog): string;
}

@Component
export default class Logs extends Vue {

  public logs = logs;
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

      if (logs[i].reqLink != logs[i + 1].reqLink) {
        newLogs.push(logs[i]);
      }
    }

    this.$data.logs = newLogs.reverse();
    console.log(newLogs);
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

  public formatDate(date: string) {
    return moment.parseZone(date).format('D/M => h:mm:ss');
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
