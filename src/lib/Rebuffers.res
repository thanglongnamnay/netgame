type rec schema =
  | Bool(bool)
  | Byte(int)
  | Short(int)
  | Int(int)
  | Float(float)
  | Array(list)
  | Schema(array<schema>)
and list = array<schema>
module Deserializer = {
  type rec t<'a> =
    | Bool: t<bool>
    | Byte: t<int>
    | Short: t<int>
    | Int: t<int>
    | Float: t<float>
    | Array(t<'b>): t<array<'b>>
    | List(schema => 'b): t<array<'b>>

  let rec deserialize:
    type a. (schema, t<a>) => a =
    (schema, deserializer) =>
      switch (schema, deserializer) {
      | (Bool(v), Bool) => v
      | (Byte(v), Byte) => v
      | (Short(v), Short) => v
      | (Int(v), Int) => v
      | (Float(v), Float) => v
      | (Array(v), Array(deserializer)) =>
        v->Belt.Array.map(schema => deserialize(schema, deserializer))
      | (Array(v), List(fn)) => v->Belt.Array.map(fn)
      | _ => raise(Not_found)
      }
}
let deserialize = Deserializer.deserialize

let toList = (values: array<'a>, map): list => values->Belt.Array.map(map)
let toArray = (t: list): array<schema> => t

module Send = {
  let rec size = data =>
    switch data {
    | Bool(_) => 1
    | Byte(_) => 1
    | Short(_) => 2
    | Int(_) => 4
    | Float(_) => 4
    | Array(t) => t->Belt.Array.reduce(0, (a, v) => a + size(v)) + 4
    | Schema(t) => t->Belt.Array.reduce(0, (a, v) => a + size(v))
    }
  let rec packData = (buffer, ~offset=0, data) => {
    switch data {
    | Bool(v) => buffer->NodeJs.Buffer.writeInt8(v ? 1 : 0, ~offset)
    | Byte(v) => buffer->NodeJs.Buffer.writeInt8(v, ~offset)
    | Short(v) => buffer->NodeJs.Buffer.writeInt16LE(v, ~offset)
    | Int(v) => buffer->NodeJs.Buffer.writeInt32LE(v, ~offset)
    | Float(v) => buffer->NodeJs.Buffer.writeFloatLE(v, ~offset)
    | Array(t) => {
        let offset = buffer->NodeJs.Buffer.writeInt32LE(Belt.Array.length(t), ~offset)
        packData(buffer, ~offset, Schema(t))
      }
    | Schema(t) => t->Belt.Array.reduce(offset, (a, v) => buffer->packData(~offset=a, v))
    }
  }
  let pack = t => {
    let buffer = NodeJs.Buffer.alloc(size(t))
    packData(buffer, ~offset=0, t)->ignore
    buffer
  }
}
module Receive = {
  type rec t =
    | Bool
    | Byte
    | Short
    | Int
    | Float
    | Array(t)
    | Schema(array<t>)

  let rec fromSendSchema = (sendSchema: schema): t =>
    switch sendSchema {
    | Bool(_) => Bool
    | Byte(_) => Byte
    | Short(_) => Short
    | Int(_) => Int
    | Float(_) => Float
    | Array(t) => Array(t->Belt.Array.getExn(0)->fromSendSchema)
    | Schema(t) => Schema(t->Belt.Array.map(fromSendSchema))
    }
  type readData = {
    data: schema,
    offset: int,
  }
  let createReadData = (data, offset) => {data: data, offset: offset}
  let rec readData = (buffer, ~offset=0, schema) => {
    switch schema {
    | Bool => (buffer->NodeJs.Buffer.readInt8(~offset) > 0)->Bool->createReadData(offset + 1)
    | Byte => buffer->NodeJs.Buffer.readInt8(~offset)->Byte->createReadData(offset + 1)
    | Short => buffer->NodeJs.Buffer.readInt16LE(~offset)->Short->createReadData(offset + 2)
    | Int => buffer->NodeJs.Buffer.readInt32LE(~offset)->Int->createReadData(offset + 4)
    | Float => buffer->NodeJs.Buffer.readFloatLE(~offset)->Float->createReadData(offset + 4)
    | Array(schema) => {
        let {data: length, offset} = readData(buffer, ~offset, Int)
        switch length {
        | Int(length) => {
            let (data, offset) = Belt.Array.make(length, schema)->Belt.Array.reduce(([], offset), (
              a,
              v,
            ) => {
              let (t, offset) = a
              let dataRead = readData(buffer, ~offset, v)
              (t->Belt.Array.concat([dataRead.data]), dataRead.offset)
            })
            createReadData(Array(data), offset)
          }
        | _ => raise(Not_found)
        }
      }
    | Schema(t) => {
        let (data, offset) = t->Belt.Array.reduce(([], offset), (a, v) => {
          let (t, offset) = a
          let dataRead = readData(buffer, ~offset, v)
          (t->Belt.Array.concat([dataRead.data]), dataRead.offset)
        })
        createReadData(Schema(data), offset)
      }
    }
  }
  let read = (buffer, schema) => {
    readData(buffer, ~offset=0, schema->fromSendSchema).data
  }
}
let pack = Send.pack
let read = Receive.read
