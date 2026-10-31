import test from "node:test";
import assert from "node:assert/strict";
import {Sketch} from "../sketch.js";

test("crea rectángulo como cuatro líneas",()=>{
 const s=new Sketch();s.addRectangle({x:0,y:0},30,12);
 assert.equal(s.entities.length,4);
 assert.equal(s.entities.every(e=>e.type==="line"),true);
});
test("crea círculo y arco con parámetros válidos",()=>{
 const s=new Sketch();s.addCircle({x:5,y:5},4);s.addArc({x:0,y:0},10,0,Math.PI);
 assert.deepEqual(s.entities.map(e=>e.type),["circle","arc"]);
});
test("rechaza geometría degenerada",()=>{
 const s=new Sketch();
 assert.throws(()=>s.addLine({x:1,y:1},{x:1,y:1}));
 assert.throws(()=>s.addCircle({x:0,y:0},0));
});
test("valida restricciones horizontales y cotas",()=>{
 const s=new Sketch();const line=s.addLine({x:0,y:2},{x:8,y:2});
 s.addConstraint("horizontal",[line.id]);
 s.addConstraint("distance",[line.id],{value:8});
 s.addDimension("length",line.id,8);
 assert.equal(s.validate().valid,true);
});
test("detecta restricción incumplida",()=>{
 const s=new Sketch();const line=s.addLine({x:0,y:0},{x:5,y:5});
 s.addConstraint("horizontal",[line.id]);
 assert.equal(s.validate().valid,false);
});
test("serializa y restaura el boceto",()=>{
 const s=new Sketch("Prueba","XZ");s.addCircle({x:1,y:2},3);
 const restored=Sketch.fromJSON(s.toJSON());
 assert.equal(restored.plane,"XZ");assert.equal(restored.entities.length,1);
});

test("solver ajusta automáticamente horizontal y distancia",()=>{
 const s=new Sketch();const line=s.addLine({x:0,y:0},{x:3,y:4});
 s.addConstraint("horizontal",[line.id]);
 s.addConstraint("distance",[line.id],{value:10});
 const result=s.solve();
 assert.equal(result.converged,true);
 assert.ok(Math.abs(line.data.end.y-line.data.start.y)<1e-9);
 assert.ok(Math.abs(Math.hypot(line.data.end.x-line.data.start.x,line.data.end.y-line.data.start.y)-10)<1e-6);
});
test("solver ajusta radio y longitud igual",()=>{
 const s=new Sketch();
 const circle=s.addCircle({x:0,y:0},2);
 const arc=s.addArc({x:5,y:0},3,0,Math.PI);
 s.addConstraint("radius",[circle.id],{value:7});
 s.addConstraint("equal",[circle.id,arc.id]);
 const result=s.solve();
 assert.equal(result.converged,true);
 assert.equal(circle.data.radius,7);
 assert.equal(arc.data.radius,7);
});
test("solver une extremos coincidentes",()=>{
 const s=new Sketch();
 const a=s.addLine({x:0,y:0},{x:5,y:0});
 const b=s.addLine({x:5.2,y:0.1},{x:8,y:2});
 s.addConstraint("coincident",[a.id,b.id]);
 const result=s.solve();
 assert.equal(result.converged,true);
 const endpoints=e=>[e.data.start,e.data.end];
 assert.ok(endpoints(a).some(p=>endpoints(b).some(q=>Math.hypot(p.x-q.x,p.y-q.y)<1e-9)));
});

test("detecta perfil cerrado de cuatro líneas",()=>{
 const s=new Sketch();s.addRectangle({x:2,y:3},20,10);
 const profiles=s.getClosedProfiles();
 assert.equal(profiles.length,1);
 assert.equal(profiles[0].kind,"polygon");
 assert.equal(profiles[0].points.length,4);
});
test("detecta círculo como perfil cerrado analítico",()=>{
 const s=new Sketch();s.addCircle({x:4,y:6},5);
 const [profile]=s.getClosedProfiles();
 assert.equal(profile.kind,"circle");
 assert.equal(profile.radius,5);
});
test("rechaza contorno abierto",()=>{
 const s=new Sketch();s.addLine({x:0,y:0},{x:5,y:0});s.addLine({x:5,y:0},{x:5,y:5});
 assert.throws(()=>s.getClosedProfiles(),/abiertas/);
});
test("detecta dos regiones cerradas independientes",()=>{
 const s=new Sketch();s.addRectangle({x:0,y:0},4,4);s.addRectangle({x:10,y:10},3,3);
 assert.equal(s.getClosedProfiles().length,2);
});
