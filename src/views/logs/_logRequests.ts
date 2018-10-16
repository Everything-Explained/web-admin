import { webGet, Web } from '@/utilities/web';
import { ILog } from './_logs';

interface IRawLog {
  status: number;
  data: string[];
}


export class LogRequests {

  public rawLogs: string[] = [];

  public lastFileLength = 0;
  public lastFilteredFile = [] as ILog[];
  public lastFileName = '';

  public reqTime = '';
  public filterTime = '';




  public static countChildren(log: ILog) {
    if (log.children.length) {
      return log.children.reduce((acc, cv) => {
        return acc + cv.children.length;
      }, log.children.length);
    }
    return 0;
  }




  constructor(private _webGetter: webGet, private _basePath: string) {}




  public async getLogs(fileName: string) {

    performance.mark('webGetBegin');
    const {status, data} =
              await this._webGetter(`${this._basePath}/${fileName}`) as IRawLog
    ;
    performance.mark('webGetEnd');
    performance.measure('webGet', 'webGetBegin', 'webGetEnd');
    this.reqTime = Web.measure('webGet');

    // if (   this.lastFileName == fileName
    //     && this.lastFileLength == data.length)
    // {
    //   return {changed: false, data: this.lastFilteredFile };
    // }

    this.lastFileLength = data.length;
    this.lastFileName = fileName;

    performance.mark('filterProcessStart');
    const logs = this._parseLogs(data);
    this.lastFilteredFile = this._filterLogs(logs);
    performance.mark('filterProcessEnd');
    performance.measure('filterProc', 'filterProcessStart', 'filterProcessEnd');
    this.filterTime = Web.measure('filterProc');

    return {changed: true, data: this.lastFilteredFile };
  }


  private _parseLogs(logs: string[]) {
    const logObjs = [];
    for (const log of logs) {
      if (log) logObjs.push(JSON.parse(log));
    }
    return logObjs;
  }


  private _filterLogs(logs: ILog[]) {
    const LOGS: ILog[] = [];
    while (logs.length) {
      const log = logs[0]
          , tempLogs: ILog[] = []
      ;
      log.children = [];
      log.open = false;
      logs = logs.filter(l => {
        if (l.uid != log.uid) return true;
        tempLogs.push(l);
        return false;
      });
      LOGS.push(this._linkLogs(tempLogs));
    }

    return this._linkDuplicates(
      this._setLogType(LOGS),
    );
  }


  /**
   * Links log parts (identical log UIDs) together as
   * one individual log. This includes merging data.
   *
   * @param logParts Logs with the same UID
   */
  private _linkLogs(logParts: ILog[]) {
    const LOG = logParts[0];

    for (const log of logParts) {
      if (log.req) {
        Object.assign(LOG, log.req);
        LOG.msgs = [LOG.url]; // URL is only available here
        continue;
      }

      if (log.err) {
        LOG.err = log.err;
        // Force error message to be main message.
        LOG.msg = log.msg;
      }

      // Make sure higher levels get priority
      if (log.level > LOG.level) LOG.level = log.level;

      // Allow debug messages to get priority over normal
      if (LOG.level < 30 && log.level < 30) LOG.level = log.level;

      // Catch params data set within route request
      if (log.data) {
        LOG.data =
          LOG.data
            ? Object.assign(LOG.data, log.data)
            : log.data
        ;
      }

      if (log.statusCode) {
        LOG.statusCode = log.statusCode;
        LOG.statusMsg = log.msg;
      }
      else
        LOG.msgs.push(log.msg)
      ;
    }
    LOG.localeDateString = new Date(LOG.time).toLocaleDateString();
    return LOG;
  }


  /**
   * Finds duplicate logs and applies those duplicates
   * to a root log as its children.
   *
   * @param logs An array of logs.
   */
  private _linkDuplicates(logs: ILog[]) {
    const LOGS = [] as ILog[];

    while (logs.length) {
      const log = logs[0]
          , templogs: ILog[] = []
      ;
      logs = logs.filter(l => {
        if (!this._isLogEqual(l, log)) return true;
        templogs.push(l);
        return false;
      });
      templogs.splice(0, 1);
      log.children = (templogs.length) ? templogs : [];
      LOGS.push(log);
    }

    return this._linkTypes(LOGS);
  }


  private _linkTypes(logs: ILog[]) {
    const LOGS = [] as ILog[];

    while (logs.length) {
      const log = logs[0]
          , tempILogs = [] as ILog[]
      ;
      let identLogs = [] as ILog[];

      logs = logs.filter(l => {
        if (log.identity != l.identity) return true;
        identLogs.push(l);
        return false;
      });

      while (identLogs.length) {
        const iLog = identLogs[0];
        let tempLogs: ILog[] = [];

        if (iLog.level < 40) {
          identLogs = identLogs.filter(l => {
            if (!(   iLog.type == l.type
                  && this._isDataEqual(iLog, l)
                  && l.level < 40)) return true
            ;
            tempLogs.push(l);
            return false;
          });
          tempLogs.splice(0, 1);
        }
        else {
          identLogs.splice(0, 1);
          tempLogs = [];
        }

        iLog.requests = iLog.children.length + 1; // +1 for the actual log itself
        iLog.children = (tempLogs.length) ? tempLogs : [];
        tempILogs.push(iLog);
      }

      LOGS.push(...tempILogs);
    }
    return LOGS;
  }


  /**
   * Apply more descriptive types to logs than just
   * using the default method type.
   *
   * @param logs Filtered logs
   */
  private _setLogType(logs: ILog[]) {
    for (const log of logs) {
      let type = log.method;
      const urlParts = log.url.split('.');

      if      (log.url == '/')                    type = 'FILE';

      else if (    urlParts.length > 1
                && !~urlParts.pop()!.indexOf('/')
                && log.method == 'GET')           type = 'FILE';

      else if (log.data && log.method == 'GET')   type = 'QUERY';

      else if (   log.data
               && (~log.url.indexOf('/login')
               || ~log.url.indexOf('/logout')))    type = 'AUTH';

      log.type = type;
    }

    return logs;
  }


  /**
   * Tests two logs to make sure they have identical
   * data attributes.
   *
   * @param l1 First log to test
   * @param l2 Second log to test against the first
   */
  private _isDataEqual(l1: ILog, l2: ILog) {
    if (l1.data && l2.data) {
      // Check data length
      if (Object.keys(l1.data).length != Object.keys(l2.data).length) return false;

      for (const key in l1.data) {
        if (!l2.data[key]) return false;
        if (l1.data[key] != l2.data[key]) return false;
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
  private _isLogEqual(l1: ILog, l2: ILog) {

    return (
         l1.identity == l2.identity
      && l1.type == l2.type
      && l1.msg == l2.msg
      && l1.method == l2.method
      && l1.statusCode == l2.statusCode
      && l1.localeDateString == l2.localeDateString
      && this._isDataEqual(l1, l2)
    );
  }








}


