import test from "node:test";
import assert from "node:assert/strict";
import {importSTL} from "../stl.js";

const ascii=`solid tri
facet normal 0 0 1
outer loop
vertex 0 0 0
vertex 1 0 0
vertex 0 1 0
endloop
endfacet
endsolid tri`;
function binarySTL() {
 const b=new ArrayBuffer(134),v=new DataView(b);
 v.setUint32(80,1,true);
 let o=84;
 for(const n of [0,0,1, 0,0,0, 1,0,0, 0,1,0]) {v.setFloat32(o,n,true);o+=4;}
 v.setUint16(o,0,true);
 return b;
}
test("importa STL ASCII y conserva unidades como desconocidas",()=>{
 const m=importSTL(ascii);
 assert.equal(m.metadata.sourceFormat,"ascii");
 assert.equal(m.metadata.units,null);
 assert.equal(m.triangles.length,3);
});
test("importa STL binario estándar",()=>{
 const m=importSTL(binarySTL());
 assert.equal(m.metadata.sourceFormat,"binary");
 assert.equal(m.metadata.sourceTriangleCount,1);
 assert.equal(m.triangles.length,3);
});
test("rechaza STL binario truncado",()=>{
 const b=binarySTL().slice(0,100);
 assert.throws(()=>importSTL(b));
});
test("weld de vértices repetidos entre facetas",()=>{
 const m=importSTL(ascii.replace("endsolid tri","facet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 0 1 0\nvertex -1 0 0\nendloop\nendfacet\nendsolid tri"));
 assert.equal(m.vertices.length/3,4);
 assert.equal(m.triangles.length/3,2);
});
