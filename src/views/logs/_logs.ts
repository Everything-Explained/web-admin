import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import LogDetails from '../../components/LogDetails.vue';
import MySelect from '../../components/MySelect.vue';
import StatDisplay from '../../components/StatDisplay.vue';
import { webGet, webPost, webDelete, Web } from '@/utilities/web';
import { LogRequests } from './_logRequests';

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
  public rawLogLength = 0;
  public requestPerf = '0ms';
  public filterPerf = '0ms';
  public renderPerf = '0ms';
  public selectedLog = '';

  public logPollInterval: any = null;
  private _logRequests!: LogRequests;

  get logPerf() {
    return (
      parseInt(this.requestPerf, 10) +
      parseInt(this.filterPerf, 10) +
      parseInt(this.renderPerf, 10) + 'ms'
    );
  }

  public async created() {
    const logLevels = this.$data.logLevels;

    logLevels[20] = 'debug';
    logLevels[30] = 'default';
    logLevels[40] = 'warn';
    logLevels[50] = 'error';

    this._logRequests = new LogRequests(this.webGet, `${papiPath}logger`);


    const params = 'type=request';
    try {
      const {status, data} = await this.webGet(`${papiPath}logs?${params}`);
      this.files = data;
    }
    catch (err) {
      if (~err.message.indexOf('Failed to fetch')) {
        this.$emit('notify', "Cannot connect to server; make sure it's started.");
      }
      else {
        this.$emit('notify', err.message);
      }
    }
  }

  public async selectFile(file: string, poll = false) {

    const {changed, data} = await this._logRequests.getLogs(poll ? `${file}?poll=true` : file);
    if (changed) {
      performance.mark('ApplyLogsStart');
      this.logs = data;
      performance.mark('ApplyLogsEnd');
      performance.measure('ApplyLogs', 'ApplyLogsStart', 'ApplyLogsEnd');
      this.renderPerf = Web.measure('ApplyLogs');
    }


    this.logLines = this.logs.length;
    this.requestPerf = this._logRequests.reqTime;
    this.rawLogLength = this._logRequests.lastFileLength;
    this.filterPerf = this._logRequests.filterTime;

    this.selectedLog = file;
  }


  public async eraseFile(file: string) {
    const {status, data} = await this.webDelete(`${papiPath}logger/${file}`);
    if (status == 200) {
      this.selectFile(file);
    }
    else throw new Error(`Could not Clear File:: ${file} :: ${status}`);
  }


  public async togglePollLogs(file: string) {
    if (this.logPollInterval) {
      clearInterval(this.logPollInterval);
      this.logPollInterval = null;
    }
    else {
      this.logPollInterval = setInterval(() => {
        this.selectFile(file, true);
      }, 500);
    }
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
