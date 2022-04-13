export type ReplayReadyCallback =
  | (({ operations }: { operations: number }) => void)
  | (({ operations }: { operations: number }) => Promise<void>)
  | null;

export interface ReplayerArgs {
  onReady?: ReplayReadyCallback;
  timeout?: number;
}

export type ReplayFrame = (() => void) | (() => Promise<void>);

export class Replayer {
  frames: ReplayFrame[];

  isPaused: boolean;

  isReadyToPlay: boolean;

  onReady: ReplayReadyCallback;

  operations: number;

  player: AsyncGenerator<unknown, void, unknown> | null;

  timeout: number;

  constructor({ onReady = null, timeout = 0 }: ReplayerArgs) {
    this.frames = [];
    this.isPaused = false;
    this.isReadyToPlay = false;
    this.onReady = onReady;
    this.operations = 0;
    this.player = null;
    this.timeout = timeout;
  }

  ready() {
    this.player = this.playerGenerator();

    this.isReadyToPlay = true;

    return this;
  }

  async play() {
    if (this.player && !this.isPaused) {
      const data = await this.player.next();

      if (!data.done) {
        this.play();
      } else {
        if (typeof this.onReady === 'function') {
          this.onReady({ operations: this.operations });
        }
      }
    }
  }

  pause() {
    this.isPaused = true;

    return this;
  }

  unpause() {
    this.isPaused = false;

    return this;
  }

  reset() {
    this.frames = [];
    this.isPaused = false;
    this.isReadyToPlay = false;
    this.operations = 0;
    this.player = null;

    if (this.onReady) {
      this.onReady({ operations: this.operations });
    }

    return this;
  }

  add(frame: ReplayFrame) {
    if (!this.isReadyToPlay) {
      this.frames.push(frame);
    }

    return this;
  }

  async *playerGenerator() {
    for (let i = 0; i <= this.frames.length; i++) {
      yield new Promise((resolve) => {
        if (typeof this.frames[i] === 'function') {
          this.frames[i]();
          this.operations++;
        }
        setTimeout(() => resolve(i), this.timeout);
      });
    }
  }
}
