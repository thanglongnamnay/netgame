open Belt
type skills = {
  sprite: option<Sprite.t>,
  transform: option<Transform.t>,
  movable: option<Movable.t>,
  carLike: option<CarLike.t>,
}
type rec t = {
  skills: skills, // how to render this node
  zOrder: int,
  children: array<t>,
}
type chidrenAction = Add(t) | Remove(t) | Update(t, t => t)
type action = ZOrder(int => int) | Children(chidrenAction) | Skills(skills => skills)

let rec childrenReduce = (children, action) =>
  switch action {
  | Add(child) => children->Array.concat([child])
  | Remove(child) => children->Array.keep(c => c != child)
  | Update(child, map) => children->childrenReduce(Remove(child))->childrenReduce(Add(map(child)))
  }

let reduce = (t, action) =>
  switch action {
  | ZOrder(map) => {...t, zOrder: map(t.zOrder)}
  | Children(action) => {...t, children: t.children->childrenReduce(action)}
  | Skills(map) => {...t, skills: map(t.skills)}
  }

let skillsStep = (skills, input, dt) => {
  let skills = switch skills.carLike {
  | None => skills
  | Some(carLike) => {
      let movable = skills.movable->Option.getExn
      let transform = skills.transform->Option.getExn
      let (carLike, movable, transform) = CarLike.step((carLike, movable, transform), input, dt)
      {
        ...skills,
        movable: Some(movable),
        transform: Some(transform),
        carLike: Some(carLike),
      }
    }
  }
  let skills = switch skills.movable {
  | None => skills
  | Some(movable) => {
      let transform = skills.transform->Option.getExn
      let (movable, transform) = Movable.step((movable, transform), dt)
      {
        ...skills,
        movable: Some(movable),
        transform: Some(transform),
      }
    }
  }
  skills
}

let rec childStep = (child, input, dt) => child->step(input, dt)
and step = (t, input, dt) => {
  zOrder: t.zOrder,
  skills: skillsStep(t.skills, input, dt),
  children: t.children->Array.map(childStep(_, input, dt)),
}
