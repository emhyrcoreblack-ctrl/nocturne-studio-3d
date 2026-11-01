import test from "node:test";
import assert from "node:assert/strict";
import {validateTriangleMesh,repairTriangleMesh} from "../mesh.js";

test("valida estructura y coordenadas de malla triangular",()=>{
 const mesh={kind:"triangle-mesh",vertices:[0,0,0,1,0,0,0,1,0],triangles:[0,1,2]};
 assert.equal(validateTriangleMesh(mesh).triangleCount,1);
 assert.throws(()=>validateTriangleMesh({...mesh,triangles:[0,1,8]}),/índices/);
 assert.throws(()=>validateTriangleMesh({...mesh,vertices:[0,NaN,0]}),/no finitas/);
});
test("une vértices coincidentes y elimina triángulos degenerados duplicados",()=>{
 const mesh={kind:"triangle-mesh",vertices:[0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0],triangles:[0,1,2,3,4,5,0,3,1]};
 const result=repairTriangleMesh(mesh);
 assert.equal(result.report.weldedVertices,3);
 assert.equal(result.report.removedDuplicate,1);
 assert.equal(result.report.triangleCount,1);
});
test("rechaza tolerancia inválida",()=>{
 const mesh={kind:"triangle-mesh",vertices:[0,0,0,1,0,0,0,1,0],triangles:[0,1,2]};
 assert.throws(()=>repairTriangleMesh(mesh,{tolerance:0}),/positiva/);
});

test("une vértices próximos aunque estén en celdas espaciales vecinas",()=>{
 const mesh={kind:"triangle-mesh",vertices:[0.99,0,0,2,0,0,0,1,0,1.01,0,0],triangles:[0,1,2]};
 const r=repairTriangleMesh(mesh,{tolerance:0.05});
 assert.equal(r.report.weldedVertices,1);
 assert.equal(r.report.triangleCount,0);
 assert.equal(r.report.removedDegenerate,1);
});
test("informa por separado las caras duplicadas con orientación opuesta",()=>{
 const mesh={kind:"triangle-mesh",vertices:[0,0,0,1,0,0,0,1,0],triangles:[0,1,2,0,2,1]};
 const r=repairTriangleMesh(mesh);
 assert.equal(r.report.opposedDuplicates,1);
 assert.equal(r.report.removedDuplicate,0);
});
test("compacta vértices sin uso tras eliminar caras degeneradas",()=>{
 const mesh={kind:"triangle-mesh",vertices:[0,0,0,1,0,0,0,1,0,9,9,9],triangles:[0,1,2]};
 const r=repairTriangleMesh(mesh);
 assert.equal(r.mesh.vertices.length/3,3);
 assert.equal(r.report.compactedVertices,1);
});
