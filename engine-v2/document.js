/**
 * Parametric document and feature history foundation.
 * Geometry kernel adapters can be attached without coupling to the UI.
 */
import { extrudePolygon, Plane } from "./geometry.js";

const clone = value => structuredClone(value);

export class Feature {
  constructor(type, parameters = {}, label = type) {
    this.id = globalThis.crypto?.randomUUID?.() ?? `feature-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.type = type;
    this.label = label;
    this.parameters = clone(parameters);
    this.enabled = true;
    this.result = null;
    this.error = null;
  }
  toJSON() {
    return {id:this.id,type:this.type,label:this.label,parameters:clone(this.parameters),enabled:this.enabled};
  }
}

export class CadDocument {
  constructor(name = "Sin título") {
    this.id = globalThis.crypto?.randomUUID?.() ?? `document-${Date.now()}`;
    this.name = name;
    this.units = "mm";
    this.features = [];
    this.cursor = 0;
    this.revision = 0;
    this._undo = [];
    this._redo = [];
  }
  _checkpoint() {
    this._undo.push(this.toJSON());
    if(this._undo.length>100) this._undo.shift();
    this._redo.length=0;
  }
  addFeature(feature) {
    if(!(feature instanceof Feature)) throw new TypeError("Se esperaba una Feature");
    this._checkpoint();
    this.features.splice(this.cursor);
    this.features.push(feature);
    this.cursor=this.features.length;
    this.revision++;
    return feature;
  }
  rollback() {
    if(!this._undo.length) return false;
    this._redo.push(this.toJSON());
    this._restore(this._undo.pop());
    return true;
  }
  redo() {
    if(!this._redo.length) return false;
    this._undo.push(this.toJSON());
    this._restore(this._redo.pop());
    return true;
  }
  moveHistoryCursor(index) {
    if(!Number.isInteger(index)||index<0||index>this.features.length) throw new RangeError("Posición de historial inválida");
    this.cursor=index;
    this.revision++;
  }
  regenerate() {
    let body=null;
    for(let i=0;i<this.cursor;i++) {
      const f=this.features[i];
      f.result=null; f.error=null;
      if(!f.enabled) continue;
      try {
        if(f.type==="extrude") {
          f.result=extrudePolygon(f.parameters.profile,f.parameters.depth,planeFrom(f.parameters.plane));
          body=f.result;
        } else if(f.type==="import-mesh") {
          body=clone(f.parameters.mesh);
          f.result=body;
        } else {
          throw new Error(`Operación aún no implementada: ${f.type}`);
        }
      } catch(error) {
        f.error=error.message;
        throw new Error(`Falló "${f.label}": ${error.message}`);
      }
    }
    return body;
  }
  toJSON() {
    return {schema:"nocturne-cad-document",version:1,id:this.id,name:this.name,units:this.units,cursor:this.cursor,features:this.features.map(f=>f.toJSON())};
  }
  _restore(data) {
    this.id=data.id;this.name=data.name;this.units=data.units;this.cursor=data.cursor;
    this.features=data.features.map(x=>Object.assign(new Feature(x.type,x.parameters,x.label),{id:x.id,enabled:x.enabled}));
    this.revision++;
  }
  static fromJSON(data) {
    if(data?.schema!=="nocturne-cad-document"||data.version!==1) throw new TypeError("Formato de documento NOCTURNE no compatible");
    const doc=new CadDocument(data.name);
    doc._restore(data);
    doc._undo=[];doc._redo=[];
    return doc;
  }
}
function planeFrom(value) {
  if(value==="XZ") return Plane.XZ();
  if(value==="YZ") return Plane.YZ();
  return Plane.XY();
}
