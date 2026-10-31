/**
 * 2D sketch model. Coordinates and dimensions are millimetres.
 * This module stores editable sketch geometry independently of any viewport.
 * Constraint solving is intentionally incremental: supported constraints are
 * validated and simple geometric constraints can be applied deterministically.
 */
const EPS=1e-8;
const finite=(v,name)=>{if(!Number.isFinite(v))throw new TypeError(name+" debe ser un número finito");return v;};
const point=(p)=>({x:finite(Number(p.x),"x"),y:finite(Number(p.y),"y")});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

export class SketchEntity {
  constructor(type,data) {
    this.id=data.id ?? `sketch-entity-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)}`;
    this.type=type;
    this.data=structuredClone(data);
  }
  toJSON(){return {id:this.id,type:this.type,data:structuredClone(this.data)};}
}

export class Sketch {
  constructor(name="Boceto",plane="XY") {
    if(!["XY","XZ","YZ"].includes(plane))throw new RangeError("Plano de boceto no válido");
    this.name=name;this.plane=plane;this.entities=[];this.constraints=[];this.dimensions=[];
  }
  _add(type,data){const e=new SketchEntity(type,data);this.entities.push(e);return e;}
  addLine(start,end){
    const a=point(start),b=point(end);
    if(dist(a,b)<EPS)throw new RangeError("Una línea necesita dos puntos distintos");
    return this._add("line",{start:a,end:b});
  }
  addRectangle(origin,width,height){
    const p=point(origin);finite(width,"ancho");finite(height,"alto");
    if(Math.abs(width)<EPS||Math.abs(height)<EPS)throw new RangeError("El rectángulo debe tener ancho y alto distintos de cero");
    const x=p.x+width,y=p.y+height;
    const corners=[p,{x,y:p.y},{x,y},{x:p.x,y}];
    const edges=corners.map((c,i)=>this.addLine(c,corners[(i+1)%4]));
    return {type:"rectangle",edges};
  }
  addCircle(center,radius){
    const c=point(center);finite(radius,"radio");
    if(radius<=EPS)throw new RangeError("El radio debe ser positivo");
    return this._add("circle",{center:c,radius});
  }
  addArc(center,radius,startAngle,endAngle,clockwise=false){
    const c=point(center);finite(radius,"radio");finite(startAngle,"ángulo inicial");finite(endAngle,"ángulo final");
    if(radius<=EPS)throw new RangeError("El radio debe ser positivo");
    if(Math.abs(endAngle-startAngle)<EPS)throw new RangeError("El arco debe tener una amplitud distinta de cero");
    return this._add("arc",{center:c,radius,startAngle,endAngle,clockwise:Boolean(clockwise)});
  }
  addConstraint(type,entityIds,parameters={}){
    const supported=["horizontal","vertical","coincident","distance","radius","equal"];
    if(!supported.includes(type))throw new RangeError("Restricción no soportada: "+type);
    const ids=[...entityIds];
    if(ids.length!==(type==="coincident"||type==="equal"?2:1))throw new RangeError("Número incorrecto de entidades para la restricción");
    for(const id of ids)if(!this.entities.some(e=>e.id===id))throw new RangeError("La entidad de la restricción no existe");
    if(type==="distance"||type==="radius"){
      finite(parameters.value,"valor");
      if(parameters.value<=0)throw new RangeError("La cota debe ser positiva");
    }
    const c={id:`constraint-${this.constraints.length+1}`,type,entityIds:ids,parameters:structuredClone(parameters)};
    this.constraints.push(c);return c;
  }
  addDimension(type,entityId,value,label=null){
    finite(value,"cota");
    if(value<=0)throw new RangeError("La cota debe ser positiva");
    if(!this.entities.some(e=>e.id===entityId))throw new RangeError("La entidad de la cota no existe");
    const d={id:`dimension-${this.dimensions.length+1}`,type,entityId,value,label:label??String(value)};
    this.dimensions.push(d);return d;
  }
  /**
   * Apply supported constraints to the sketch geometry.
   * This is a deterministic lightweight solver, not yet a general nonlinear
   * constraint solver. It anchors the first point of a line when changing length.
   */
  solve({iterations=24,tolerance=1e-6}={}){
    if(!Number.isInteger(iterations)||iterations<1)throw new RangeError("iterations debe ser un entero positivo");
    const find=id=>this.entities.find(e=>e.id===id);
    const endpoints=e=>e?.type==="line"?[e.data.start,e.data.end]:null;
    const setLength=(line,length)=>{
      const [a,b]=endpoints(line),dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy);
      const ux=n>EPS?dx/n:1,uy=n>EPS?dy/n:0;
      b.x=a.x+ux*length;b.y=a.y+uy*length;
    };
    for(let pass=0;pass<iterations;pass++){
      for(const c of this.constraints){
        const a=find(c.entityIds[0]),b=c.entityIds[1]?find(c.entityIds[1]):null;
        if(!a)continue;
        if(c.type==="horizontal"&&a.type==="line")a.data.end.y=a.data.start.y;
        else if(c.type==="vertical"&&a.type==="line")a.data.end.x=a.data.start.x;
        else if(c.type==="distance"&&a.type==="line")setLength(a,c.parameters.value);
        else if(c.type==="radius"&&["circle","arc"].includes(a.type))a.data.radius=c.parameters.value;
        else if(c.type==="coincident"&&b){
          const ea=endpoints(a),eb=endpoints(b);
          if(ea&&eb){
            let best=[ea[0],eb[0]],d=Infinity;
            for(const pa of ea)for(const pb of eb){const n=dist(pa,pb);if(n<d){d=n;best=[pa,pb];}}
            best[1].x=best[0].x;best[1].y=best[0].y;
          }
        } else if(c.type==="equal"&&b){
          const measure=e=>e.type==="line"?dist(e.data.start,e.data.end):["circle","arc"].includes(e.type)?e.data.radius:null;
          const target=measure(a);
          if(target!==null){
            if(b.type==="line")setLength(b,target);
            else if(["circle","arc"].includes(b.type))b.data.radius=target;
          }
        }
      }
      if(this.validate().valid)break;
    }
    const report=this.validate();
    report.converged=report.valid;
    report.iterations=iterations;
    return report;
  }
  validate(){
    const errors=[];
    for(const c of this.constraints){
      const es=c.entityIds.map(id=>this.entities.find(e=>e.id===id));
      if(c.type==="horizontal"||c.type==="vertical"){
        if(es[0].type!=="line"){errors.push(`${c.id}: horizontal/vertical requiere una línea`);continue;}
        const {start:a,end:b}=es[0].data;
        const delta=c.type==="horizontal"?Math.abs(a.y-b.y):Math.abs(a.x-b.x);
        if(delta>1e-6)errors.push(`${c.id}: la línea no cumple ${c.type}`);
      } else if(c.type==="radius"){
        if(!["circle","arc"].includes(es[0].type))errors.push(`${c.id}: radio requiere círculo o arco`);
        else if(Math.abs(es[0].data.radius-c.parameters.value)>1e-6)errors.push(`${c.id}: radio no coincide con la cota`);
      } else if(c.type==="distance"){
        if(es[0].type!=="line")errors.push(`${c.id}: distancia requiere una línea`);
        else if(Math.abs(dist(es[0].data.start,es[0].data.end)-c.parameters.value)>1e-6)errors.push(`${c.id}: longitud no coincide con la cota`);
      } else if(c.type==="coincident"){
        const endpoints=e=>e.type==="line"?[e.data.start,e.data.end]:[];
        const a=endpoints(es[0]),b=endpoints(es[1]);
        if(!a.length||!b.length||!a.some(p=>b.some(q=>dist(p,q)<1e-6)))errors.push(`${c.id}: las entidades no comparten un extremo`);
      } else if(c.type==="equal"){
        const measure=e=>e.type==="line"?dist(e.data.start,e.data.end):["circle","arc"].includes(e.type)?e.data.radius:null;
        const a=measure(es[0]),b=measure(es[1]);
        if(a===null||b===null)errors.push(`${c.id}: tipos incompatibles para igualdad`);
        else if(Math.abs(a-b)>1e-6)errors.push(`${c.id}: las entidades no tienen la misma medida`);
      }
    }
    return {valid:errors.length===0,errors};
  }
  toJSON(){return {name:this.name,plane:this.plane,entities:this.entities.map(e=>e.toJSON()),constraints:structuredClone(this.constraints),dimensions:structuredClone(this.dimensions)};}
  static fromJSON(data){
    const s=new Sketch(data.name,data.plane);
    s.entities=(data.entities??[]).map(e=>new SketchEntity(e.type,{...e.data,id:e.id}));
    s.constraints=structuredClone(data.constraints??[]);s.dimensions=structuredClone(data.dimensions??[]);
    return s;
  }
}
