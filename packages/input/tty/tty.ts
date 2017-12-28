export interface SizeType {
  width: number;
  height: number;
}

class TTYInput {
  private lastPress: string;

  constructor() {
    this.setup();
  }

  private setup() {
    process.stdin.resume();
    process.stdin.on('keypress', this.onKeypress.bind(this));
  }

  private onKeypress(char, key) {
  }

  public getSize(): SizeType {
    return {
      width: process.stdout.columns,
      height: process.stdout.rows
    };
  }

  public write(str: string) {
    process.stdout.write(str);
  }

  public goto(x: number, y: number): Input {
    process.stdout.write(`\033[${x};${y}f`);
    return this;
  }

  public clear() {
    process.stdout.write('\033[2J');
  }
};
