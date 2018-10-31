import { Web } from '@/utilities/web';
import { LogHelper, ILog } from '../../views/logs/_logHelper';
import Component from 'vue-class-component';
import Vue from 'vue';
import { Watch } from 'vue-property-decorator';


@Component({
  props: {
    selectedLog: {
      type: Object,
      required: true
    }
  }
})
export default class ServerLogs extends Vue {

  // From component attribute
  public selectedLog!: {
    name: string;
    churn: number;
  };

  // From Global Mixin
  public initLogHelper!: () => LogHelper;

  public logs: ILog[] = [];
  public lastFilteredLog: ILog[] = [];

  private _logFileLength = 0;
  private _requestTime = '';
  private _renderTime = '';

  // Initialized in create() vue lifecycle
  private _logHelper!: LogHelper;



  get logDetails() {
    return {
      filterTime: '0ms',
      renderTime: this._renderTime,
      requestTime: this._requestTime,
      lines: this.logs.length,
      length: this._logFileLength
    };
  }



  public create() {
    this._logHelper = this.initLogHelper();
  }


  @Watch('selectedLog')
  private async _selectFile() {
    if (!this.selectedLog.name) {
      this.logs = [];
      this._logFileLength = 0;
      this.$emit('updated', this.logDetails);
      return;
    }

    const { changed, logs } = await this._logHelper.getLogs('server', this.selectedLog.name);

    if (!changed) return;

    Web.timeIt('renderLogs', 'render', () => {
      this.logs = logs;
    });

    this._renderTime = Web.measure('render');
    this._requestTime = this._logHelper.lastRequestTime;
    this._logFileLength = logs.length;

    this.$emit('updated', this.logDetails);

  }




  public getLevel(log: ILog) {
    return this._logHelper.levels[log.level];
  }





}