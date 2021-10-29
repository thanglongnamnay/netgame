type timeout
@val external setTimeout: (unit => unit, float) => timeout = "setTimeout"
@val external clearTimeout: timeout => unit = "clearTimeout"
type interval
@val external setInterval: (unit => unit, float) => interval = "setInterval"
@val external clearInterval: interval => unit = "clearInterval"
