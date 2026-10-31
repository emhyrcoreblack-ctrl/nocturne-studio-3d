# Investigación Shapr3D/NOCTURNE — Parte 22
## Importación y edición de formatos externos: mallas, B-rep y reconstrucción CAD

**Fecha:** 2026-10-31  
**Plataforma:** Android  
**Estado:** investigación y especificación; no implica implementación.

## 1. Objetivo y decisiones

Definir cómo NOCTURNE importa, inspecciona, edita y exporta archivos externos sin confundir una malla triangular con geometría CAD exacta.

Decisiones:
1. Todo archivo compatible debe poder visualizarse y transformarse.
2. La edición será no destructiva por defecto: conservar el origen y modificar un derivado.
3. STL, OBJ y 3MF no equivalen a un sólido B-rep ni contienen necesariamente superficies analíticas, restricciones o historial paramétrico.
4. Habrá dos rutas geométricas explícitas: malla y CAD exacto (B-rep). Las herramientas se habilitan según la representación real.
5. No prometer conversión automática perfecta de malla densa a sólido CAD editable.
6. Importar otro archivo no cambia cámara, zoom ni encuadre. Zoom to Fit es una acción explícita.
7. Fallos recuperables: cancelar, conservar el documento anterior y explicar el problema.

La investigación usa documentación pública; no afirma que todas las funciones descritas existan en Shapr3D. Especifica el comportamiento objetivo independiente de la marca.

## 2. Tres clases de geometría

### 2.1 CAD exacto (B-rep)
Representa sólidos mediante vértices, aristas, curvas, caras y superficies matemáticas relacionadas topológicamente. Permite booleanos CAD, fillet/chamfer de aristas, shell, offset de caras y split de sólidos si el kernel y la geometría lo permiten. Fuentes típicas: STEP, IGES (a menudo requiere cosido) y Parasolid X_T/X_B (sujeto a SDK/licencia).

### 2.2 Malla poligonal
Representa superficies mediante vértices y polígonos, normalmente triángulos. Puede incluir normales, UV, colores, materiales y atributos. Fuentes: STL, OBJ, PLY, 3MF, glTF/GLB y FBX.

Operaciones naturales: transformar, duplicar, separar, seleccionar vértices/caras, cortar, reparar, remallar, suavizar, reducir polígonos, recalcular normales y booleanos de malla. Un redondeo de malla debe identificarse como tal; no es un fillet CAD exacto.

### 2.3 Nube, implícita y reconstruida
Nube de puntos, voxels/SDF y superficies reconstruidas requieren herramientas específicas. Ajustar primitivas o superficies a una malla es reverse engineering, no conversión automática sin pérdida.

## 3. Flujo general de importación

### 3.1 Android / SAF
Usar Storage Access Framework:
- ACTION_OPEN_DOCUMENT para elegir un archivo.
- ACTION_CREATE_DOCUMENT para exportar.
- ACTION_OPEN_DOCUMENT_TREE solo si se necesita una carpeta completa.
- Trabajar con URI/streams; no asumir rutas físicas locales.
- Persistir permisos URI cuando el usuario solicite conservar acceso y el proveedor lo permita.
- Admitir proveedores locales, USB y nube, con errores claros.

Android documenta que SAF permite seleccionar proveedores y documentos y concede acceso mediante URI, sin permisos generales de almacenamiento: https://developer.android.com/training/data-storage/shared/documents-files

### 3.2 Pipeline
1. Selección y presentación de nombre/tamaño/tipo declarado.
2. Apertura del stream y comprobación de acceso.
3. Detección del contenido real: extensión/MIME son pistas, no prueba.
4. Preflight: límites de tamaño, conteos, dimensiones, longitudes, profundidad ZIP/XML, referencias externas y archivos truncados.
5. Parseo en segundo plano con progreso y cancelación.
6. Normalización de unidades/ejes mediante transformación reversible.
7. Construcción de escena: cuerpos, objetos, instancias, jerarquía, nombres, transforms, materiales, texturas y visibilidad.
8. Validación geométrica; no reparar silenciosamente.
9. Creación del nodo de origen importado y operaciones derivadas.
10. Informe: representación, unidades, cuerpos, triángulos/caras, materiales, errores y acciones posibles.

