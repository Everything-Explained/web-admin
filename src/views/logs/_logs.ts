import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import LogDetails from '../../components/LogDetails.vue';
import MySelect from '../../components/MySelect.vue';
import StatDisplay from '../../components/StatDisplay.vue';
import { Web } from '@/utilities/web';
import { RequestLogs, ILog } from './_requestLogs';
import { ServerLogs } from './_serverLogs';




@Component({
  components: { LogDetails, MySelect, StatDisplay },
})
export default class Logs extends Vue {

  public logs: ILog[] = [];
  public logLevels = [] as number[];

  // From Global MIXIN
  public initWeb!: () => Web;
  public Web!: Web;

  public files: string[] = [];
  public selectTitle = 'Select a Log';

  public logLines = 0;
  public rawLogLength = 0;
  public requestPerf = '0ms';
  public filterPerf = '0ms';
  public renderPerf = '0ms';
  public selectedLog = '';

  public logPollInterval: any = null;
  private _logRequests!: RequestLogs;
  private _serverLogs!: ServerLogs;




  get logPerf() {
    return (
      parseInt(this.requestPerf, 10) +
      parseInt(this.filterPerf, 10) +
      parseInt(this.renderPerf, 10) + 'ms'
    );
  }




  public async created() {
    const logLevels = this.$data.logLevels;
    this.Web = this.initWeb();

    logLevels[20] = 'debug';
    logLevels[30] = 'default';
    logLevels[40] = 'warn';
    logLevels[50] = 'error';

    this._logRequests = new RequestLogs(this.Web);
    this._serverLogs = new ServerLogs(this.Web);


    try {
      const {data} = await this._logRequests.listLogs();
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
      }
    }
  }


  public async selectFile(file: string, poll = false) {

    // this._serverLogs.getLog('noumenae.log');

    try {
      const {changed, data} = await this._logRequests.getLog(poll ? `${file}?poll=true` : file);
      if (changed) {
        Web.timeIt('applyLogs', 'applyLogs', () => {
          this.logs = data;
        });
      }
    }
    catch (err) {
      this.$emit('notify', err.message);
    }



    setTimeout(() => {
      this.renderPerf = Web.measure('applyLogs');
      this.logLines = this.logs.length;
      this.requestPerf = this._logRequests.reqTime;
      this.rawLogLength = this._logRequests.lastFileLength;
      this.filterPerf = this._logRequests.filterTime;
      this.selectedLog = file;
    }, 10);

  }


  public async eraseFile(filename: string) {
    const { status, data } = await this._logRequests.deleteLog(filename);
    if (status != 200)
      throw new Error(`Could not Clear File:: ${filename} :: ${status}`)
    ;
    else
      this.selectFile(filename)
    ;
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
