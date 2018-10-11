import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import LogDetails from '../../components/LogDetails.vue';
import MySelect from '../../components/MySelect.vue';
import StatDisplay from '../../components/StatDisplay.vue';
import { webGet, webPost, webDelete } from '@/utilities/web';

export interface ILogData {
  uid: string;
  identity: string; // IP or Session Alias
  browser: string;  // USER-AGENT String
  msg: string;
  level: number;
  req?: {
    method: string;
    url: string;
    type: string;
    data: any;
  };
  time: string;
  err?: {
    msg: string;
    name: string;
    stack: string;
  };
}

export interface ILog extends ILogData {
  msgs: string[];
  time: string;
  localeDateString: string;
  method: string;
  url: string;
  type: string;
  data: any;
  statusCode: number;
  statusMsg: string;
  priority: number;
  children: ILog[];
  requests: number;
  open?: boolean;
}


const papiPath = `https://localhost:5007/protected/`;


@Component({
  components: { LogDetails, MySelect, StatDisplay },
})
export default class Logs extends Vue {

  public logs: ILog[] = [];
  public logLevels = [] as number[];

  // From Global MIXIN
  public webGet!: webGet;
  public webPost!: webPost;
  public webDelete!: webDelete;

  public files: string[] = [];
  public selectTitle = 'Select a Log';

  public logLines = 0;
  public logResponseLength = 0;
  public requestPerf = '0ms';
  public renderPerf = '0ms';
  public selectedLog = '';

  public async created() {
    const logLevels = this.$data.logLevels;

    logLevels[20] = 'debug';
    logLevels[30] = 'default';
    logLevels[40] = 'warn';
    logLevels[50] = 'error';

    const params = 'type=request';
    const files = await this.webGet(`${papiPath}logs?${params}`);
    this.files = files;
  }

  public async selectFile(file: string) {
    performance.mark('webGetBegin');
    const logs = await this.webGet(`${papiPath}logger/${file}?length=500`) as string[];
    performance.mark('webGetEnd');
    performance.measure('webGet', 'webGetBegin', 'webGetEnd');
    this.requestPerf = this._measure('webGet');

    const logObjs = [];

    for (const log of logs) {
      if (log)
        logObjs.push(JSON.parse(log));
    }

    performance.mark('logRenderStart');
    this.logs = this.filterLogs(logObjs);
    performance.mark('logRenderEnd');
    performance.measure('logRender', 'logRenderStart', 'logRenderEnd');
    this.renderPerf = this._measure('logRender');

    this.logResponseLength = logs.length;
    this.logLines = this.logs.length;
    this.selectedLog = file;
  }


  public async clearFile(file: string) {
    let resp = await this.webDelete(`${papiPath}test/${file}`);
    console.log(resp)
  }


  public filterLogs(logs: ILog[]) {
    const LOGS: ILog[] = [];
    while (logs.length) {
      let tempLogs = [];
      const log = logs[0];
      log.children = [];
      log.open = false;
      tempLogs = logs.filter(l => l.uid == log.uid);
      logs = logs.filter(l => l.uid != log.uid);
      LOGS.push(this._linkLogs(tempLogs));
    }
    return this._linkDuplicates(
      this._setLogType(LOGS),
    );
  }

  private _measure(name: string) {
    let timing = performance.getEntriesByName(name)[0].duration;
    const timingStr =
      (timing > 1000)
        ? (timing /= 1000).toFixed(2) + 's'
        : timing.toFixed(0) + 'ms'
    ;
    performance.clearMeasures(name);
    return timingStr;
  }


  private _setLogType(logs: ILog[]) {
    logs.forEach(l => {
      l.type = this.getLogType(l);
    });
    return logs;
  }


  private _linkLogs(logs: ILog[]) {
    const newLog = logs[0];

    for (const log of logs) {
      if (log.uid == newLog.uid && log.req) {
        Object.assign(newLog, log.req);
        newLog.msgs = [newLog.url]; // URL is only available here
        continue;
      }
      if (log.err) {
        newLog.err = log.err;
        newLog.msg = log.msg;
      }
      if (log.level > newLog.level) newLog.level = log.level;
      if (newLog.level < 30 && log.level < 30) newLog.level = log.level;

      // Catch params data set within route request
      if (log.data) {
        newLog.data =
          newLog.data
            ? Object.assign(newLog.data, log.data)
            : log.data
        ;
      }

      if (log.statusCode) {
        newLog.statusCode = log.statusCode;
        newLog.statusMsg = log.msg;
      }
      else
        newLog.msgs.push(log.msg)
      ;
    }
    newLog.localeDateString = new Date(newLog.time).toLocaleDateString();
    return newLog;
  }


