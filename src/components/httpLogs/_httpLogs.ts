
import { Web } from '@/utilities/web';
import { LogHelper, LogType, ISelectedLog } from '../../views/logs/_logHelper';
import HttpLogDetails from '../../components/httpLogs/HttpLogDetails.vue';
import Component from 'vue-class-component';
import Vue from 'vue';
import { Watch } from 'vue-property-decorator';




export interface IHttpLogData {
  id       : string;  // Unique
  date     : number;  // ISO format
  address  : string;  // IP
  identity?: string;  // Session Alias
  referrer : string;  //
  agent    : string;  // User-Agent
  req: {
    method: string;
    status: number;
    url: string;
    data: {
      query: { [key: string]: string }
      params: { [key: string]: string }
      body: { [key: string]: string }
    };
  };
  data: { [key: string]: string };
}


export interface IHttpLog extends IHttpLogData {
  // TODO: This is a message map and should be named as such
  // msgs:             string[];   // INIT::_linkLogParts()
  // localeDateString: string;     // INIT::_linkLogs()
  open    : boolean;
  level   : string;
  type    : string;      // INIT::_setLogType()
  children: IHttpLog[];  // INIT::_filterLogs()
  requests: number;      // INIT::_combineLogs()
}


@Component({
  components: { HttpLogDetails },
  props: {
    selectedLog: {
      type: Object,
      required: true
    },
  }
})
export default class HttpLogs extends Vue {

  // From component attribute
  public selectedLog!: ISelectedLog;

  public logs: IHttpLog[] = [];
  public lastFilteredLogs: IHttpLog[] = [];

  // Performance measurements
  public filterTime = '';
  public renderTime = '';
  public requestTime = '';

  // Global Mixin
  public initWeb!: () => Web;
  public initLogHelper!: () => LogHelper;

  // Initialized in beforeCreate() lifecycle method
  private _web!: Web;
  private _logHelper!: LogHelper;

  private _folder = 'http';
  private _logFileLength = 0;



  get logDetails() {
    return {
      filterTime: this.filterTime,
      renderTime: this.renderTime,
      requestTime: this.requestTime,
      lines: this.logs.length,
      length: this._logFileLength,
    };
  }



  public created() {
    this._web = this.initWeb();
    this._logHelper = this.initLogHelper();
  }


  @Watch('selectedLog', {deep: true})
  private async _selectFile() {

    if (!this.selectedLog.name) {
      this.logs = [];
      this._logFileLength = 0;
      this.$emit('updated', this.logDetails);
      return;
    }

    const filepath = this._logHelper.getFilePath(this.selectedLog)
        , { changed, logs } = await this._logHelper.getLogs(filepath)
    ;

    if (!changed) return;

    Web.timeIt('filterLogs', 'filterLogs', () => {
      this.lastFilteredLogs = this._filterLogs(logs as IHttpLog[]);
    });

    this.filterTime = Web.measure('filterLogs');

    Web.timeIt('renderLogs', 'render', () => {
      this.logs = this.lastFilteredLogs;
    });

    this.renderTime = Web.measure('renderLogs');
    this._logFileLength = logs.length;
    this.requestTime = this._logHelper.lastRequestTime;

    this.$emit('updated', this.logDetails);
  }



  public delete(filename: string) {
    return this._logHelper.deleteLog(this._folder, filename);
  }


  public getLevel(log: IHttpLog) {
    const url = log.req.url;
    const status = log.req.status;

    if (status == 403) {
      return 'forbidden';
    }

    if (~url.indexOf('/protected')) {
      return 'special';
    }

    if (status >= 200 && status < 400) {
      return 'default';
    }

    if (status >= 400 && status < 500) {
      return 'warn';
    }

    if (status >= 500) {
      return 'error';
    }

    console.error('getLevel()::Invalid Status', log);
    return 'error';
  }


  // public getMessage(log: IHttpLog) {
  //   let msg = log.url;

  //   if (log.msgs.length > 1) {
  //     msg = `${log.statusCode} => ${log.msgs[0]}`;
  //   }

  //   return msg;
  // }


