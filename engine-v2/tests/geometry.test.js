import test from "node:test";
import assert from "node:assert/strict";
import {validatePolygon,extrudePolygon,Plane,Vec3} from "../geometry.js";

test("valida perfil rectangular y calcula área",()=>{
 const p=validatePolygon([{x:0,y:0},{x:20,y:0},{x:20,y:10},{x:0,y:10}]);
 assert.equal(Math.abs(p.signedArea),200);
});
test("rechaza perfil autointersectado",()=>{
 assert.throws(()=>validatePolygon([{x:0,y:0},{x:10,y:10},{x:0,y:10},{x:10,y:0}]),/autointersecta|área/);
});
test("extruye rectángulo y genera malla",()=>{
 const m=extrudePolygon([{x:0,y:0},{x:20,y:0},{x:20,y:10},{x:0,y:10}],5);
 assert.equal(m.vertices.length,24);
 assert.equal(m.triangles.length,36);
});
test("planos XZ y YZ generan bases ortogonales",()=>{
 for(const p of [Plane.XZ(),Plane.YZ()]) assert.ok(Math.abs(p.xAxis.dot(p.yAxis))<1e-9);
 assert.equal(new Vec3(3,4,0).length(),5);
});
