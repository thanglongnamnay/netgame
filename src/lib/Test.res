type color = [#1 | #2 | #3]
let color: color = #2
let message = "The color is " ++ (color :> int)->Belt.Int.toString
