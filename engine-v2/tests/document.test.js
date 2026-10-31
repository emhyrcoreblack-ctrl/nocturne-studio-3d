import test from "node:test";
import assert from "node:assert/strict";
import {CadDocument,Feature} from "../document.js";

test("regenera una característica de extrusión circular desde un perfil",()=>{
 const doc=new CadDocument("Cilindro");
 doc.addFeature(new Feature("extrude",{profile:{kind:"circle",plane:"XY",center:{x:0,y:0},radius:6},depth:15}));
 const body=doc.regenerate();
 assert.equal(body.kind,"triangle-mesh");
 assert.equal(body.metadata.operation,"extrude-circle");
 assert.equal(body.metadata.depth,15);
});
test("serializa y restaura el árbol de características",()=>{
 const doc=new CadDocument("Pieza");
 doc.addFeature(new Feature("extrude",{profile:{kind:"polygon",points:[{x:0,y:0},{x:3,y:0},{x:3,y:3},{x:0,y:3}]},depth:2}));
 const restored=CadDocument.fromJSON(doc.toJSON());
 assert.equal(restored.features.length,1);
 assert.equal(restored.regenerate().metadata.depth,2);
});
