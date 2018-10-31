import { Web } from '@/utilities/web';
import { LogHelper, ILog } from '../../views/logs/_logHelper';
import Component from 'vue-class-component';
import Vue from 'vue';


@Component
export default class ServerLogs extends Vue {

  // From Global Mixin
  public initLogHelper!: () => LogHelper;

  public lastFilteredLog: ILog[] = [];

  // Initialized in create() vue lifecycle
  private _logHelper!: LogHelper;




  public create() {
    this._logHelper = this.initLogHelper();
  }



  public getLevel(log: ILog) {
    return this._logHelper.levels[log.level];
  }



  public delete(filename: string) {
    return this._logHelper.deleteLog('server', filename);
  }





}