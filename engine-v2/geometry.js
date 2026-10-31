/**
 * NOCTURNE geometry foundation.
 * Coordinates are millimetres. UI-independent and dependency-free.
 */

export const EPSILON = 1e-8;

export class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    for (const n of [x, y, z]) if (!Number.isFinite(n)) throw new TypeError("Coordenada no finita");
    this.x = x; this.y = y; this.z = z;
  }
  add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
  scale(k) { return new Vec3(this.x * k, this.y * k, this.z * k); }
  dot(v) { return this.x*v.x + this.y*v.y + this.z*v.z; }
  cross(v) { return new Vec3(this.y*v.z-this.z*v.y, this.z*v.x-this.x*v.z, this.x*v.y-this.y*v.x); }
  length() { return Math.hypot(this.x, this.y, this.z); }
  normalized() {
    const n = this.length();
    if (n < EPSILON) throw new RangeError("No se puede normalizar un vector nulo");
    return this.scale(1/n);
  }
  toJSON() { return [this.x, this.y, this.z]; }
}

export class Plane {
  constructor(origin = new Vec3(), normal = new Vec3(0,0,1), xAxis = new Vec3(1,0,0)) {
    this.origin = origin;
    this.normal = normal.normalized();
    const projected = xAxis.sub(this.normal.scale(xAxis.dot(this.normal)));
    this.xAxis = projected.normalized();
    this.yAxis = this.normal.cross(this.xAxis).normalized();
  }
  toWorld(p) { return this.origin.add(this.xAxis.scale(p.x)).add(this.yAxis.scale(p.y)); }
  toLocal(p) {
    const d = p.sub(this.origin);
    return { x: d.dot(this.xAxis), y: d.dot(this.yAxis) };
  }
  static XY() { return new Plane(); }
  static XZ() { return new Plane(new Vec3(), new Vec3(0,-1,0), new Vec3(1,0,0)); }
  static YZ() { return new Plane(new Vec3(), new Vec3(1,0,0), new Vec3(0,1,0)); }
}

export function validatePolygon(points) {
  if (!Array.isArray(points) || points.length < 3) throw new RangeError("Un perfil necesita al menos tres puntos");
  const pts = points.map(p => ({x:Number(p.x), y:Number(p.y)}));
  if (pts.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new TypeError("El perfil contiene coordenadas no válidas");
  const clean = pts.filter((p,i) => i === 0 || Math.hypot(p.x-pts[i-1].x,p.y-pts[i-1].y) > EPSILON);
  if (clean.length > 2 && Math.hypot(clean[0].x-clean.at(-1).x,clean[0].y-clean.at(-1).y) < EPSILON) clean.pop();
  if (clean.length < 3) throw new RangeError("El perfil degenera en menos de tres vértices");
  let twiceArea = 0;
  for (let i=0;i<clean.length;i++) {
    const a=clean[i], b=clean[(i+1)%clean.length];
    twiceArea += a.x*b.y-b.x*a.y;
  }
  if (Math.abs(twiceArea) < EPSILON) throw new RangeError("El área del perfil es cero");
  // Comprobar cruces entre aristas no adyacentes.
  const orient=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const intersects=(a,b,c,d)=>{
    const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);
    return o1*o2 < -EPSILON && o3*o4 < -EPSILON;
  };
  for(let i=0;i<clean.length;i++) for(let j=i+1;j<clean.length;j++) {
    const i2=(i+1)%clean.length, j2=(j+1)%clean.length;
    if(i===j || i2===j || j2===i) continue;
    if(intersects(clean[i],clean[i2],clean[j],clean[j2])) throw new RangeError("El perfil se autointersecta");
  }
  return {points:clean, signedArea:twiceArea/2, clockwise:twiceArea<0};
}

export function extrudePolygon(points, depth, plane = Plane.XY()) {
  if (!Number.isFinite(depth) || Math.abs(depth) < EPSILON) throw new RangeError("La profundidad debe ser distinta de cero");
  const profile = validatePolygon(points);
  const p = profile.points;
  // Orientar la tapa inferior de forma coherente.
  const order = profile.clockwise ? [...p.keys()] : [...p.keys()].reverse();
  const vertices = [];
  const add = v => vertices.push(v.x,v.y,v.z);
  for (const q of p) add(plane.toWorld({x:q.x,y:q.y}));
  for (const q of p) add(plane.toWorld({x:q.x,y:q.y}).add(plane.normal.scale(depth)));
  const triangles = [];
  const n=p.length;
  // Triangulación en abanico: válida para perfiles convexos; perfiles cóncavos se rechazan en esta primera versión.
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) for(let k=j+1;k<n;k++) {
    // No se usa esta búsqueda como triangulador; el abanico se valida a continuación.
  }
  const convex = p.every((_,i)=> {
    const a=p[i],b=p[(i+1)%n],c=p[(i+2)%n];
    return cross(a,b,c) * (profile.clockwise?-1:1) >= -EPSILON;
  });
  if(!convex) throw new RangeError("Este primer extrusor admite perfiles convexos simples; triangulación cóncava pendiente");
  for(let i=1;i<n-1;i++) {
    triangles.push(...(profile.clockwise?[0,i,i+1]:[0,i+1,i]));
    triangles.push(...(profile.clockwise?[n,n+i+1,n+i]:[n,n+i,n+i+1]));
  }
  for(let i=0;i<n;i++) {
    const j=(i+1)%n;
    triangles.push(i,j,n+j, i,n+j,n+i);
  }
  return {
    kind:"triangle-mesh", vertices, triangles,
    metadata:{operation:"extrude",depth,profileVertexCount:n,units:"mm",plane:{origin:plane.origin.toJSON(),normal:plane.normal.toJSON()}}
  };
}