  private _linkDuplicates(logs: ILog[]) {
    const LOGS = [] as ILog[];
    let i = 0;
    let templogs = [];

    while (logs.length) {
      const log = logs[0];
      templogs = logs.filter(l => this._isLogEqual(l, log));
      this._deleteFilteredLogs(templogs, logs);
      templogs.splice(0, 1);
      log.children = (templogs.length) ? templogs : [];
      LOGS.push(log);
    }
    return this._linkTypes(LOGS);
  }


  private _linkTypes(logs: ILog[]) {
    const LOGS = [] as ILog[];
    let tempLogs = [] as ILog[];

    while (logs.length) {
      const log = logs[0]
          , tempILogs = [] as ILog[]
          , identLogs = logs.filter(l => log.identity == l.identity)
      ;

      while (identLogs.length) {
        const iLog = identLogs[0];
        if (iLog.level < 40) {
          tempLogs =
            identLogs.filter(l => {
              return (
                    iLog.type == l.type
                && this._isDataEqual(iLog, l)
                && l.level < 40
              );
            })
          ;
          this._deleteFilteredLogs(tempLogs, identLogs);
          tempLogs.splice(0, 1);
        }
        else {
          identLogs.splice(0, 1);
          tempLogs = [];
        }

        iLog.requests = iLog.children.length + 1; // +1 for the actual log itself
        iLog.children = (tempLogs.length) ? tempLogs : [];
        tempILogs.push(iLog);
      }
      logs = logs.filter(l => log.identity != l.identity);
      LOGS.push(...tempILogs);
    }
    return LOGS;
  }


  public filterStack(stack: string) {
    const stackLines = stack.split('\n');
    let newStack = '';
    newStack = stackLines.filter((line, i) => {
      if (~line.indexOf('node_modules')) return false;
      return true;
    })
    .map((line, i) => {
      if (i == 0) return ` ${line.trim()}`;
      return `    ${line.trim()}`;
    })
    .join('\n');

    return newStack;
  }


  private _isLogEqual(l1: ILog, l2: ILog) {

    return (
         l1.identity == l2.identity
      && l1.type == l2.type
      && l1.msg == l2.msg
      && l1.method == l2.method
      && l1.statusCode == l2.statusCode
      && l1.localeDateString == l2.localeDateString
      && this._isDataEqual(l1, l2)
    );
  }


  private _isDataEqual(l1: ILog, l2: ILog) {
    if (l1.data && l2.data) {
      // Check data length
      if (Object.keys(l1.data).length != Object.keys(l2.data).length) return false;

      for (const key in l1.data) {
        if (!l2.data[key]) return false;
        if (l1.data[key] != l2.data[key]) return false;
      }
      return true;
    }
    return l1.data == l2.data;
  }


  private _cleanLog(log: ILog) {
    delete log.req;
    if (!log.data) delete log.data;
    if (!log.children.length) delete log.children;
    return log;
  }


  private _deleteFilteredLogs(filtered: ILog[], logs: ILog[]) {
    filtered.forEach(l => {
      logs.splice(logs.findIndex(ll => ll.uid == l.uid), 1);
    });
    return logs;
  }


  public getData(log: ILog) {
    const data = [];

    for (const key in log.data) {
      const temp = {} as any;
      temp[key] = log.data[key];
      data.push(temp);
    }

    return data;
  }


  public getRequestCount(log: ILog) {
    const requests = log.requests
        , children = this.countChildren(log)
    ;
    let countStr = '';

    if (requests > 1) {
      countStr += `${requests}`;
    }

    if (children) {
      countStr += `+${children}`;
    }

    return countStr;
  }


  public getLogType(log: ILog) {

    let type = log.method;
    const urlParts = log.url.split('.');

    if (log.url == '/') {
      type = 'FILE';
    }
    else if (~log.url.indexOf('/protected/')) {
      type = 'PAPI';
    }
    else if (~log.url.indexOf('/internal/')) {
      type = 'IAPI';
    }
    else if (log.data) {
      type = 'QUERY';
    }
    else if (urlParts.length > 1 && !~urlParts.pop()!.indexOf('/')) {
      type = 'FILE';
    }

    return type;
  }


  public countChildren(log: ILog) {
    if (log.children.length) {
      return log.children.reduce((acc, cv) => {
        return acc + cv.children.length;
      }, log.children.length);
    }
    return 0;
  }


  public getMessage(log: ILog) {
    let msg = log.url;

    if (log.msgs.length > 1) {
      msg = `${log.statusCode} => ${log.msgs[0]}`;
    }

    return msg;
  }


  public getLevel(log: ILog) {
    const level = log.level;

    if (log.url && log.level < 40)
      if (~log.url.indexOf('/protected') || ~log.url.indexOf('/internal')) return 'special'
    ;

    return this.$data.logLevels[level];
  }


  public toggle(ev: MouseEvent, log: ILog) {
    // TODO: Uncomment to hide all, on toggle
    // this.logs.forEach(l => {
    //   if (log.identity == l.identity) return;
    //   l.open = false;
    // });
    log.open = !log.open;
  }


}
