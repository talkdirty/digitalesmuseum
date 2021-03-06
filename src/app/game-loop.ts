export class GameLoop {
  private lastTime: number;
  private callback;

  constructor(){
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    this.callback = function(){};
  }

  start(callback){
    this.callback = callback;
    return requestAnimationFrame(this.frame);
  }

  frame(time: number){
    let seconds = (time - this.lastTime) / 1000;
    this.lastTime = time;
    if (seconds < 0.2) this.callback(seconds);
    requestAnimationFrame(this.frame);
  }
}
