const fPos = require('./flat-models/pos');
const fPayload = require('./flat-models/payload');
const rPayload = require('./common/Payload.bs');
const fFrames = require('./flat-models/frames');
const rFrames = require('./common/Frames.bs');

const pos = t => new fPos.PosT(
  t.x,
  t.y,
);

const payload = t => new fPayload.PayloadT(
  t.keys,
  t.touches,
  pos(t.touchPos),
);
const rpayload = payload => payload;

const frames = t => new fFrames.FramesT(t.end, t.payloads.map(payload));
const rframes = frames => ({
  end: frames.end,
  payloads: frames.payloads.map(rpayload),
});

exports.frames = frames;
exports.rframes = rframes;