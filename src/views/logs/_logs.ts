import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import MySelect from '../../components/MySelect.vue';
import StatDisplay from '../../components/StatDisplay.vue';
import HttpLogs from '../../components/httpLogs/HttpLogs.vue';
import { Web } from '@/utilities/web';
import { ILog } from '../../components/httpLogs/_httpLogs';
import { ServerLogs } from './_serverLogs';
import { LogHelper, LogType } from './_logHelper';
import { SocketLogs } from './_socketLogs';
import { ISelection } from '@/components/_mySelect';






@Component({
  components: { HttpLogs, MySelect, StatDisplay },
})
export default class Logs extends Vue {

  public logLength = 0;
  public selectedFilePath = '';

  // From Global MIXIN
  public initWeb!: () => Web;
  public initLogHelper!: () => LogHelper;

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
  private _web!: Web;
  private _logHelper!:  LogHelper;




  get logPerf() {
    return (
      parseInt(this.requestPerf, 10) +
      parseInt(this.filterPerf, 10) +
      parseInt(this.renderPerf, 10) + 'ms'
    );
  }




  public async created() {
    this._web = this.initWeb();
    this._logHelper = this.initLogHelper();
  }


  public async selectLogFile(selection: ISelection, poll = false) {



    const file = selection.name
        , resp =
            await this._logHelper.getLogs('http', poll ? `${file}?poll=true` : file)
    ;
    this.logLength = resp.logs.length;
    this.selectedFilePath = file;
    // if (resp && resp.changed) {
      // Web.timeIt('applyLogs', 'applyLogs', () => {
    // this.logData = resp.logs;
      // });
    // }

    // this.renderPerf = Web.measure('applyLogs');
    // this.logLines = this.logs.length;
    // this.requestPerf = this._logHelper.lastRequestTime;
    // this.rawLogLength = this._logHelper.lastLogCount;
    // this.filterPerf = this._httpLogs.filterTime;
    // this.selectedLog = file;

  }
  private async _readLogsByFile(filePath: string) {

    // let logs;

    // try {
    //   if (LogType.HTTP == this.selectedLogType)
    //     logs = await this._httpLogs.getFilteredLogs(filePath)
    //   ;

    //   if (LogType.SERVER == this.selectedLogType)
    //     this._serverLogs.getFilteredLogs(filePath)
    //   ;

    //   if (LogType.SOCKET == this.selectedLogType)
    //     throw new Error('_readLogsByFile():: SERVER :: Not Implimented')
    //   ;

    //   return logs;
    // }
    // catch (err) {
    //   this.$emit('notify', err.message);
    //   console.error(err);
    // }
  }


  public async selectLogType(selection: ISelection) {

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
        ? (await this._logHelper.listLogs('http')).data
        : LogType.SERVER == index
          ? (await this._logHelper.listLogs('server')).data
          : LogType.SOCKET == index
            ? (await this._logHelper.listLogs('socket')).data
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


  public async togglePollLogs(selection: ISelection) {
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







  public getLevel(log: ILog) {
    // if (LogType.HTTP == log.type)
    //   return this._httpLogs.getLevel(log)
    // ;

    // if (LogType.SERVER == log.type)
    //   return this._serverLogs.getLevel(log)
    // ;
  }





}
