type rec schema =
  | Bool(bool)
  | Byte(int)
  | Short(int)
  | Int(int)
  | Float(float)
  | Array(list)
  | Schema(array<schema>)
and list
module Deserializer: {
  type rec t<'a> =
    | Bool: t<bool>
    | Byte: t<int>
    | Short: t<int>
    | Int: t<int>
    | Float: t<float>
    | Array(t<'b>): t<array<'b>>
    | List(schema => 'b): t<array<'b>>
}
let deserialize: (schema, Deserializer.t<'a>) => 'a
let toList: (array<'a>, 'a => schema) => list
let toArray: list => array<schema>
let pack: schema => NodeJs.Buffer.t
let read: (NodeJs.Buffer.t, schema) => schema
