import { repairTriangleMesh } from "./mesh.js";

function bytesOf(input) {
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer,input.byteOffset,input.byteLength);
  throw new TypeError("STL debe ser texto, ArrayBuffer o una vista binaria");
}
function parseBinary(bytes) {
  if(bytes.byteLength<84) throw new RangeError("STL binario truncado: falta la cabecera");
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const count=view.getUint32(80,true);
  const expected=84+count*50;
  if(bytes.byteLength!==expected) throw new RangeError("La longitud del STL binario no coincide con su número de triángulos");
  const vertices=[],triangles=[];
  let offset=84;
  for(let i=0;i<count;i++,offset+=50) {
    offset+=12; // normal almacenada; se recalcula a partir de los vértices
    for(let j=0;j<3;j++) {
      const x=view.getFloat32(offset,true),y=view.getFloat32(offset+4,true),z=view.getFloat32(offset+8,true);
      if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z)) throw new RangeError(`STL contiene coordenadas no finitas en la cara ${i}`);
      triangles.push(vertices.length/3);vertices.push(x,y,z);offset+=12;
    }
    offset+=2; // atributo
  }
  return {vertices,triangles,sourceFormat:"binary",triangleCount:count};
}
function parseASCII(text) {
  const vertices=[],triangles=[];
  const facetPattern=/\bfacet\s+normal\s+([^\r\n]+)/gi;
  const vertexPattern=/\bvertex\s+([^\r\n]+)/gi;
  let facetCount=0,match;
  while((match=facetPattern.exec(text))) facetCount++;
  if(!facetCount || !/\bsolid\b/i.test(text) || !/\bendsolid\b/i.test(text))
    throw new TypeError("El archivo no parece ser un STL ASCII válido");
  vertexPattern.lastIndex=0;
  while((match=vertexPattern.exec(text))) {
    const parts=match[1].trim().split(/\s+/).map(Number);
    if(parts.length!==3||parts.some(v=>!Number.isFinite(v))) throw new RangeError("STL ASCII contiene un vértice inválido");
    vertices.push(...parts);triangles.push(triangles.length);
  }
  if(vertices.length/9!==facetCount) throw new RangeError("Cada faceta STL debe contener exactamente tres vértices");
  return {vertices,triangles,sourceFormat:"ascii",triangleCount:facetCount};
}
export function importSTL(input,{tolerance=1e-7}={}) {
  const bytes=bytesOf(input);
  let parsed;
  // El tamaño exacto prevalece: un STL binario puede comenzar con la palabra "solid".
  if(bytes.byteLength>=84 && 84+new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(80,true)*50===bytes.byteLength)
    parsed=parseBinary(bytes);
  else {
    let text;
    try { text=new TextDecoder("utf-8",{fatal:true}).decode(bytes); }
    catch { throw new TypeError("No se pudo interpretar el archivo STL"); }
    parsed=parseASCII(text);
  }
  const repaired=repairTriangleMesh({kind:"triangle-mesh",vertices:parsed.vertices,triangles:parsed.triangles,metadata:{sourceFormat:parsed.sourceFormat,units:null,sourceTriangleCount:parsed.triangleCount}},{tolerance});
  return {...repaired.mesh,metadata:{...repaired.mesh.metadata,operation:"import-stl",sourceFormat:parsed.sourceFormat,triangleCount:repaired.mesh.triangles.length/3,sourceTriangleCount:parsed.triangleCount,units:null,repair:repaired.report}};
}
