// #---------- UTILITY FUNCTIONS ------------#

function sphereAlgebraic(ro, rd, spherePos, radius)
{
  let a = 1.;
  let ro2Sphere = vec3.create();
  vec3.subtract(ro2Sphere, ro, spherePos);
  let b = vec3.dot(ro2Sphere, rd);
  let ro2sphereLen = vec3.length(ro2Sphere);
  let c = ro2sphereLen * ro2sphereLen - radius * radius;

  let intersectDistance; // hard coding for the shorter of the distances
  let discriminant;

  // complex solutions --> no intersection
  if(b * b - c > 0.0)
  {
      discriminant = Math.sqrt(b * b - c);
      intersectDistance = -b - discriminant;
  }
  else
  {
    intersectDistance = null;
  }
  return intersectDistance;
}

function wait(gen)
{
    var g = gen();
    function next()
    {
      var cur = g.next();
      if (cur.done)
      {
        isAnimating = !cur.done;
        //console.log(isAnimating);
        return cur.value;
      }
      cur.value(next);
    }
    next();
}

function delay(time)
{
  return function(f)
  {
    setTimeout(f, time);
  }
}
