type t
type rInfo = {
  address: string,
  port: int,
}
let fnv32 = s => {
  let charAt = (s, i) => s->Js.String2.charCodeAt(i)->Belt.Float.toInt
  let _FNV_PRIME_32 = 16777619
  let _FNV_OFFSET_32 = 2166136261
  let len = Js.String2.length(s)
  let rec loop = (hash, i) => {
    if i == len {
      hash
    } else {
      (lxor(hash, s->charAt(i)) * _FNV_PRIME_32)->loop(i + 1)
    }
  }
  loop(_FNV_OFFSET_32, 0)
}
let hashId = rInfo => {
  let {address, port} = rInfo
  fnv32(j`$address:$port`)
}