### 3.3 Detección real
- STEP: verificar cabecera ISO-10303-21 y estructura completa.
- STL ASCII/binario: no confiar solo en la palabra solid; validar registros, longitud y conteo.
- OBJ: validar registros e índices.
- 3MF: contenedor ZIP con XML y recursos; validar relaciones y límites de expansión.
- GLB: validar cabecera/chunks; glTF JSON puede referenciar recursos externos.
- PLY: validar cabecera, formato y propiedades.
Si extensión y contenido discrepan, no lanzar parsers indiscriminadamente: informar tipo detectado o rechazar.

### 3.4 Unidades, ejes y origen
- STEP/IGES pueden declarar unidades.
- 3MF declara unidad.
- glTF usa metros como unidad lineal de referencia.
- STL carece de unidad universal fiable; marcar como desconocida salvo metadato/perfil externo.
- OBJ/PLY pueden carecer de unidad normalizada.
Guardar unidad fuente, unidad del documento, factor, ejes, transformación de importación y origen original. Ofrecer previsualización de dimensiones cuando la unidad sea desconocida o el tamaño parezca sospechoso. Nunca cambiar coordenadas fuente de forma irreversible.

### 3.5 Cámara
Agregar objetos sin recentrar cámara ni cambiar target de órbita. Mantener selección y cámara previas. Zoom to Fit separado para Todo, Selección u Objeto importado. Modelos alejados del origen requieren coordenadas locales y atención a precisión flotante.

## 4. STEP: intercambio CAD B-rep

Considerar AP203, AP214 y AP242 sin asumir que todos los atributos están presentes o soportados. Preservar, cuando sea posible:
- sólidos, shells, superficies, curvas y topología;
- ensamblajes, componentes, instancias y transforms;
- nombres, colores y estilos por producto/sólido/cara/arista;
- capas, visibilidad, unidades y sistemas de referencia;
- PMI cuando exista y el traductor implemente el subconjunto.

La guía de OCCT describe la traducción STEP a XDE, opciones de transferencia de colores y nombres, y atributos importados/no manejados: https://github.com/Open-Cascade-SAS/OCCT/blob/master/dox/user_guides/step/step.md

Pipeline recomendado: STEP → documento neutral/XDE → inspección → transferencia B-rep → validación. Conservar ensamblaje; no fusionar cuerpos por defecto. Habilitar nombres/colores. Healing controlado con tolerancias configurables, sewing, orientación de shells y cierre de gaps pequeños solo si es seguro. Registrar cada reparación y permitir comparar antes/después.

Diagnosticar archivo inválido, entidades no transferibles, shell abierto, caras degeneradas, aristas libres, tolerancias incoherentes, ensamblaje parcial y atributos omitidos. Solo clasificar como sólido B-rep cuando el kernel confirme validez; shell abierto no es sólido cerrado.

## 5. IGES: curvas y superficies

IGES puede transportar curvas/superficies independientes y no necesariamente sólidos cerrados. Pipeline: leer entidades/unidades, transferir curvas/superficies, agrupar caras, sewing con tolerancia explícita, comprobar orientación/bordes libres/cierre y clasificar como curva, superficie, shell o sólido. Convertir a sólido solo si el shell está cerrado y validado. La UI debe explicar que una superficie abierta puede visualizarse/medirse, pero no admite booleanos de sólido hasta repararse.

## 6. STL: edición de malla

STL describe una superficie triangulada; el uso común no define unidad ni historial CAD. La Library of Congress lo incluye entre formatos aceptables para objetos 3D escaneados: https://www.loc.gov/preservation/resources/rfs/design3D.html

