import { Web } from '@/utilities/web';
import { LogHelper } from './_logHelper';



export class SocketLogs {

  private _lastFileName = '';
  private _lastFileLength = 0;


  get logs() {
    return this._logHelper.listLogs('socket');
  }



  constructor(private _web: Web, private _logHelper: LogHelper) {}




  public async getLog(filename: string) {

  }

}


