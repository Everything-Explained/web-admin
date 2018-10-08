
export type WebGet = (url: string, options?: RequestInit) => Promise<any>;
export type WebPost = (url: string, options?: RequestInit) => Promise<any>;


export class Web {

  constructor() {}

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

    const method = 'POST'
    let contentType = '';

    if (typeof body != 'object') {
      contentType = 'text/plain';
    }
    else {
      contentType = 'application/json';
    }

    options = Object.assign(
      {
        method,
        headers: { 'Content-Type': contentType},
        body,
      },
      options,
    );

    return this._fetch(url, options);
  }

  private async _fetch(url: string, options: RequestInit) {
    const resp = await fetch(url, options)
        , contentType = resp.headers.get('Content-Type') || ''
    ;

    if (~contentType.indexOf('application/json')) {
      return resp.json();
    }
    if (~contentType.indexOf('image/')) {
      return resp.blob();
    }
    else {
      return resp.text();
    }
  }
}