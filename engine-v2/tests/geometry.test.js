import test from "node:test";
import assert from "node:assert/strict";
import {validatePolygon,extrudePolygon,extrudeCircle,extrudeProfile,Plane,Vec3} from "../geometry.js";

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

test("extruye un círculo como cilindro poligonal cerrado",()=>{
 const m=extrudeCircle({x:0,y:0},5,12,Plane.XY(),32);
 assert.equal(m.vertices.length,32*2*3);
 assert.equal(m.triangles.length,32*12);
 assert.equal(m.metadata.radius,5);
});
test("despacha perfiles circulares y poligonales",()=>{
 const circle=extrudeProfile({kind:"circle",center:{x:0,y:0},radius:2},4);
 const polygon=extrudeProfile({kind:"polygon",points:[{x:0,y:0},{x:4,y:0},{x:4,y:4},{x:0,y:4}]},4);
 assert.equal(circle.metadata.operation,"extrude-circle");
 assert.equal(polygon.metadata.operation,"extrude");
});
test("rechaza resolución y profundidad circulares inválidas",()=>{
 assert.throws(()=>extrudeCircle({x:0,y:0},2,0));
 assert.throws(()=>extrudeCircle({x:0,y:0},2,4,Plane.XY(),4));
});
