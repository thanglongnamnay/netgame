const fTouch = require('./flat-models/touch');
const rTouch = require('./common/Touch.bs');
const fPayload = require('./flat-models/payload');
const rPayload = require('./common/Payload.bs');
const fFrames = require('./flat-models/frames');
const rFrames = require('./common/Frames.bs');

const payload = t => new fPayload.PayloadT(rTouch.isMouseDown(t.touch), rTouch.getPos(t.touch) || { x: 0, y: 0 })
const rpayload = payload => ({
  touch: payload.touch ? rTouch.down(payload.pos) : rTouch.up,
});

const frames = t => new fFrames.FramesT(t.end, t.payloads.map(payload));
const rframes = frames => ({
  end: frames.end,
  payloads: frames.payloads.map(rpayload),
});

exports.frames = frames;
exports.rframes = rframes;