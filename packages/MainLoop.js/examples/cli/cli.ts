import MainLoop from './../../dist/mainloop';

const getRotator = () => {
  const frames = ['|', '/', '--', '\\'];
  let i = 0;
  return (fps:number) => {
    console.log('\x1Bc');
    console.log(frames[i]);
    i++;
    if(i === frames.length) i = 0;
  };
};

const r = getRotator();

const ml = new MainLoop({
  draw: r,
  end: (fps:number) => {
    console.log(`fps: ${Math.round(fps)}`);
  }
});


const timeout = (fn: ()=> void, time = 5000) => new Promise(resolve => {
  setTimeout(() => {
    fn();
    resolve();
  }, time);
});

const fps = (f:number) => () => ml.setMaxAllowedFPS(f);

const scenario = async () => {
  ml.setMaxAllowedFPS(1);
  ml.start();
  await timeout(fps(5));
  await timeout(fps(10));
  await timeout(fps(15));
  await timeout(fps(20));
};



scenario();
