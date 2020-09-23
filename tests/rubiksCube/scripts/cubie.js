"use strict";

class Cubie
{
  constructor(transform, x, y, z)
  {
    this.modelTransform = transform; // position in world space;
    this.x = x; // index i
    this.y = y; // index j
    this.z = z; // index k
  }
}
