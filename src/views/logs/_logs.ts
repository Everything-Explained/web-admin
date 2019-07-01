import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import MySelect from '@/components/elements/MySelect.vue';
import StatDisplay from '@/components/elements/StatDisplay.vue';
import HttpLogs from '@/components/httpLogs/HttpLogs.vue';
import { Web } from '@/utilities/web';
import { IHttpLog } from '@/components/httpLogs/_httpLogs';
import { LogHelper, LogType, ISelectedLog } from './_logHelper';
import { ISelection } from '@/components/elements/_mySelect';
import ServerLogs from '@/components/serverLogs/ServerLogs.vue';






@Component({
  components: {
    ServerLogs,
    HttpLogs,
    MySelect,
    StatDisplay
  },
})
export default class Logs extends Vue {

  public selectedLog: ISelectedLog = null;

  // From Global MIXIN
  public initWeb!: () => Web;
  public initLogHelper!: () => LogHelper;

  // For MySelect components
  public selectedLogOptions: string[] = [];
  public selectTypeOptions = ['http', 'server'];

  public logLines     = 0;
  public logLength    = 0;
  public requestPerf  = '0ms';
  public filterPerf   = '0ms';
  public renderPerf   = '0ms';
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
    this.selectedLog = {
      name: '',
      churn: 0,
      polling: false,
    };
  }


  public async selectLogFile(selection: ISelection, poll = false) {

    const file = selection.name;
    this.selectedLog.name = file;
    this.selectedLog.polling = poll;
    ++this.selectedLog.churn;

  }

  /**
   * Executed by all of the Log components when an
   * update has been performed on a set of logs.
   *
   * @param details Log details
   */
  public logUpdated(details: any) {
    this.logLength = details.length;
    this.logLines = details.lines;
    this.renderPerf = details.renderTime;
    this.filterPerf = details.filterTime;
    this.requestPerf = details.requestTime;
  }


  public getLogType(type: 'SERVER'|'HTTP'|'NULL'|'SOCKET') {
    return LogType[type];
  }


  public async selectLogType(selection: ISelection) {

    const selectedIndex = selection.index + 1
        , logs = await this._getLogsByType(selectedIndex)
    ;

    this.selectedLogType = selectedIndex;
    this.selectedLogOptions = logs ? logs : [];
    this.logLength = 0;
    this.selectedLog.name = '';

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


  public async eraseFile(filename: string) {
    const folder = LogType[this.selectedLogType].toLowerCase();
    const { status } = await this._logHelper.deleteLog(folder, filename);
    this.selectLogFile({ name: this.selectedLog.name, index: 0 });
    if (status != 204) {
      this.$emit('notify', `Could not Erase '${folder}/${filename}'`);
    }
  }


  public async togglePollLogs(selection: ISelection) {
    if (this.logPollInterval) {
      clearInterval(this.logPollInterval);
      this.logPollInterval = null;
      this.selectedLog.polling = false;
    }
    else {
      this.logPollInterval = setInterval(() => {
        this.selectLogFile(selection, true);
      }, 1000);
    }
  }


  public getData(log: IHttpLog) {
    const data = [];

    for (const key in log.data) {
      const temp = {} as any;
      temp[key] = log.data[key];
      data.push(temp);
    }

    return data;
  }







  public getLevel(log: IHttpLog) {
    // if (LogType.HTTP == log.type)
    //   return this._httpLogs.getLevel(log)
    // ;

    // if (LogType.SERVER == log.type)
    //   return this._serverLogs.getLevel(log)
    // ;
  }





}
