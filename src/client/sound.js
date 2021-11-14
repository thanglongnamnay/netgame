const Howler = require('howler');
const makeSound = n => {
  const sound = new Howler.Howl({
    src: [`resource/${n}.wav`]
  });
  return () => sound.play();
};
const loadSound = () => ({
  explode: makeSound('explosion'),
  shoot: makeSound('laser'),
  jump: makeSound('jump'),
});
module.exports.loadSound = loadSound;