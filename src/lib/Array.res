let set = (array, index, map) =>
  array->Belt.Array.mapWithIndexU((. i, value) => i == index ? map(value) : value)
