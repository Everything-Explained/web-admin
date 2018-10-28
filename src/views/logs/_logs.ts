import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import HttpLogDetails from '../../components/HTTPLogDetails.vue';
import MySelect from '../../components/MySelect.vue';
import StatDisplay from '../../components/StatDisplay.vue';
import { Web } from '@/utilities/web';
import { HTTPLogs, ILog } from './_httpLogs';
import { ServerLogs } from './_serverLogs';
import { LogHelper, LogType } from './_logHelper';
import { SocketLogs } from './_socketLogs';
import { ISelectConfig } from '@/components/_mySelect';






@Component({
  components: { HttpLogDetails, MySelect, StatDisplay },
})
export default class Logs extends Vue {

  public logs: ILog[] = [];

  // From Global MIXIN
  public initWeb!: () => Web;

  // Initialized in vue created() lifecycle method
  public web!: Web;

  // For MySelect components
  public selectLogOptions: string[] = [];
  public selectTypeOptions = ['http', 'server', 'socket'];

  public logLines     = 0;
  public rawLogLength = 0;
  public requestPerf  = '0ms';
  public filterPerf   = '0ms';
  public renderPerf   = '0ms';
  public selectedLog  =  '';
  public selectedLogType = LogType.NULL;
  public logPollInterval: any = null;

  // Initialized in created() lifecycle method
  private _httpLogs!:   HTTPLogs;
  private _serverLogs!: ServerLogs;
  private _socketLogs!: SocketLogs;
  private _logHelper!:  LogHelper;




  get logPerf() {
    return (
      parseInt(this.requestPerf, 10) +
      parseInt(this.filterPerf, 10) +
      parseInt(this.renderPerf, 10) + 'ms'
    );
  }




  public async created() {
    this.web = this.initWeb();

    this._logHelper = new LogHelper(this.web);
    this._httpLogs = new HTTPLogs(this.web, this._logHelper);
    this._serverLogs = new ServerLogs(this.web, this._logHelper);
    this._socketLogs = new SocketLogs(this.web, this._logHelper);
  }


  public async selectLogFile(selection: { index: number; name: string }, poll = false) {

    const file = selection.name
        , resp =
            await this._readLogsByFile(poll ? `${file}?poll=true` : file)
    ;
    if (resp && resp.changed) {
      Web.timeIt('applyLogs', 'applyLogs', () => {
        this.logs = resp.logs;
      });
    }

    setTimeout(() => {
      this.renderPerf = Web.measure('applyLogs');
      this.logLines = this.logs.length;
      this.requestPerf = this._httpLogs.reqTime;
      this.rawLogLength = this._httpLogs.logCount;
      this.filterPerf = this._httpLogs.filterTime;
      this.selectedLog = file;
    }, 10);

  }
  private async _readLogsByFile(filePath: string) {

    let logs;

    try {
      if (LogType.HTTP == this.selectedLogType)
        logs = await this._httpLogs.getFilteredLogs(filePath)
      ;

      if (LogType.SERVER == this.selectedLogType)
        throw new Error('_readLogsByFile():: SERVER :: Not Implimented')
      ;

      if (LogType.SOCKET == this.selectedLogType)
        throw new Error('_readLogsByFile():: SERVER :: Not Implimented')
      ;

      return logs;
    }
    catch (err) {
      this.$emit('notify', err.message);
      console.error(err);
    }
  }


  public async selectLogType(selection: { index: number; name: string }) {

    const selectedIndex = selection.index + 1
        , logs = await this._getLogsByType(selectedIndex)
    ;

    this.selectedLogType = selectedIndex;
    this.selectLogOptions = logs ? logs : [];
    this.logs = [];

  }
  private async _getLogsByType(index: number): Promise<string[]|undefined> {

    let resp;

    try {
      resp =
        LogType.HTTP == index
        ? (await this._httpLogs.logs).data
        : LogType.SERVER == index
          ? (await this._serverLogs.logs).data
          : LogType.SOCKET == index
            ? (await this._socketLogs.logs).data
            : resp
      ;
      return resp;
    }
    catch (err) {
      this.$emit('notify', err.message);
      console.error(err);
    }
    finally {
      if (!resp) return resp;
    }
  }


  // TODO: Return proper 204 status code in Server
  public async eraseFile(filename: string) {
    const { data } = await this._httpLogs.delete(filename);
  }


  public async togglePollLogs(selection: { index: number; name: string; }) {
    if (this.logPollInterval) {
      clearInterval(this.logPollInterval);
      this.logPollInterval = null;
    }
    else {
      this.logPollInterval = setInterval(() => {
        this.selectLogFile(selection, true);
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
    if (LogType.HTTP == log.type)
      return this._httpLogs.getLevel(log)
    ;

    if (LogType.SERVER == log.type)
      return this._serverLogs.getLevel(log)
    ;
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
