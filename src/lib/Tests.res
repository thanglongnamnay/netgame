// Test "framework"

@scope("process") @val external exit: int => unit = "exit"
@scope("Error") @val external captureStackTrace: {..} => unit = "captureStackTrace"
@module("@babel/code-frame") @val
external codeFrameColumns: (string, {..}, {..}) => string = "codeFrameColumns"
@module external glob: string => Js.Promise.t<array<string>> = "fast-glob"
type fs = {readFile: (string, {..}) => Js.Promise.t<string>}
@module("fs")
external fs: fs => Js.Promise.t<string> = "promise"
@module("path") @val external join: (string, string) => string = "join"

let dirname = switch %external(__dirname) {
| None => ""
| Some(dirname) => dirname
}

let cleanUpStackTrace = stack => {
  // Stack format: https://nodejs.org/api/errors.html#errors_error_stack
  // https://v8.dev/docs/stack-trace-api
  // https://github.com/sindresorhus/clean-stack/blob/main/index.js
  // Remove the node loader and other lines. No point in showing them
  let rec removeInternalLines = (lines, i) => {
    if i >= Js.Array2.length(lines) {
      lines
    } else if Js.Array2.unsafe_get(lines, i)->Js.String2.indexOf(" (node:") >= 0 {
      lines->Js.Array2.slice(~start=0, ~end_=i)
    } else {
      removeInternalLines(lines, i + 1)
    }
  }

  stack
  ->Js.String2.split("\n")
  // first line is "Error ...". Second line is this frame's stack trace. Ignore the 2
  ->Js.Array2.sliceFrom(2)
  ->removeInternalLines(0)
  // stack is indented 4 spaces. Remove 2
  ->Js.Array2.map(line => line->Js.String2.sliceToEnd(~from=2))
  ->Js.Array2.joinWith("\n")
}

let run = (loc, left, comparator, right) => {
  let ((file, line, _, _), content) = loc
  if !comparator(left, right) {
    glob(j`src/**/${file}.res`)
    ->Promise2.map(Belt.Array.getExn(_, 0))
    ->Promise2.flatMap(readFile(_, {"encoding": "utf-8"}))
    ->Promise2.map(fileContent => {
      let left = Js.Json.stringifyAny(left)
      let right = Js.Json.stringifyAny(right)
      let codeFrame = codeFrameColumns(
        fileContent,
        {"start": {"line": line}},
        {"highlightCode": true},
      )
      let errorMessage = j`
  \u001b[31mTest Failure!
  \u001b[36m$file\u001b[0m:\u001b[2m$line

$codeFrame

  \u001b[39mActual: \u001b[31m$left
  \u001b[39mExpected: \u001b[31m$right\u001b[0m
`
      Js.log(errorMessage)
      // API: https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
      let obj = Js.Obj.empty()
      captureStackTrace(obj)
      Js.log(obj["stack"]->cleanUpStackTrace)
    })
    ->ignore
  } else {
    Js.log2(j`\u001b[36mPassed:`, j`\u001b[39m$content`)
  }
}
let equal: type a. (a, a) => bool = (a, b) => a == b
