import { inspectMeshTopology } from "./geometry.js";

export function validateTriangleMesh(mesh) {
  if(!mesh || mesh.kind!=="triangle-mesh" || !Array.isArray(mesh.vertices) || !Array.isArray(mesh.triangles))
    throw new TypeError("Se esperaba una malla triangular");
  if(mesh.vertices.length%3!==0 || mesh.triangles.length%3!==0)
    throw new RangeError("La malla contiene datos incompletos");
  if(mesh.vertices.some(value=>!Number.isFinite(value)))
    throw new RangeError("La malla contiene coordenadas no finitas");
  const count=mesh.vertices.length/3;
  if(mesh.triangles.some(index=>!Number.isInteger(index)||index<0||index>=count))
    throw new RangeError("La malla contiene índices fuera de rango");
  return inspectMeshTopology(mesh);
}

export function repairTriangleMesh(mesh,{tolerance=1e-7}={}) {
  if(!Number.isFinite(tolerance)||tolerance<=0) throw new RangeError("La tolerancia debe ser positiva");
  validateTriangleMesh(mesh);
  const sourceCount=mesh.vertices.length/3, vertices=[], remap=new Array(sourceCount), buckets=new Map();
  const cell=v=>Math.floor(v/tolerance);
  for(let i=0;i<sourceCount;i++) {
    const p=[mesh.vertices[i*3],mesh.vertices[i*3+1],mesh.vertices[i*3+2]];
    const base=p.map(cell); let found=-1;
    for(let dx=-1;dx<=1&&found<0;dx++) for(let dy=-1;dy<=1&&found<0;dy++) for(let dz=-1;dz<=1&&found<0;dz++) {
      const ids=buckets.get(`${base[0]+dx}:${base[1]+dy}:${base[2]+dz}`);
      if(!ids) continue;
      for(const id of ids) {
        const q=vertices.slice(id*3,id*3+3);
        if(Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])<=tolerance){found=id;break;}
      }
    }
    if(found<0) {
      found=vertices.length/3;vertices.push(...p);
      const k=base.join(":");if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(found);
    }
    remap[i]=found;
  }
  const triangles=[],seen=new Map();
  let removedDegenerate=0,removedDuplicate=0,opposedDuplicates=0;
  for(let i=0;i<mesh.triangles.length;i+=3) {
    const tri=mesh.triangles.slice(i,i+3).map(index=>remap[index]);
    if(new Set(tri).size!==3){removedDegenerate++;continue;}
    const [a,b,c]=tri, ax=vertices[a*3],ay=vertices[a*3+1],az=vertices[a*3+2];
    const ux=vertices[b*3]-ax,uy=vertices[b*3+1]-ay,uz=vertices[b*3+2]-az;
    const vx=vertices[c*3]-ax,vy=vertices[c*3+1]-ay,vz=vertices[c*3+2]-az;
    if(Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)<=tolerance*tolerance){removedDegenerate++;continue;}
    const key=[...tri].sort((x,y)=>x-y).join(":");
    const prior=seen.get(key);
    if(prior) {
      const same=prior[0]===a&&prior[1]===b&&prior[2]===c || prior[0]===b&&prior[1]===c&&prior[2]===a || prior[0]===c&&prior[1]===a&&prior[2]===b;
      if(same) removedDuplicate++; else opposedDuplicates++;
      continue;
    }
    seen.set(key,tri);triangles.push(...tri);
  }
  // Compacta los vértices que quedaron sin referencias.
  const used=[...new Set(triangles)], compactMap=new Map(), compactVertices=[];
  for(const old of used){compactMap.set(old,compactVertices.length/3);compactVertices.push(...vertices.slice(old*3,old*3+3));}
  const compactTriangles=triangles.map(index=>compactMap.get(index));
  const repaired={kind:"triangle-mesh",vertices:compactVertices,triangles:compactTriangles,metadata:{...(mesh.metadata??{}),operation:"repair-mesh",repair:{weldedVertices:sourceCount-vertices.length/3,removedDegenerate,removedDuplicate,opposedDuplicates,compactedVertices:vertices.length/3-compactVertices.length/3}}};
  return {mesh:repaired,report:{...inspectMeshTopology(repaired),...repaired.metadata.repair}};
}
