// need to expose speed coefficients according to what feels good

class Ball
{
  // pos = [xPos, yPos, zPos];
  // resolution = [canvas.width, canvas.height];
  // radius = canvas.width/ 75.;
  constructor(pos, radius, resolution, paddles)
  {
    this.pos = pos;
    this.vel = [Math.random() / 40., Math.random() / 50., 0.];
    console.log(this.vel);
    this.accl = [0., 0., 0.];
    this.radius = 2. * radius / resolution[0];
    this.paddles = paddles;

    this.restituionCoeff = 0.8;
    this.paddleBounceCoeff = 1.05;
  }
  update()
  {
    // horizontal bounds collision
    if(this.pos[0] > 1. - this.radius)
    {
      this.pos[0] = (1. - this.radius) - 0.01;
      this.vel[0] *= -this.restituionCoeff;
      this.pos[0] += this.vel[0];
      this.accl[0] = 0.;
      //console.log("ball hit right wall");
    }
    else if(this.pos[0] < -1. + this.radius)
    {
      this.pos[0] = (-1. + this.radius) + 0.01;
      this.vel[0] *= -this.restituionCoeff;
      this.pos[0] += this.vel[0];
      this.accl[0] = 0.;
      //console.log("ball hit left wall");
    }
    // vertical bounds collision
    else if(this.pos[1] > 1. - this.radius)
    {
      this.pos[1] = (1. - this.radius) - 0.01;
      this.vel[1] *= -this.restituionCoeff;
      this.pos[1] += this.vel[1];
      this.accl[1] = 0.;
      //console.log("ball hit top wall");
    }
    else if(this.pos[1] < -1. + this.radius)
    {
      this.pos[1] = (-1. + this.radius) + 0.01;
      this.vel[1] *= -this.restituionCoeff;
      this.pos[1] += this.vel[1];
      this.accl[1] = 0.;
      //console.log("ball hit bottom wall");
    }
    // paddle collision, paddle is index 0 in paddles array
    else if (Math.abs(this.pos[0] - this.paddles[0].pos[0]) < this.paddles[0].width / 2 + this.radius &&
             Math.abs(this.pos[1] - this.paddles[0].pos[1]) < this.paddles[0].height / 2 + this.radius
            )
    {
      // x axis collision resolution
      // coming from the right to the paddle
      if(this.vel[0] < 0)
      {
        this.pos[0] = this.paddles[0].pos[0] + this.paddles[0].width / 2 + this.radius + 0.005; // magic number is just some small number
        this.vel[0] *= -1.2;
        this.pos[0] += this.vel[0];
      }
      // coming from the left to paddle
      else if(this.vel[0] > 0)
      {
        this.pos[0] = this.paddles[0].pos[0] - this.paddles[0].width / 2 - this.radius - 0.005; // magic number is just some small number
        this.vel[0] *= -1.2;
        this.pos[0] += this.vel[0];
      }
      // y axis collision resolution
      // coming from the top to paddle
      else if(this.vel[1] < 0)
      {
        this.pos[1] = this.paddles[0].pos[1] + this.paddles[0].height / 2 + this.radius + 0.005; // magic number is just some small number
        this.vel[1] *= -1.2;
        this.pos[1] += this.vel[1];
      }
      // coming from the bottom to paddle
      else if(this.vel[1] > 0)
      {
        this.pos[1] = this.paddles[0].pos[1] - this.paddles[0].height / 2 - this.radius - 0.005; // magic number is just some small number
        this.vel[1] *= -1.2;
        this.pos[1] += this.vel[1];
      }
    }
    // steering paddle collision, steering paddle is index 1 in paddle array
    else if (Math.abs(this.pos[0] - this.paddles[1].pos[0]) < this.paddles[1].width / 2 + this.radius &&
             Math.abs(this.pos[1] - this.paddles[1].pos[1]) < this.paddles[1].height / 2 + this.radius
            )
    {
      // x axis collision resolution
      // coming from the right to the paddle
      if(this.vel[0] < 0)
      {
        this.pos[0] = this.paddles[1].pos[0] + this.paddles[1].width / 2 + this.radius + 0.005; // magic number is just some small number
        this.vel[0] *= -1.2;
        this.pos[0] += this.vel[0];
      }
      // coming from the left to paddle
      else if(this.vel[0] > 0)
      {
        this.pos[0] = this.paddles[1].pos[0] - this.paddles[1].width / 2 - this.radius - 0.005; // magic number is just some small number
        this.vel[0] *= -1.2;
        this.pos[0] += this.vel[0];
      }
      // y axis collision resolution
      // coming from the top to paddle
      else if(this.vel[1] < 0)
      {
        this.pos[1] = this.paddles[1].pos[1] + this.paddles[1].height / 2 + this.radius + 0.005; // magic number is just some small number
        this.vel[1] *= -1.2;
        this.pos[1] += this.vel[1];
      }
      // coming from the bottom to paddle
      else if(this.vel[1] > 0)
      {
        this.pos[1] = this.paddles[1].pos[1] - this.paddles[1].height / 2 - this.radius - 0.005; // magic number is just some small number
        this.vel[1] *= -1.2;
        this.pos[1] += this.vel[1];
      }
    }
    // euler update
    else
    {
      // y direction update
      this.vel[1] += this.accl[1];
      this.pos[1] += this.vel[1];
      this.accl[1] = 0.;
      // x direction update
      this.vel[0] += this.accl[0];
      this.pos[0] += this.vel[0];
      this.accl[0] = 0.;
    }
  }
}