  public getRequestCount(log: IHttpLog) {
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


  public toggle(ev: MouseEvent, log: IHttpLog) {
    // TODO: Uncomment to hide all, on toggle
    // this.logs.forEach(l => {
    //   if (log.identity == l.identity) return;
    //   l.open = false;
    // });
    log.open = !log.open;
  }


  public normalizeAddress(address: string) {
    address = (~address.indexOf('::1')) ? '127.0.0.1' : address;
    return address.replace('::ffff:', '');
  }





  private _filterLogs(logs: IHttpLog[]) {
    const parsedLogs: IHttpLog[] = [];

    for (const log of logs) {
      log.type = this.getLogType(log);
      log.level = this.getLevel(log);
      log.open = false; // Default
      const data = log.req.data;
      if (data) {
        log.data = Object.assign({}, data.query, data.params, data.body);
      }
      log.children = [];
      parsedLogs.push(log);
    }

    return this._linkDuplicates(parsedLogs).sort((l1, l2) => {
      if (l1.date < l2.date) return 1;
      return -1;
    });
  }


  /**
   * Finds duplicate logs and applies those duplicates
   * to a root log as its children.
   *
   * @param logs An array of logs.
   */
  private _linkDuplicates(logs: IHttpLog[]) {
    const LOGS = [] as IHttpLog[];

    while (logs.length) {
      const log = logs.shift();
      const templogs: IHttpLog[] = [];

      logs = logs.filter(l => {
        if (!this._isLogEqual(l, log)) return true;
        templogs.push(l);
        return false;
      });

      log.children = (templogs.length) ? templogs : [];
      const childDate =
        (templogs.length)
          ? log.children[templogs.length - 1].date
          : log.date
      ;
      log.date = log.date > childDate ? log.date : childDate;
      LOGS.push(log);
    }
    return this._combineLogs(LOGS);
  }


  /**
   * Assigns logs as children to parent logs of the
   * same kind; specifically by identity unless other
   * significant identifires exist.
   *
   * @param logs The logs array
   */
  private _combineLogs(logs: IHttpLog[]) {
    const LOGS = [] as IHttpLog[];

    while (logs.length) {
      const log = logs.shift();
      const similarLogs = [] as IHttpLog[];

      logs = logs.filter(l => {
        if (!(   log.address == l.address
              && log.type == l.type
              && log.req.status == l.req.status
              && this._isDataEqual(log, l)
              && this.isWithinHour(log, l)
              && (l.level == 'default' || l.level == 'special'))) return true;
        similarLogs.push(l);
        return false;
      });

      //
      // TODO: Similar children date and actual children date
      // should be defined separately
      //
      if (similarLogs.length) {
        log.requests = log.children.length || 1;
        // Force "similar" children into chronological order
        log.children = similarLogs.sort((l1, l2) => {
          if (l1.date < l2.date) return 1;
          return -1;
        });
        log.date = log.children[0].date;
      }
      else if (log.children.length) {
        log.requests = log.children.length + 1; // +1 for the log itself
        // Log "actual" children are always in chronological order
        log.date = log.children[log.children.length - 1].date;
        log.children = [];
      }
      else {
        log.requests = 1;
      }

      LOGS.push(log);
    }
    return LOGS;
  }


  /**
   * Apply more descriptive types to logs than just
   * using the default method type.
   *
   * @param log Filtered logs
   */
  private getLogType(log: IHttpLog) {
    const req = log.req;

    if (req.url.match(/\.\w+$/g))
      return 'FILE'
    ;

    if (req.data) {
      if (req.data.query)
        return 'QUERY'
      ;
      if (req.data.body && req.method == 'POST')
        return 'SUBMIT'
      ;
    }

    return req.method;
  }


  /**
   * Tests two logs to make sure they have identical
   * data attributes.
   *
   * @param l1 First log to test
   * @param l2 Second log to test against the first
   */
  private _isDataEqual(l1: IHttpLog, l2: IHttpLog) {
    if (l1.data && l2.data) {

      const l1Keys = Object.keys(l1.data);
      const l2Keys = Object.keys(l2.data);

      // Check data length
      if (l1Keys.length != l2Keys.length) return false;

      for (const i of l1Keys) {
        if (!l2.data[i]) return false;
        // Idendical if data is url parameter e.g. /url/:param
        if ( ~l1.req.url.indexOf(`/${l1.data[i]}`)
          && ~l2.req.url.indexOf(`/${l2.data[i]}`)
        ) {
          return true;
        }
        if (l1.data[i] != l2.data[i]) return false;
      }

      return true;
    }
    return l1.data == l2.data;
  }


  /**
   * Check the equality between two logs based on
   * their potential differing properties.
   *
   * @param l1 Frist log to test
   * @param l2 Second log to test against the first
   */
  private _isLogEqual(l1: IHttpLog, l2: IHttpLog) {
    return (
         l1.address == l2.address
      && l1.type == l2.type
      && l1.req.url == l2.req.url
      && this.isWithinHour(l1, l2)
      && l1.req.method == l2.req.method
      && l1.req.status == l2.req.status
      && this._isDataEqual(l1, l2)
    );
  }

  private isWithinHour(l1: IHttpLog, l2: IHttpLog) {
    return Math.abs(l1.date - l2.date) <= 3600000;
  }








}


