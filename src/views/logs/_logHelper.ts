
import { Web } from '@/utilities/web';
import { IHttpLog } from '@/components/httpLogs/_httpLogs';


// Log types IN ORDER of Logs{}.logTypes
export enum LogType {
  NULL,
  HTTP,
  SERVER,
  SOCKET,
}


export interface ILog {
  uid: string;
  msg: string;
  level: number;
  time: string;
}



export class LogHelper {

  public levels: string[] = [];

  public lastRequestTime = '0ms';
  public lastLogCount = 0;


  private _lastFileName = '';
  private _lastLogUID   = '';
  private _lastFile: ILog[] =  [];
  private _basePath = 'https://localhost:5007/protected/logs';




  constructor(private _web: Web) {
    this.levels[20] = 'debug';
    this.levels[30] = 'default';
    this.levels[40] = 'warn';
    this.levels[50] = 'error';
  }




  /**
   * Lists the logs within a specified folder.
   *
   * @param folder Name of a folder
   */
  public async listLogs(folder: string) {
    return this._web.get(`${this._basePath}/list/${folder}`);
  }


  /**
   * Retrieves the logs from a specified folder and
   * filename given.
   *
   * @param folder Name of a folder
   * @param filename Name of a file in the specified folder
   */
  public async getLogs(folder: string, filename: string) {

    const log =
        await this._getLogFile(
          `${this._basePath}/${folder}/${filename}`
        )
    ;

    let changed = true;

    if (this._isSameLog(filename, log))
      changed = false;
    else
      this._lastFile = this._parseLogs(log)
    ;

    this._lastFileName   = filename;
    this.lastLogCount    = log.split('\n').length - 1;

    return {
      changed,
      logs: this._lastFile
    };

  }


  /**
   * Deletes a specified file using the filename and
   * folder given.
   *
   * @param folder Name of a folder
   * @param filename Name of a file in the specified folder
   */
  public deleteLog(folder: string, filename: string) {
    return this._web.delete(`${this._basePath}/${folder}/${filename}`);
  }






  /**
   * Converts raw log data from a string, to an array of
   * log objects.
   *
   * @param rawLogs String of log data separated by a new line
   */
  private _parseLogs(rawLogs: string) {
    const logObjs = []
        , logs = rawLogs.split('\n')
    ;

    // Last line will always be an empty string
    logs.pop();

    for (const log of logs) {
      logObjs.push(JSON.parse(log));
    }
    return logObjs;
  }


  /**
   * Retrieves the raw log data from the path specified.
   *
   * @param path The log file path to retrieve
   * @param web The web wrapper to fetch the file
   */
  private async _getLogFile(path: string) {

    let status = 0
      , log = ''
    ;

    await Web.timeItAsync('webDataGet', 'logData', async () => {
      const resp = await this._web.get(path);
      status = resp.status;
      log = resp.data as string;
    });

    this.lastRequestTime = Web.measure('webDataGet');

    if (status == 200) {
      return log;
    }

    throw new Error(`LogHelper::getLogData():: Failed to fetch path :: <${status}:${log}>`);

  }


  /**
   * Checks if the specified log matches the last
   * retrieved log.
   *
   * @param filename Name of the file to check
   * @param rawLogs Raw log file to check
   */
  private _isSameLog(filename: string, rawLogs: string) {

    const logs = rawLogs.split('\n')
        , lastLog = JSON.parse(logs[logs.length - 2]) as ILog
    ;

    if (!logs.length && !this._lastFile.length) return true;

    if (!this._lastLogUID || this._lastLogUID != lastLog.uid) {
      this._lastLogUID = lastLog.uid;
      return false;
    }
    else {
      return (
        lastLog.uid == this._lastLogUID
        && filename == this._lastFileName
      );
    }

  }


}


