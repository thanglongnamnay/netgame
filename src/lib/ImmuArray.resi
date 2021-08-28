type t<'a>
let make: array<'a> => t<'a>
let length: t<'a> => int
let isEmpty: t<'a> => bool
let head: t<'a> => option<'a>
let tail: t<'a> => t<'a>
let toArray: t<'a> => array<'a>
let sliceFrom: (t<'a>, int) => t<'a>
let concat: (t<'a>, t<'a>) => t<'a>
let map: (t<'a>, 'a => 'b) => t<'b>
let cons: (t<'a>, 'a) => t<'a>
let append: (t<'a>, 'a) => t<'a>
let batchUpdate: (t<'a>, (array<'a>, (. array<'a>) => t<'a>) => t<'a>) => t<'a>
