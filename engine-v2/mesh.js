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
  const vertices=[], remap=new Array(mesh.vertices.length/3), buckets=new Map();
  const key=(x,y,z)=>[x,y,z].map(v=>Math.round(v/tolerance)).join(":");
  for(let i=0;i<remap.length;i++){
    const x=mesh.vertices[i*3],y=mesh.vertices[i*3+1],z=mesh.vertices[i*3+2],k=key(x,y,z);
    let id=buckets.get(k);
    if(id===undefined){id=vertices.length/3;buckets.set(k,id);vertices.push(x,y,z);}
    remap[i]=id;
  }
  const triangles=[],seen=new Set();
  let removedDegenerate=0,removedDuplicate=0;
  for(let i=0;i<mesh.triangles.length;i+=3){
    const tri=mesh.triangles.slice(i,i+3).map(index=>remap[index]);
    if(new Set(tri).size!==3){removedDegenerate++;continue;}
    const a=tri[0],b=tri[1],c=tri[2];
    const ax=vertices[a*3],ay=vertices[a*3+1],az=vertices[a*3+2];
    const ux=vertices[b*3]-ax,uy=vertices[b*3+1]-ay,uz=vertices[b*3+2]-az;
    const vx=vertices[c*3]-ax,vy=vertices[c*3+1]-ay,vz=vertices[c*3+2]-az;
    const area=Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx);
    if(area<tolerance*tolerance){removedDegenerate++;continue;}
    const canonical=[...tri].sort((x,y)=>x-y).join(":");
    if(seen.has(canonical)){removedDuplicate++;continue;}
    seen.add(canonical);triangles.push(...tri);
  }
  const repaired={kind:"triangle-mesh",vertices,triangles,metadata:{...(mesh.metadata??{}),operation:"repair-mesh",repair:{weldedVertices:remap.length-vertices.length/3,removedDegenerate,removedDuplicate}}};
  return {mesh:repaired,report:{...inspectMeshTopology(repaired),...repaired.metadata.repair}};
}
