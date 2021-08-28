let test = () => {
  open Frames
  let frame1 = create(2, [Payload.create(Up), Payload.create(Down({x: 1., y: 2.}))]->ImmuArray.make)
  let frame2 = create(
    3,
    [Payload.create(Up), Payload.create(Down({x: 1., y: 2.})), Payload.create(Up)]->ImmuArray.make,
  )
  let frame3 = create(3, [Payload.create(Up)]->ImmuArray.make)
  Tests.run(
    __POS_OF__("frame1+frame2 == frame2"),
    frame1->step(Concat(frame2)),
    Tests.equal,
    frame2,
  )
  Tests.run(
    __POS_OF__("frame2+frame1 == frame2"),
    frame2->step(Concat(frame1)),
    Tests.equal,
    frame2,
  )
  Tests.run(
    __POS_OF__("frame1+frame3 == frame2"),
    frame1->step(Concat(frame3)),
    Tests.equal,
    frame2,
  )
  Tests.run(
    __POS_OF__("frame2.getUnacked(2) == frame3"),
    frame2->step(RemoveFrom(2)),
    Tests.equal,
    frame3,
  )
  Tests.run(
    __POS_OF__("frame2+none == frame2"),
    frame2->step(Concat(Frames.nope())),
    Tests.equal,
    frame2,
  )
}
