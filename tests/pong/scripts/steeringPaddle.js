class SteeringPaddle
{
  // pos = array [xPos, yPos, zPos]
  // target = [posX, posY]
  constructor(pos, width, height, resolution)
  {
    this.pos = pos;
    this.vel = [0., 0., 0.];
    this.accl = [0., 0., 0.];

    this.width = 2. * width / resolution[0];
    this.height = 2. * height / resolution[1];

  }
  update(target)
  {
    if(this.pos[1] > 1. - this.height / 2.)
    {
      this.pos[1] = (1. - this.height / 2.) - 0.01;
      this.vel[1] *= -0.5;
      this.pos[1] += this.vel[1];
      this.accl[1] = 0.;
      //console.log("steering hit top wall");
    }
    else if(this.pos[1] < -1. + this.height / 2.)
    {
      this.pos[1] = (-1. + this.height / 2.) + 0.01;
      this.vel[1] *= -0.5;
      this.pos[1] += this.vel[1];
      this.accl[1] = 0.;
      //console.log("hit bottom wall");
    }
    else
    {
      let desired = 0.025 * (target[1] - this.pos[1]);
      let steering = desired - this.vel[1];

      this.accl[1] += steering;
      this.vel[1] += this.accl[1];
      this.pos[1] += this.vel[1];
      this.accl[1] = 0.;
    }
  }
}
