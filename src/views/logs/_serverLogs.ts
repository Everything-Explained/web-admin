import { Web } from '@/utilities/web';
import { LogHelper } from './_logHelper';
import { ILog } from './_httpLogs';



export class ServerLogs {

  public lastFile: ILog[] = [];

  private _lastFileName = '';
  private _lastFileLength = 0;



  get logs() {
    return this._logHelper.listLogs('server');
  }




  constructor(private _web: Web, private _logHelper: LogHelper) {}




  public getLevel(log: ILog) {
    return this._logHelper.levels[log.level];
  }


  public async getFilteredLogs(filename: string) {
    const { logReqTime, changed, logs } =
              await this._logHelper.getLogs(
                'requests',
                filename
              )
    ;

    if (this._lastFileName == filename
        && this._lastFileLength == logs.length)
    {
      return { changed: false, logs: this.lastFile };
    }

    // Filter goes here

    return { changed: true, logs: this.lastFile };

  }


  public delete(filename: string) {
    return this._logHelper.deleteLog('server', filename);
  }





}