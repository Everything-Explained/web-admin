import { Web } from '@/utilities/web';
import { LogHelper, ILog, ISelectedLog } from '../../views/logs/_logHelper';
import Component from 'vue-class-component';
import Vue from 'vue';
import { Watch } from 'vue-property-decorator';
import { NoCache } from '@/decorators/nocache';
import ServerLogDetails from './ServerLogDetails.vue';


@Component({
  components: { ServerLogDetails },
  props: {
    selectedLog: {
      type: Object,
      required: true
    }
  }
})
export default class ServerLogs extends Vue {

  // From component attribute
  public selectedLog!: ISelectedLog;

  // From Global Mixin
  public initLogHelper!: () => LogHelper;

  public logs: ILog[] = [];
  public lastFilteredLog: ILog[] = [];

  private _requestTime = '';
  private _renderTime = '';

  // Initialized in created() vue lifecycle
  private _logHelper!: LogHelper;


  @NoCache
  get logDetails() {
    return {
      filterTime: '0ms',
      renderTime: this._renderTime,
      requestTime: this._requestTime,
      lines: this.logs.length,
      length: this.logs.length
    };
  }


  public created() {
    this._logHelper = this.initLogHelper();
  }


  @Watch('selectedLog', { deep: true })
  private async _selectFile() {
    if (!this.selectedLog.name) {
      this.logs = [];
      this.$emit('updated', this.logDetails);
      return;
    }


    const filepath = this._logHelper.getFilePath(this.selectedLog)
        , { changed, logs } = await this._logHelper.getLogs('server', filepath)
    ;

    this._requestTime = this._logHelper.lastRequestTime;

    if (!changed) {
      this._renderTime = '0ms';
      this.$emit('updated', this.logDetails);
      return;
    }

    Web.timeIt('renderLogs', 'render', () => {
      this.logs = logs;
    });

    this._renderTime = Web.measure('render');
    this.$emit('updated', this.logDetails);

  }


  public toggle(ev: MouseEvent, log: ILog) {
    log.open = !log.open;
  }


  public getLevel(log: ILog) {
    return this._logHelper.levels[log.level];
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









}


