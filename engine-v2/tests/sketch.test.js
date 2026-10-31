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
