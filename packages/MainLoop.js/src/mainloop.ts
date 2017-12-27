export type BeginCallbackType = (timestamp: number, frameDelta: number) => void;
export type DrawCallbackType = (interpolationPercentage: number) => void;
export type UpdateCallbackType = (delta: number) => void;
export type EndCallbackType = (fps: number, panic: boolean) => void;


const NOOP = () => {};

const raf = (function() {
  let lastTimestamp = Date.now(),
    now: number,
    timeout: number;
  return function(callback: any) {
    now = Date.now();
    timeout = Math.max(0, 1000 / 60 - (now - lastTimestamp));
    lastTimestamp = now + timeout;
    return setTimeout(function() {
      callback(now + timeout);
    }, timeout);
  };
})()

const stopRaf = clearTimeout;


export default class MainLoop {
  private simulationTimestep: number = 1000 / 60;
  private frameDelta: number = 0;
  private lastFrameTimeMs: number = 0;
  private fps: number = 60;
  private fpsAlpha: number = 0.9;
  private fpsUpdateInterval: number = 1000;
  private lastFpsUpdate: number = 0;
  private framesSinceLastFpsUpdate: number = 0;
  private numUpdateSteps: number = 0;
  private minFrameDelay: number = 0;
  private running: boolean = false;
  private started: boolean = false;
  private panic: boolean = false;
  private begin: BeginCallbackType = NOOP;
  private update: UpdateCallbackType = NOOP;
  private draw: DrawCallbackType = NOOP;
  private end: EndCallbackType = NOOP;
  private rafHandle: number;


  constructor({update, draw, end} : {
    update: UpdateCallbackType,
    draw: DrawCallbackType,
    end: EndCallbackType
  }) {
    this.update = update;
    this.draw = draw;
    this.end = end;
  }

  public setMaxAllowedFPS(fps: number) {
    if (typeof fps === 'undefined') {
      this.fps = Infinity;
    }
    if (fps === 0) {
      this.stop();
    }
    else {
      this.minFrameDelay = 1000 / fps;
    }
    return this;
  }

  public getMaxAllowedFPS(): number {
    return 1000 / this.minFrameDelay;
  }

  public resetFrameDelta(): number {
    const oldFrameDelta = this.frameDelta;
    this.frameDelta = 0;
    return oldFrameDelta;
  }

  public start(): MainLoop {
    if (this.started) return this;
    this.started = true;
    this.rafHandle = raf((timestamp: number) => {
      this.draw(1);
      this.running = true;

      this.lastFrameTimeMs = timestamp;
      this.lastFpsUpdate = timestamp;
      this.framesSinceLastFpsUpdate = 0;
      this.rafHandle = raf(this.animate.bind(this));
    });
    return this;
  }

  public stop(): MainLoop {
    this.running = false;
    this.started = false;
    stopRaf(this.rafHandle);
    return this;
  }

  private animate(timestamp: number) {
    this.rafHandle = raf(this.animate.bind(this));
    if (timestamp < this.lastFrameTimeMs + this.minFrameDelay) {
      return;
    }

    this.frameDelta += timestamp - this.lastFrameTimeMs;
    this.lastFrameTimeMs = timestamp;

    this.begin(timestamp, this.frameDelta);

    if (timestamp > this.lastFpsUpdate + this.fpsUpdateInterval) {
      this.fps = this.fpsAlpha * this.framesSinceLastFpsUpdate * 1000 / (timestamp - this.lastFpsUpdate) +
        (1 - this.fpsAlpha) * this.fps;

      // Reset the frame counter and last-updated timestamp since their
      // latest values have now been incorporated into the FPS estimate.
      this.lastFpsUpdate = timestamp;
      this.framesSinceLastFpsUpdate = 0;
    }

    this.framesSinceLastFpsUpdate++;
    this.numUpdateSteps = 0;
    while (this.frameDelta >= this.simulationTimestep) {
      this.update(this.simulationTimestep);
      this.frameDelta -= this.simulationTimestep;
      if (++this.numUpdateSteps >= 240) {
        this.panic = true;
        break;
      }
    }

    this.draw(this.frameDelta / this.simulationTimestep);
    this.end(this.fps, this.panic);
    this.panic = false;
  }

}
