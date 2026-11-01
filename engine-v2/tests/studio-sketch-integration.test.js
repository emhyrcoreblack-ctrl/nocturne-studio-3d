import test from "node:test";
import assert from "node:assert/strict";
import {Sketch} from "../sketch.js";
import {Plane,extrudeProfile,inspectMeshTopology} from "../geometry.js";

const planes={XY:Plane.XY(),XZ:Plane.XZ(),YZ:Plane.YZ()};

for (const [planeName,plane] of Object.entries(planes)) {
  test(`flujo de interfaz: boceto rectangular y extrusión cerrada en ${planeName}`,()=>{
    const sketch=new Sketch("Boceto "+planeName,planeName);
    sketch.addRectangle({x:-20,y:-14},40,28);
    const validation=sketch.validate();
    assert.equal(validation.valid,true);
    const profiles=sketch.getClosedProfiles();
    assert.equal(profiles.length,1);
    const mesh=extrudeProfile(profiles[0],32,plane);
    const report=inspectMeshTopology(mesh);
    assert.equal(report.closed,true);
    assert.equal(report.boundaryEdges,0);
    assert.equal(report.nonManifoldEdges,0);
    assert.equal(report.inconsistentWindingEdges,0);
    assert.equal(report.orientation,"outward");
  });

  test(`flujo de interfaz: boceto circular y extrusión cerrada en ${planeName}`,()=>{
    const sketch=new Sketch("Boceto "+planeName,planeName);
    sketch.addCircle({x:0,y:0},20);
    assert.equal(sketch.validate().valid,true);
    const profiles=sketch.getClosedProfiles();
    assert.equal(profiles.length,1);
    assert.equal(profiles[0].kind,"circle");
    const mesh=extrudeProfile(profiles[0],32,plane);
    const report=inspectMeshTopology(mesh);
    assert.equal(report.closed,true);
    assert.equal(report.boundaryEdges,0);
    assert.equal(report.nonManifoldEdges,0);
    assert.equal(report.inconsistentWindingEdges,0);
    assert.equal(report.orientation,"outward");
  });
}

test("el flujo rechaza un boceto sin perfil cerrado",()=>{
  const sketch=new Sketch("Incompleto","XY");
  sketch.addLine({x:0,y:0},{x:10,y:0});
  assert.throws(()=>sketch.getClosedProfiles(),/perfil no está cerrado/);
});
