


export default class Generator {
  public base62Table: string[] = [];




  constructor() {
    for (let i = 0; i < 62; i++) {
      let diff = (i > 9)
            ? ((i > 35) ? 61 : 55)
            : 48;

      this.base62Table.push(String.fromCharCode(i + diff));
    }
  }

  
  public toTimeUnits(milliseconds: number) {
    const seconds = milliseconds / 1000
      , minutes = seconds / 60
      , hours   = minutes / 60
      , days    = hours / 24
    ;

    return {
      milliseconds,
      seconds,
      minutes,
      hours,
      days
    };
  }



  public baseToDec(n: string, base: number) {

    const supported = base <= 62;

    if (!supported)
      throw new Error(`Generator::Base ${base} is not supported.`)
    ;

    if (base == 36 || base == 16) {
      n = n.toUpperCase();
    }

    let pow = n.length - 1
      , digits: number[] = []
      , x = 0
    ;

    for (let d = 0; d < n.length; d++) {
      if (!+n[d]) {
        for (let i = 0; i < this.base62Table.length; i++) {
          if (this.base62Table[i] == n[d]) {
            digits.push(i);
            break;
          }
        }
        continue;
      }
      digits.push(+n[d]);
    }

    for (let d = 0; d < digits.length; d++) {
      x += digits[d] * Math.pow(base, pow--);
    }
    return x;

  }


  public decToBase(decimal: number, base: number) {

    if (base > this.base62Table.length)
      throw new Error(`Generator::Base ${base} is not supported.`);

    let b = 0
      , x = '';

    while (!(decimal < 1)) {

      let r = Math.floor(decimal % base);
      x = this.base62Table[r] + x;
      decimal /= base;

    }
    return x;

  }

}



