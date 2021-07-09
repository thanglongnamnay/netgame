type t<'a>
let make: array<'a> => t<'a>
let isEmpty: t<'a> => bool
let head: t<'a> => option<'a>
let tail: t<'a> => t<'a>
let toArray: t<'a> => array<'a>
let map: (t<'a>, 'a => 'b) => t<'b>
let cons: (t<'a>, 'a) => t<'a>
let append: (t<'a>, 'a) => t<'a>
let batchUpdate: (t<'a>, (array<'a>, (. array<'a>) => t<'a>) => t<'a>) => t<'a>