Soportar ASCII y binario. Validar conteo, coordenadas finitas, normales, triángulos degenerados/duplicados y topología reconstruida.

Diagnósticos:
- vértices/triángulos y componentes conectados;
- aristas boundary (una cara) y non-manifold (más de dos caras);
- caras degeneradas, normales inconsistentes, duplicados;
- auto-intersecciones cuando el coste lo permita;
- volumen firmado, orientación y watertightness.

Clasificación: cerrada/manifold; abierta; non-manifold; corrupta/degenerada. No calcular volumen fiable de una malla abierta.

### Herramientas de malla prioritarias
1. Move/Rotate/Scale/Mirror/Duplicate.
2. Transformación por eje y alineación.
3. Selección de objeto, vértice, arista y cara.
4. Separar componentes conectados.
5. Cortar/dividir por plano.
6. Eliminar caras seleccionadas.
7. Reparar normales/orientación.
8. Eliminar duplicados/degenerados.
9. Cerrar agujeros con reparación controlada.
10. Remesh/uniform remesh.
11. Smooth con protección opcional de features.
12. Reduce/Decimate con error máximo.
13. Booleanos de malla si entradas cumplen requisitos.
14. Medir bounds, área, volumen de malla cerrada y distancias.

Registrar parámetros/resultados en historial de operaciones de malla, claramente distinto del árbol paramétrico B-rep.

### Conversión y reverse engineering
Tres capacidades separadas:
- B-rep → malla: teselación.
- Malla → B-rep facetado: cara plana por triángulo o agrupación; puede producir B-rep enorme y no recupera superficies CAD originales.
- Reverse engineering: detectar planos/cilindros/conos/esferas/superficies libres, ajustar, segmentar, simplificar y validar.

La interfaz debe advertir complejidad, tolerancia y desviación máxima/media. Mantener STL original. No ofrecer fillet CAD, shell exacto ni offset B-rep sobre STL como si fuera la misma geometría; crear herramientas de malla independientes.

## 7. OBJ + MTL

Parsear posiciones, UV, normales, caras, grupos, objetos y materiales; soportar índices positivos/negativos y polígonos que deban triangularse. Detectar n-gons no planos o auto-intersectados. Preservar grupos como jerarquía, UV, normales y suavizado cuando existan. Resolver rutas MTL/texturas relativas si SAF permite acceder. Si faltan, ofrecer Buscar texturas. OBJ aislado no garantiza que incluya imágenes. Permitir selección múltiple o paquete ZIP si no se puede acceder a archivos acompañantes.

## 8. 3MF

3MF transporta más que triángulos: unidades, componentes, transforms, metadatos, materiales y extensiones. El consorcio publica Core y extensiones; indica su reconocimiento como ISO/IEC 25422:2025 y condiciones royalty-free: https://3mf.io/spec/

Importar ZIP/XML con límites de expansión y rutas seguras. Leer unidades, objetos, componentes, transforms, build items y metadata. Preservar posiciones relativas, colores/materiales, propiedades por triángulo y texturas cuando estén soportadas. Detectar extensiones desconocidas y reportar pérdidas. No presentarlo como formato de historial CAD.

## 9. PLY, glTF/GLB y FBX

### PLY
Adecuado para escaneos, nubes y mallas con propiedades por vértice/cara. La cabecera declara ASCII/binario y propiedades. Preservar color/normales; admitir nube sin caras como tipo distinto de mesh. LOC lista PLY y OBJ junto a STL para objetos escaneados: https://www.loc.gov/preservation/resources/rfs/design3D.html

### glTF/GLB
Formato de entrega/runtime de escenas, no autoría CAD. glTF 2.0 representa escenas, nodos, jerarquía, transforms, meshes, cámaras, buffers, materiales y texturas. Khronos especifica que no conserva información de autoría y no fue diseñado como formato authoring: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

