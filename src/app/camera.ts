export class Camera {
  private ctx;
  private width;
  private height;
  private spacing;
  private range;
  private lightRange;
  private scale;

  private previousLValue:number;

  constructor(private canvas: any, private resolution: number, private focalLength: number){
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = window.innerWidth * 0.5;
    this.height = canvas.height = window.innerHeight * 0.5;
    this.spacing = this.width / resolution;
    this.focalLength = focalLength || 0.8;
    this.range = 14; //todo mobile
    this.lightRange = 10;
    this.scale = (this.width + this.height) / 1200;
  }

  render(player, map, gameData){
    this.drawSky(player.direction, map.skybox, map.light);
    this.drawColumns(player, map, gameData);
    this.gameDataIdx = 0;
    this.drawWeapon(player.weapon, player.paces);
  }

  drawWeapon(weapon, paces){
    let bobX = Math.cos(paces * 2) * this.scale * 6;
    let bobY = Math.sin(paces * 4) * this.scale * 6;
    let left = this.width * 0.66 + bobX;
    let top = this.height * 0.6 + bobY;
    this.ctx.drawImage(weapon.image, left, top, weapon.width * this.scale, weapon.height * this.scale);
  }

  drawSky(direction, sky, ambient){
    let width = sky.width *  (this.height / sky.height) * 2;
    let left = (direction / (Math.PI*2)) * -width;
    this.ctx.save();
    this.ctx.drawImage(sky.image, left, 0, width, this.height);
    if (left < width - this.width){
      this.ctx.drawImage(sky.image, left + width, 0, width, this.height);
    }
    if (ambient > 0){
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = ambient * 0.1;
      this.ctx.fillRect(0, this.height*0.5, this.width, this.height * 0.5);
    }
    this.ctx.restore();
  }

  drawColumns(player, map, gameData){
    this.ctx.save();
    for (let column = 0; column < this.resolution; column++){
      let x = column / this.resolution - 0.5;
      let angle = Math.atan2(x, this.focalLength);
      let ray = map.cast(player, player.direction + angle, this.range);

      this.drawColumn(column,ray,angle,map, gameData);
    }
    this.ctx.restore();
  }
  private gameDataIdx = 0;
  private cls=0;
  drawColumn(column, ray, angle, map, gameData){
    let ctx = this.ctx;
    let texture = map.wallTexture;
    let left = Math.floor(column * this.spacing);
    let width = Math.ceil(this.spacing);
    let hit = -1;

    while (++hit < ray.length && ray[hit].height <= 0);


    for ( let s = ray.length -1; s >= 0; s--){
      let step = ray[s];
      this.cls++;

      if (s === hit){
        let wall = this.project(step.height, angle, step.distance);

        let targetIdx = map.get(step.x, step.y).idx;

        if (targetIdx >= 0){
        ctx.globalAlpha = 1;
        //ctx.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
        //ctx.drawImage(map.frameTexture.image, textureX, 0, 1, texture.height, left, wall.top,width, wall.height);
        let X = gameData[targetIdx].bitmap;
        let XPWdt = parseInt(X.width)
         ,  XPHgt = parseInt(X.height);
        let textureX = Math.floor(XPWdt * step.offset);
        let XRegionPicture = Math.floor(XPWdt * step.offset);
        ctx.drawImage(gameData[targetIdx].bitmap.image, textureX, 0, 1,
          XPHgt, left, wall.top,width, wall.height);
        }
          /*this.previousLValue = XRegionPicture;
          if (this.gameDataIdx == gameData.length){
            this.gameDataIdx = 0;
          }*/
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
        ctx.fillRect(left, wall.top, width, wall.height);
      }
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.15;
    }

  }

  project(height, angle, distance){
    let z = distance * Math.cos(angle);
    let wallHeight = this.height * height / z;
    let bottom = this.height / 2 * (1 + 1/z);
    return {
      top: bottom - wallHeight,
      height: wallHeight
    }

  }
}
