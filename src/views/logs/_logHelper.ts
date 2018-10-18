import { Web } from '@/utilities/web';
import { IRawLog } from './_requestLogs';



export class LogHelper {

  /**
   * Converts raw log data from a string, to an array of
   * log objects.
   *
   * @param rawLogs String of log data separated by a new line
   */
  public static parseLogs(rawLogs: string) {
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
  public static async getLogData(path: string, web: Web) {

    let status = 0
      , data = ''
    ;

    await Web.timeItAsync('webDataGet', 'logData', async () => {
      const resp = await web.get(path) as IRawLog;
      status = resp.status;
      data = resp.data;
    });

    const logReqTime = Web.measure('webDataGet');

    if (status == 200) {
      return { logReqTime, data };
    }

    throw new Error(`LogHelper::getLogData():: Failed to fetch path :: <${status}:${data}>`);

  }


}


