let map = (promise, fn) =>
    Js.Promise.then_(v => v->fn->Js.Promise.resolve, promise);
let flatMap = (promise, fn) =>
    Js.Promise.then_(fn, promise);
let failMap = (promise, fn) =>
    Js.Promise.catch(v => v->fn->Js.Promise.resolve, promise);
