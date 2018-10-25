import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import LogDetails from '../../components/LogDetails.vue';
import MySelect from '../../components/MySelect.vue';
import StatDisplay from '../../components/StatDisplay.vue';
import { Web } from '@/utilities/web';
import { RequestLogs, ILog } from './_requestLogs';
import { ServerLogs } from './_serverLogs';
import { LogHelper } from './_logHelper';




@Component({
  components: { LogDetails, MySelect, StatDisplay },
})
export default class Logs extends Vue {

  public logs: ILog[] = [];
  public logLevels = [] as number[];

  // From Global MIXIN
  public initWeb!: () => Web;
  public web!: Web;

  public files: string[] = [];
  public selectTitle = 'Select a Log';

  public logTypes = ['requests', 'server', 'chat'];

  public logLines = 0;
  public rawLogLength = 0;
  public requestPerf = '0ms';
  public filterPerf = '0ms';
  public renderPerf = '0ms';
  public selectedLog = '';
  public selectedLogType = '';

  public logPollInterval: any = null;

  // Initialized in created() lifecycle method
  private _logRequests!: RequestLogs;
  private _serverLogs!: ServerLogs;
  private _logHelper!: LogHelper;




  get logPerf() {
    return (
      parseInt(this.requestPerf, 10) +
      parseInt(this.filterPerf, 10) +
      parseInt(this.renderPerf, 10) + 'ms'
    );
  }




  public async created() {
    const logLevels = this.$data.logLevels;
    this.web = this.initWeb();

    logLevels[20] = 'debug';
    logLevels[30] = 'default';
    logLevels[40] = 'warn';
    logLevels[50] = 'error';

    this._logHelper = new LogHelper(this.web);
    this._logRequests = new RequestLogs(this.web, this._logHelper);
    this._serverLogs = new ServerLogs(this.web, this._logHelper);

    try {
      const {data} = await this._logRequests.logs;
      this.files = data;
    }
    catch (err) {
      if (~err.message.indexOf('Failed to fetch')) {
        this.$emit('notify', `
          Cannot connect to server;
          make sure it's started and that you have the proper
          cert for localhost.
          Check the console for more details.
        `);
      }
      else {
        this.$emit('notify', err.message);
        console.error(err);
      }
    }
  }


  public async selectLogFile(file: string, poll = false) {

    // this._serverLogs.getLog('noumenae.log');

    try {
      const { changed, logs } =
          await this._logRequests.getFilteredLogs(poll ? `${file}?poll=true` : file)
      ;
      if (changed) {
        Web.timeIt('applyLogs', 'applyLogs', () => {
          this.logs = logs;
        });
      }
    }
    catch (err) {
      this.$emit('notify', err.message);
      console.error(err);
    }



    setTimeout(() => {
      this.renderPerf = Web.measure('applyLogs');
      this.logLines = this.logs.length;
      this.requestPerf = this._logRequests.reqTime;
      this.rawLogLength = this._logRequests.logCount;
      this.filterPerf = this._logRequests.filterTime;
      this.selectedLog = file;
    }, 10);

  }


  public async selectLogType(type: string) {

    if (type == 'request') return await this._logRequests.logs;
    if (type ==  'server') return await this._serverLogs.logs;

  }


  // TODO: Return proper 204 status code in Server
  public async eraseFile(filename: string) {
    const { data } = await this._logRequests.delete(filename);
  }


  public async togglePollLogs(file: string) {
    if (this.logPollInterval) {
      clearInterval(this.logPollInterval);
      this.logPollInterval = null;
    }
    else {
      this.logPollInterval = setInterval(() => {
        this.selectLogFile(file, true);
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
        , children = log.children.length
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
