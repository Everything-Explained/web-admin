import { relativeTimeRounding } from 'moment';

export type webGet = (url: string, options?: RequestInit) => Promise<{ status: number; data: any }>;
export type webDelete = (url: string) => Promise<{ status: number; data: any }>;
export type webPost = (url: string, body: any, options?: RequestInit) => Promise<any>;


export class Web {

  constructor() { }

  public get(url: string, options?: RequestInit) {
    const method = 'GET';

    options =
      options
        ? Object.assign({method}, options)
        : {method}
    ;

    return this._fetch(url, options);
  }

  public post(url: string, body: any, options?: RequestInit) {

    const method = 'POST';
    let contentType = ''
      , data = null
    ;

    if (body) {
      if (typeof body == 'object') {
        contentType = 'application/json';
        data = JSON.stringify(body);
      }
      else {
        contentType = 'text/plain';
        data = body;
      }
    }

    options = Object.assign(
      {
        method,
        headers: { 'Content-Type': contentType },
      },
      options,
    );

    return this._fetch(url, options);
  }

  public delete(url: string) {
    return this.post(url, null, {
      method: 'DELETE',
    });
  }

  private async _fetch(url: string, options: RequestInit) {
    const resp = await fetch(url, options)
        , contentType = resp.headers.get('Content-Type') || ''
    ;
    let data = null;

    if (~contentType.indexOf('application/json')) {
      data = resp.json();
    }
    else if (~contentType.indexOf('image/')) {
      data = resp.blob();
    }
    else {
      data = resp.text();
    }

    return { status: resp.status, data: await data };
  }
}

