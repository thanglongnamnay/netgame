type t<'a> = array<'a>
let make = arr => arr->Js.Array2.sliceFrom(0)
let length = Js.Array2.length
let isEmpty = t => t->Js.Array2.length === 0
let head = t => t->Belt.Array.get(0)
let tail = t => isEmpty(t) ? [] : t->Js.Array2.sliceFrom(1)
let sliceFrom = Belt.Array.sliceToEnd
let toArray = make
let concat = Belt.Array.concat
let map = Belt.Array.map
let cons = (t, a) => [a]->Js.Array2.concat(t)
let append = (t, a) => t->Js.Array2.concat([a])
external castToImmutable: array<'a> => t<'a> = "%identity"
let commitChanges: (. array<'a>) => t<'a> = (. mutArr) => castToImmutable(mutArr)
let batchUpdate = (immArr: t<'a>, callback) => {
  callback(Js.Array2.sliceFrom(immArr, 0), commitChanges)
}
let getExn = Belt.Array.getExn