Importar glTF JSON y GLB binario, jerarquía, transforms, instancias, geometría, normales, tangentes, UV, colores y materiales PBR. Soportar texturas base color, metallic-roughness, normal, occlusion y emissive según renderer. Extensiones mediante lista blanca y diagnóstico. Decidir explícitamente si animación/skinning se preserva como escena o se hornea a pose estática; no convertir silenciosamente.

La especificación define Texture/Image/Sampler y materiales PBR: https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/Specification.adoc

### FBX
Adaptador separado por variantes, SDK y licencias. Priorizar geometría, transforms, jerarquía, normales, UV, materiales/texturas. Animación, rigs y cámaras requieren pruebas. No comprometer soporte total sin validar licencia/SDK y corpus real.

## 10. Parasolid X_T/X_B

Puede transportar B-rep Parasolid con alta fidelidad mediante SDK compatible. Verificar licencia, redistribución, coste y disponibilidad ARM64/Android. No asumir que un lector de mallas abre estos archivos. Mantener adaptador aislado. La decisión de Parte 21 sigue vigente: OCCT como candidato principal para POC Android; Parasolid como comparación comercial pendiente de validación contractual/técnica.

## 11. Matriz de capacidades

| Operación | B-rep válido | Malla | Observación |
|---|---:|---:|---|
| Mover/rotar/escalar | Sí | Sí | Transformación de objeto |
| Duplicar/instanciar | Sí | Sí | Preservar referencia |
| Medir bounds | Sí | Sí | Exactitud según representación |
| Área/distancia | Exacta según kernel | Según triangulación | Malla aproxima |
| Volumen | Sólido cerrado | Malla cerrada/orientada | Rechazar si no watertight |
| Booleanos | B-rep | Malla | Algoritmos distintos |
| Fillet/chamfer | Sí, si kernel lo permite | No como CAD exacto | Herramienta de malla aparte |
| Shell/offset cara | Sí, sujeto a forma | No equivalente exacto | Algoritmo distinto |
| Split | Sólido/cara/arista | Corte de triángulos | Preservar ambas partes |
| Editar vértices/caras | Topología CAD | Sí | Modelos distintos |
| UV/texturas | Atributos limitados | Sí, según formato | Mantener asignación |
| Historial fuente | No siempre | No | Solo operaciones propias |
| Reconstrucción CAD | No necesaria | Reverse engineering | Nuevo resultado |

La tabla es política de producto, no garantía de éxito: depende de kernel, topología, tolerancias y validez.

## 12. Arquitectura propuesta

### Adaptadores
Interfaz común IImportAdapter:
- sniff(header/stream)
- inspect(stream) → ImportManifest
- read(stream, options, cancellation, progress)
- diagnostics()
- capabilities()

Adaptadores: STEP, IGES, STL, OBJ, 3MF, PLY, glTF, FBX y Parasolid (solo con licencia).

### Modelo neutral
ImportedAsset: id, URI fuente, nombre, formato detectado, checksum, fecha, unidades/ejes, transformación, versión de importador y diagnósticos.

ImportedNode: id/parent, nombre, transform, visibilidad, entidad fuente, GeometryRef tipada (B-rep, mesh, point cloud, curve/surface), materiales, UV y metadata.

MeshGeometry: posiciones, índices, normales, tangentes, UV, colores, submeshes/material slots, atributos por cara y diagnóstico topológico.

BrepGeometry: handle del kernel, mapa topológico, unidades, validación, nombres/colores/ensamblaje e IDs estables de aplicación.

ImportOperation: nodo fuente, opciones, resultado, advertencias y duración.

### Original y derivado
- Nodo Imported Source bloqueado/no destructivo por defecto.
- Modificaciones generan derivados/historial.
- Aplicar cambios no borra fuente sin confirmación.
- Revertir vuelve a fuente.
- Cachear bytes internos si el usuario lo permite; si solo se guarda URI externa, detectar archivo ausente/modificado y permitir relocalizar.

