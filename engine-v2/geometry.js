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
  // Ear clipping: triangulación de polígonos simples, convexos o cóncavos.
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const orientation=profile.clockwise?-1:1;
  const remaining=[...p.keys()];
  const cap=[];
  const inTriangle=(q,a,b,c)=>{
    const c1=cross(a,b,q)*orientation,c2=cross(b,c,q)*orientation,c3=cross(c,a,q)*orientation;
    return c1>=-EPSILON&&c2>=-EPSILON&&c3>=-EPSILON;
  };
  let guard=0;
  while(remaining.length>3 && guard++<n*n){
    let clipped=false;
    for(let k=0;k<remaining.length;k++){
      const ia=remaining[(k+remaining.length-1)%remaining.length];
      const ib=remaining[k];
      const ic=remaining[(k+1)%remaining.length];
      const a=p[ia],b=p[ib],c=p[ic];
      if(cross(a,b,c)*orientation<=EPSILON) continue;
      let contains=false;
      for(const idx of remaining){
        if(idx===ia||idx===ib||idx===ic) continue;
        if(inTriangle(p[idx],a,b,c)){contains=true;break;}
      }
      if(contains) continue;
      cap.push([ia,ib,ic]);
      remaining.splice(k,1);
      clipped=true;
      break;
    }
    if(!clipped) throw new RangeError("No se pudo triangular el perfil; revisa vértices colineales o contorno degenerado");
  }
  if(remaining.length!==3||Math.abs(cross(p[remaining[0]],p[remaining[1]],p[remaining[2]]))<EPSILON)
    throw new RangeError("La triangulación produjo una cara degenerada");
  cap.push([...remaining]);
  for(const tri of cap){
    const [a,b,c]=tri;
    if(profile.clockwise){
      triangles.push(a,b,c,n+c,n+b,n+a);
    } else {
      triangles.push(a,c,b,n+b,n+c,n+a);
    }
  }
  for(let i=0;i<n;i++) {
    const j=(i+1)%n;
    if(profile.clockwise) triangles.push(i,n+j,j, i,n+i,n+j);
    else triangles.push(i,j,n+j, i,n+j,n+i);
  }
  if(depth<0) for(let i=0;i<triangles.length;i+=3) [triangles[i+1],triangles[i+2]]=[triangles[i+2],triangles[i+1]];
  return {
    kind:"triangle-mesh", vertices, triangles,
    metadata:{operation:"extrude",depth,profileVertexCount:n,units:"mm",plane:{origin:plane.origin.toJSON(),normal:plane.normal.toJSON()}}
  };
}

/** Extrude a circular sketch region into a closed triangle mesh. */
export function extrudeCircle(center, radius, depth, plane = Plane.XY(), segments = 64) {
  if (!Number.isFinite(depth) || Math.abs(depth) < EPSILON) throw new RangeError("La profundidad debe ser distinta de cero");
  if (!Number.isFinite(radius) || radius <= EPSILON) throw new RangeError("El radio debe ser positivo");
  if (!Number.isInteger(segments) || segments < 8 || segments > 512) throw new RangeError("La resolución del círculo debe estar entre 8 y 512 segmentos");
  const c={x:Number(center.x),y:Number(center.y)};
  if(!Number.isFinite(c.x)||!Number.isFinite(c.y))throw new TypeError("Centro del círculo no válido");
  const vertices=[];
  const push=v=>vertices.push(v.x,v.y,v.z);
  for(let i=0;i<segments;i++){
    const a=2*Math.PI*i/segments;
    push(plane.toWorld({x:c.x+radius*Math.cos(a),y:c.y+radius*Math.sin(a)}));
  }
  for(let i=0;i<segments;i++){
    const a=2*Math.PI*i/segments;
    push(plane.toWorld({x:c.x+radius*Math.cos(a),y:c.y+radius*Math.sin(a)}).add(plane.normal.scale(depth)));
  }
  const triangles=[];
  for(let i=1;i<segments-1;i++){
    triangles.push(0,i+1,i);
    triangles.push(segments,segments+i,segments+i+1);
  }
  for(let i=0;i<segments;i++){
    const j=(i+1)%segments;
    triangles.push(i,j,segments+j,i,segments+j,segments+i);
  }
  if(depth<0) for(let i=0;i<triangles.length;i+=3) [triangles[i+1],triangles[i+2]]=[triangles[i+2],triangles[i+1]];
  return {kind:"triangle-mesh",vertices,triangles,metadata:{operation:"extrude-circle",depth,radius,segments,units:"mm",plane:{origin:plane.origin.toJSON(),normal:plane.normal.toJSON()}}};
}

/** Dispatch an extracted sketch profile to its matching extrusion routine. */
export function extrudeProfile(profile, depth, plane = Plane.XY(), options = {}) {
  if(profile?.kind==="polygon") return extrudePolygon(profile.points,depth,plane);
  if(profile?.kind==="circle") return extrudeCircle(profile.center,profile.radius,depth,plane,options.segments??64);
  throw new TypeError("Tipo de perfil no compatible para extrusión");
}


/** Count undirected triangle-mesh edges; a closed 2-manifold has count 2 for every edge. */
export function inspectMeshTopology(mesh) {
  if(mesh?.kind!=="triangle-mesh" || !Array.isArray(mesh.vertices) || !Array.isArray(mesh.triangles))
    throw new TypeError("Se esperaba una malla triangular");
  if(mesh.vertices.length%3!==0 || mesh.triangles.length%3!==0)
    throw new RangeError("Datos de malla incompletos");
  const vertexCount=mesh.vertices.length/3;
  const edges=new Map();
  let degenerateTriangles=0;
  let signedVolume=0;
  for(let i=0;i<mesh.triangles.length;i+=3) {
    const tri=mesh.triangles.slice(i,i+3);
    if(tri.some(index=>!Number.isInteger(index)||index<0||index>=vertexCount))
      throw new RangeError("Índice de vértice fuera de rango");
    if(new Set(tri).size!==3) degenerateTriangles++;
    const point=index=>new Vec3(mesh.vertices[index*3],mesh.vertices[index*3+1],mesh.vertices[index*3+2]);
    if(new Set(tri).size===3){
      const a=point(tri[0]),b=point(tri[1]),c=point(tri[2]);
      const area=b.sub(a).cross(c.sub(a)).length();
      if(!Number.isFinite(area)||area<EPSILON) degenerateTriangles++;
      signedVolume+=a.dot(b.cross(c))/6;
    }
    for(let j=0;j<3;j++) {
      const a=tri[j],b=tri[(j+1)%3],lo=Math.min(a,b),hi=Math.max(a,b),key=lo+":"+hi;
      const entry=edges.get(key)??{count:0,forward:0,backward:0};
      entry.count++;
      if(a===lo) entry.forward++; else entry.backward++;
      edges.set(key,entry);
    }
  }
  const boundaryEdges=[...edges.values()].filter(edge=>edge.count===1).length;
  const nonManifoldEdges=[...edges.values()].filter(edge=>edge.count!==2).length;
  const inconsistentWindingEdges=[...edges.values()].filter(edge=>edge.count===2&&(edge.forward!==1||edge.backward!==1)).length;
  const closed=boundaryEdges===0&&nonManifoldEdges===0&&degenerateTriangles===0&&inconsistentWindingEdges===0;
  return {vertexCount,triangleCount:mesh.triangles.length/3,edgeCount:edges.size,boundaryEdges,nonManifoldEdges,degenerateTriangles,inconsistentWindingEdges,signedVolume,orientation:Math.abs(signedVolume)<EPSILON?"indeterminate":signedVolume>0?"outward":"inward",closed};
}
