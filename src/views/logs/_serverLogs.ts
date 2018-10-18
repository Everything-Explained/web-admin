import { Web } from '@/utilities/web';
import { LogHelper } from './_logHelper';
import { ILog } from './_requestLogs';



export class ServerLogs {

  public lastFile: ILog[] = [];
  public lastFileName = '';
  public lastFileLength = 0;

  private _path = 'https://localhost:5007/protected/logs/server';




  constructor(private _web: Web) {}




  public async getLog(filename: string) {
    const { logReqTime, data } =
              await LogHelper.getLogData(`${this._path}/${filename}`, this._web)
        , logs = LogHelper.parseLogs(data);
    ;

    if (this.lastFileName == filename
        && this.lastFileLength == logs.length)
    {
      return { changed: false, data: this.lastFile }
    }

    // Filter goes here

    console.log(logs);

    return { changed: true, data: this.lastFile };

  }


  public listLogs() {
    return this._web.get(`${this._path}/list/server`);
  }





}