### Android y rendimiento
- Streams/chunks, evitar copias completas en RAM.
- Parseo, triangulación y healing en worker thread.
- Cancelación cooperativa.
- Progreso por lectura, parsing, construcción, validación, materiales y commit.
- Preparar escena fuera del documento y hacer commit atómico.
- Cancelar/fallar libera temporales y deja documento/cámara intactos.
- Para grandes modelos: LOD, chunking, índice espacial y carga progresiva de viewport.

## 13. Materiales y texturas
Distinguir material, apariencia y textura. Preservar PBR (base color, metallic, roughness, normal, occlusion, emissive, alpha), UV por canal y asignación por submesh/cara. Resolver rutas relativas con acceso seguro. Empaquetar recursos al guardar, o conservar enlaces externos explícitos. Exportar dependencias empaquetadas o ZIP. Texturas faltantes: placeholder y diagnóstico, no pérdida silenciosa. STEP no debe suponerse portador de PBR completo.

## 14. UX de importación
Mostrar nombre, formato detectado, tamaño, tipo geométrico, unidad, cuerpos/objetos/componentes, triángulos/caras/puntos, materiales y advertencias.

Opciones: unidad/escala si desconocida; conservar jerarquía (default); importar materiales/texturas; objeto o componentes; analizar/reparar (solo analizar por defecto); origen fuente o documento; mantener cámara (siempre default).

Menú del objeto: Editar malla / Editar sólido CAD según tipo, Transformar, Separar, Reparar/validar, Convertir/reconstruir, Reemplazar fuente, Exportar selección, Propiedades/diagnóstico, Zoom to Fit selección.

Mensajes:
- “Importado como malla triangular. Puedes transformar, reparar y editar vértices/caras. Las operaciones CAD exactas de caras y aristas no están disponibles para este tipo de geometría.”
- “Unidad no definida. Selecciona una unidad o introduce un factor de escala.”
- “La malla tiene bordes abiertos; el volumen no puede calcularse de forma fiable.”
- “La textura no se encontró. El material se conservó con una textura pendiente de localizar.”

## 15. Seguridad
Tratar archivos como entrada no confiable: límites antes de reservar memoria, proteger integer overflow, ZIP bombs/XML expansion, normalizar rutas, no ejecutar scripts/plugins/código, no descargar recursos externos sin consentimiento, limitar jerarquía/nodos, manejar NaN/Inf y coordenadas extremas, validar índices, detectar truncamiento/chunks solapados, usar parsers actualizados y fuzzing. Aislar fallos para no corromper documento.

## 16. Exportación
Exportar selección/cuerpo/componente/escena. Mantener unidades, jerarquía y transforms cuando el formato lo permita. STEP exporta B-rep; advertir si solo hay malla. IGES para superficies/curvas/sólidos si writer lo soporta. STL ofrece unidad/escala y teselación. OBJ requiere MTL/texturas o ZIP. 3MF preferible para impresión con unidades/múltiples objetos/materiales. GLB para escenas, no historial CAD. Incluir informe de pérdidas (PMI, texturas, animación horneada, color simplificado). Preferir Save As; no sobrescribir fuente sin confirmación.

## 17. Fases de implementación posteriores
1. Modelo neutral, manifest, SAF, cancelación, diagnósticos.
2. STL/OBJ, transformaciones, selección, separación, propiedades y export.
3. Reparación de malla: normales, degenerados, agujeros, remesh, reducción.
4. 3MF/PLY: unidades, componentes, colores/materiales y nube.
5. STEP con OCCT/XDE: ensamblajes, nombres, colores, validación y healing.
6. IGES: superficies/curvas, sewing y clasificación.
7. glTF/GLB; FBX tras validar SDK/licencia.
8. Reverse engineering.
9. Parasolid tras confirmación contractual y POC.
No iniciar implementación hasta cerrar investigación y acordar el orden.

## 18. Matriz de regresión: 64 pruebas

