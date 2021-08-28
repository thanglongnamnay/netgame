let test = () => {
  open Touch
  let mouseDown = Down({x: 1., y: 2.})
  Tests.run(__POS_OF__("isMouseUp(Up) == true"), isMouseUp(Up), Tests.equal, true)
  Tests.run(__POS_OF__("isMouseDown(Up) == false"), isMouseDown(Up), Tests.equal, false)
  Tests.run(__POS_OF__("isMouseUp(Down) == false"), isMouseUp(mouseDown), Tests.equal, false)
  Tests.run(__POS_OF__("isMouseDown(Down) == true"), isMouseDown(mouseDown), Tests.equal, true)
  Tests.run(
    __POS_OF__("getPos(Down) == Some({x: 1, y: 2})"),
    getPos(mouseDown),
    Tests.equal,
    Some({x: 1., y: 2.}),
  )
  Tests.run(__POS_OF__("getPos(Up) == None"), getPos(Up), Tests.equal, None)
}
