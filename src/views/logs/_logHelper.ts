
import { Web } from '@/utilities/web';
import { IRawLog, ILog } from './_requestLogs';




export class LogHelper {

  private _lastFileName = '';
  private _lastLogUID = '';
  private _lastFile: ILog[] = [];

  private _basePath = 'https://localhost:5007/protected/logs';




  constructor(private _web: Web) {}




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
   * Retrieves the raw log data from the path specified
   * and the time it took to retrieve the file.
   *
   * @param path The log file path to retrieve
   * @param web The web wrapper to fetch the file
   */
  private async _getLogFile(path: string) {

    let status = 0
      , logFile = ''
    ;

    await Web.timeItAsync('webDataGet', 'logData', async () => {
      const resp = await this._web.get(path) as IRawLog;
      status = resp.status;
      logFile = resp.data;
    });

    const logReqTime = Web.measure('webDataGet');

    if (status == 200) {
      return { logReqTime, logFile };
    }

    throw new Error(`LogHelper::getLogData():: Failed to fetch path :: <${status}:${logFile}>`);

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
   * filename given, as well as the time it took
   * to retrieve the file.
   *
   * @param folder Name of a folder
   * @param filename Name of a file in the specified folder
   */
  public async getLogs(folder: string, filename: string) {

    const { logReqTime, logFile } =
        await this._getLogFile(`${this._basePath}/${folder}/${filename}`)
    ;
    let changed = true;

    if (this._isSameFile(filename, logFile))
      changed = false;
    else
      this._lastFile = this._parseLogs(logFile)
    ;

    this._lastFileName = filename;

    return {
      logReqTime,
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


  private _isSameFile(filename: string, rawLogs: string) {

    if (filename != this._lastFileName) return false;

    const logs = rawLogs.split('\n');
    logs.pop(); // Remove empty line

    if (!logs.length && !this._lastFile.length) return true;

    const lastLog = JSON.parse(logs[logs.length - 2]) as ILog;

    return (
         filename == this._lastFileName
      && lastLog.uid == this._lastLogUID
    );
  }


}