**SAF y detección:**  
1 STL binario; 2 STL ASCII; 3 STEP con extensión incorrecta/cabecera válida; 4 extensión STEP con contenido inválido; 5 proveedor nube; 6 USB; 7 permiso URI persistente; 8 cancelar selector; 9 stream no disponible; 10 tamaño desconocido.

**Unidades y cámara:**  
11 STEP mm; 12 STEP pulgadas; 13 IGES unidad distinta; 14 3MF unidad declarada; 15 STL sin unidad; 16 OBJ sin unidad; 17 glTF metros; 18 ejes distintos; 19 coordenadas lejanas; 20 importar segundo archivo sin alterar cámara/zoom.

**STEP/IGES:**  
21 STEP varios sólidos; 22 ensamblaje anidado; 23 nombres/colores; 24 cuerpos parcialmente inválidos; 25 shell abierto; 26 tolerancias inconsistentes; 27 entidades no soportadas; 28 PMI presente; 29 IGES curvas; 30 superficies independientes; 31 sewing cierra shell; 32 gaps fuera de tolerancia; 33 healing conserva original; 34 export/reimport STEP.

**Mallas:**  
35 STL watertight; 36 abierto; 37 non-manifold; 38 normales invertidas; 39 degenerados; 40 duplicados; 41 millones de triángulos dentro del presupuesto; 42 separar componentes; 43 corte por plano preserva ambas mitades; 44 reparar agujero sobre derivado; 45 reducir con tolerancia; 46 suavizar sin perder features; 47 booleano válido; 48 booleano inválido con diagnóstico; 49 PLY nube sin caras; 50 PLY color por vértice.

**OBJ/3MF/glTF/materiales:**  
51 OBJ+MTL+texturas; 52 OBJ sin MTL; 53 índices negativos; 54 n-gons; 55 3MF varios objetos/componentes; 56 3MF materiales/color por triángulo; 57 extensión desconocida; 58 ZIP malformado/bomba; 59 GLB jerarquía/transforms/PBR; 60 glTF recursos ausentes; 61 GLB textura embebida; 62 extensión glTF no soportada; 63 FBX varias meshes (si habilitado); 64 export escena con dependencias empaquetadas.

Cada prueba registra formato, dispositivo, RAM, tiempo, pico de memoria, resultado, advertencias, cámara antes/después y hash de fuente. Repetir modelos grandes en gama baja/media.

## 19. Criterios de aceptación
Importación lista cuando identifica contenido real; preserva jerarquía/unidades/transforms/atributos soportados; distingue B-rep/malla/nube/escena; no ofrece herramientas incompatibles; mantiene cámara; permite editar derivado; muestra diagnóstico; cancela sin datos parciales; exporta con informe de pérdidas y supera regresión Android.

## 20. Fuentes públicas
- Android SAF: https://developer.android.com/training/data-storage/shared/documents-files
- OCCT STEP/XDE: https://github.com/Open-Cascade-SAS/OCCT/blob/master/dox/user_guides/step/step.md
- 3MF Consortium specs: https://3mf.io/spec/
- 3MF Core: https://github.com/3MFConsortium/spec_core
- Khronos glTF 2.0: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- Khronos glTF registry: https://registry.khronos.org/glTF/
- Library of Congress 3D formats: https://www.loc.gov/preservation/resources/rfs/design3D.html

## 21. Incertidumbres para POC
Compatibilidad/rendimiento OCCT STEP/IGES en ARM64; calidad del healing y desviación dimensional; coste de booleanos/reparación de mallas densas; licencia/SDK FBX; licencia Android Parasolid; cobertura PMI AP242; extensiones 3MF/glTF y límites de memoria por dispositivo.

**Conclusión:** NOCTURNE debe importar a un modelo neutral de escena con representaciones geométricas tipadas. STL y otros formatos de malla deben ser editables con herramientas de malla honestas; STEP/IGES deben conservar B-rep cuando sea posible. La interoperabilidad se mide por geometría, estructura, atributos, diagnóstico y reversibilidad, no solo por abrir el archivo.
