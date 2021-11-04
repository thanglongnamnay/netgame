const Input = () => {
  let curTouch = 0;
  let curPos = { x: 0, y: 0 };
  const currentKeys = new Set();
  function keydown(e) {
    currentKeys.add(e);
  }
  function keyup(e) {
    currentKeys.delete(e);
  }
  function touchdown(e) {
    console.log("Input.touchdown", e);
    curTouch = 1;
    curPos.x = e.x | 0;
    curPos.y = e.y | 0;
  }
  function touchup() {
    curTouch = 0;
    curPos = { x: 0, y: 0 };
  }
  function reset() {
    curTouch = 0;
    curPos = { x: 0, y: 0 };
    currentKeys.clear();
  }
  const getCurrentInput = () => {
    const keys = Array.from(currentKeys.values());
    return {
      touches: curTouch,
      touchPos: curTouch ? curPos : { x: 0, y: 0 },
      keys,
    }
  }

  return {
    reset,
    keydown,
    keyup,
    touchdown,
    touchup,
    getCurrentInput,
  }
};
Input.toKeyCode = e => {
  switch (e.code) {
    case "KeyS":
    case "ArrowDown":
      return 's'.charCodeAt(0);
    case "KeyW":
    case "ArrowUp":
      return 'w'.charCodeAt(0);
    case "KeyA":
    case "ArrowLeft":
      return 'a'.charCodeAt(0);
    case "KeyD":
    case "ArrowRight":
      return 'd'.charCodeAt(0);
  }
}

module.exports.Input = Input;