# Investigación Shapr3D/NOCTURNE — Parte 23
## Edición avanzada de mallas y reverse engineering: de STL editable a geometría CAD reconstruida

**Fecha:** 2026-10-31  
**Plataforma objetivo:** Android  
**Estado:** investigación y especificación; no implica implementación.

---

## 1. Propósito y alcance

La Parte 22 definió cómo importar formatos externos y distinguir mallas de B-rep. Esta parte profundiza en lo que debe ocurrir después de importar una malla: selección precisa, edición de vértices/aristas/caras, reparación, remallado, booleanos de malla, reconstrucción desde nubes de puntos y conversión controlada hacia geometría CAD.

El objetivo no es hacer que un STL “se convierta mágicamente” en un modelo paramétrico. Es ofrecer una cadena de herramientas profesional y honesta que permita:
- modificar directamente una malla triangulada;
- reparar defectos sin destruir el original;
- conservar la forma dentro de tolerancias declaradas;
- reconstruir primitivas y superficies CAD cuando los datos lo permitan;
- evaluar y documentar la desviación entre fuente y resultado.

La documentación de CGAL separa explícitamente reparación, remallado y booleanos de malla en paquetes especializados; Open3D documenta métodos diferentes para reconstruir superficies desde nubes de puntos. Estas separaciones deben reflejarse en la arquitectura de NOCTURNE. Fuentes: https://cgal.geometryfactory.com/CGAL/doc/main/Polygon_mesh_processing/index.html y https://www.open3d.org/docs/latest/tutorial/geometry/surface_reconstruction.html

## 2. Representación de malla para edición

### 2.1 Estructura interna

No usar una simple lista de triángulos como única estructura de edición interactiva. Mantener:
- posiciones de vértices;
- índices/caras y conectividad;
- aristas y adyacencias;
- normales por cara y vértice;
- UV por canal y atributos de color;
- grupos/submeshes/materiales;
- componentes conectados;
- etiquetas de borde, seams, sharp edges y regiones protegidas;
- identificadores estables de aplicación para selección e historial.

La estructura de edición debe permitir consultar vecinos de vértice, caras incidentes, aristas incidentes y anillos de conectividad sin recorrer toda la malla en cada gesto. Un half-edge o estructura equivalente es candidato apropiado; comparar memoria y coste de actualización en ARM64.

### 2.2 Topología frente a geometría

Distinguir:
- defecto geométrico: triángulos degenerados, intersecciones, caras casi coplanares o coordenadas inválidas;
- defecto combinatorio: conectividad no manifold, aristas con número incorrecto de caras incidentes, vértices no manifold;
- defecto de orientación: caras vecinas con winding inconsistente;
- defecto semántico: UV/materiales/grupos rotos aunque la topología sea válida.

Una reparación puede arreglar una categoría y empeorar otra. Cada operación debe volver a ejecutar los diagnósticos relevantes.

### 2.3 Identidad y selección persistente

Los índices de vértice/cara pueden cambiar al reparar o remallar. No deben usarse como identidad permanente en el historial. Mantener:
- IDs de entidad de la aplicación;
- mapa de correspondencia fuente → derivado;
- regiones de selección transferidas por proximidad/proyección;
- informe de elementos eliminados, divididos, fusionados o creados.

Cuando no exista correspondencia fiable, invalidar selección y explicar por qué; nunca seleccionar silenciosamente otro elemento.

---

## 3. Selección precisa en pantalla táctil

### 3.1 Modos de selección

- Objeto completo.
- Componente conectado.
- Cara.
- Arista.
- Vértice.
- Región por lazo/pincel.
- Selección por ángulo/normal.
- Selección por material/grupo.
- Selección por visibilidad (oclusiones y selección a través del modelo).

### 3.2 Motor de picking

Combinar:
1. ray cast desde la cámara para hallar candidatos;
2. aceleración espacial (BVH/AABB tree);
3. proyección de candidatos a pantalla;
4. tolerancia en píxeles, no en unidades del mundo;
5. desempate por profundidad, distancia al centro del toque y prioridad de tipo;
6. modo de selección cíclica cuando vértice/arista/cara se solapan visualmente.

Mostrar un pequeño menú contextual cuando un toque puede corresponder a vértice, arista o cara. En Android, evitar exigir precisión de un píxel: usar un radio de toque configurable y una lupa temporal para puntos densos.

### 3.3 Selección de aristas y vértices

- Resaltar preselección antes de confirmar.
- Mantener el dedo sin que oculte el punto seleccionado mediante offset visual.
- Permitir agregar/quitar con gesto secundario o modificador accesible.
- Ofrecer selección de bucle de aristas, anillo de aristas y cadena de borde.
- Seleccionar por umbral angular y continuidad.
- Evitar saltos cuando el usuario arrastra sobre geometría oculta.

### 3.4 Lazo y pincel

- Lazo poligonal libre y rectangular.
- Pincel con radio en pantalla.
- Modo visible solamente / a través de todo.
- Selección por centro de cara o intersección proyectada.
- Suavizar borde de selección con crecimiento/contracción.
- Invertir, expandir, contraer y seleccionar conectados.
- Operaciones costosas ejecutadas en worker con vista previa progresiva.

---

## 4. Edición de vértices, aristas y caras

### 4.1 Vértices

Herramientas:
- mover libre o restringido a eje/plano;
- snap a rejilla, vértice, arista, plano y geometría de referencia;
- escalar conjunto alrededor de pivote;
- soldar/fusionar dentro de tolerancia;
- deslizar sobre aristas;
- suavizar posición (Laplacian/Taubin u otro método);
- borrar con política explícita: eliminar caras incidentes, rellenar hueco o preservar borde.

Mostrar distancia y desplazamiento numérico; permitir entrada exacta en unidades del documento.

### 4.2 Aristas

Herramientas:
- split/subdividir;
- colapsar;
- girar diagonal en un quad;
- disolver manteniendo superficie cuando sea válido;
- marcar sharp/seam/protected;
- bevel de malla;
- seleccionar loop/ring;
- extruir borde/loop.

Bevel de malla no debe presentarse como fillet B-rep. Requiere controlar segmentos, ancho, perfil, miter y límites; puede generar triángulos/ngons y cambiar topología.

### 4.3 Caras

Herramientas:
- mover/rotar caras o región;
- extruir región;
- inset;
- borrar y rellenar;
- duplicar/separar;
- invertir normales;
- triangulate/quadrangulate cuando sea posible;
- subdividir;
- asignar material;
- extruir a lo largo de normal/promedio o vector definido.

Extruir caras trianguladas puede dejar resultados facetados. Para superficies más limpias, combinar con remesh y suavizado, pero conservar una copia del estado previo.

### 4.4 Extrusión de región de malla

Definir comportamiento para selección de caras contiguas:
- crear paredes laterales en el perímetro;
- extrusión normal promedio, normal individual o dirección definida;
- distancia exacta y simetría;
- mantener región conectada;
- resolver esquinas y auto-intersecciones;
- opción de extrusión como región separada o unida a la malla.

La vista previa debe detectar colisiones/auto-intersecciones y avisar antes de confirmar.

---

## 5. Reparación de mallas

### 5.1 Diagnóstico antes de reparar

Informe por defecto, sin modificar:
- bordes boundary;
- aristas non-manifold;
- vértices non-manifold;
- componentes aislados;
- triángulos degenerados/duplicados;
- winding inconsistente;
- normales invertidas;
- auto-intersecciones;
- agujeros y perímetro de cada borde;
- shells anidados y volumen/orientación cuando se pueda determinar.

### 5.2 Secuencia sugerida de reparación

No ejecutar una reparación universal automática sin mostrar sus efectos. Ofrecer una receta editable:
1. eliminar NaN/Inf y coordenadas fuera de límites;
2. eliminar caras degeneradas;
3. fusionar duplicados dentro de tolerancia;
4. reparar conectividad y orientación;
5. detectar y clasificar componentes;
6. resolver bordes/non-manifold según política;
7. rellenar agujeros seleccionados;
8. remallar localmente si la calidad es mala;
9. verificar intersecciones, watertightness y volumen;
10. comparar forma original y reparada.

Cada etapa puede omitirse, revertirse o ajustarse. No fusionar vértices de dos superficies próximas si eso cerraría una holgura funcional sin autorización.

### 5.3 Relleno de agujeros

Clasificar por perímetro, diámetro, número de aristas, curvatura alrededor y contexto:
- agujero pequeño/plano: parche local;
- borde irregular: triangulación con optimización;
- gran abertura: reconstrucción de superficie, no simple tapa plana;
- agujero que corresponde a una abertura real de diseño: no rellenar automáticamente.

CGAL documenta que el relleno genera un parche triangulado y que para límites complejos puede producir auto-intersecciones; también contempla refinamiento y fairing posteriores. Por ello, todo fill debe validarse y mostrar una previsualización. Fuente: https://cgal.geometryfactory.com/CGAL/doc/main/PMP_Mesh_repair/index.html

Opciones:
- tapa plana;
- parche mínimo;
- parche suavizado;
- reconstrucción siguiendo curvatura;
- selección manual del contorno.

### 5.4 Orientación y normales

Separar orientación topológica de normal shading:
- recalcular normales por cara;
- recalcular normales de vértice con ángulo de suavizado;
- detectar winding inconsistente;
- orientar componentes cerrados hacia fuera;
- preservar bordes sharp/material seams;
- no invertir shells internos sin conocer su rol.

Una malla puede verse bien con normales suavizadas y seguir teniendo winding incorrecto; la validación volumétrica debe usar topología/orientación, no solo apariencia del viewport.

### 5.5 No-manifold y auto-intersecciones

No siempre existe reparación automática inequívoca. Ofrecer:
- separar regiones que comparten aristas de forma no-manifold;
- duplicar vértices de unión para crear shells independientes;
- cortar auto-intersecciones y reconstruir regiones;
- descartar componentes pequeños solo con confirmación;
- conservar un informe de lo eliminado.

No declarar “reparado” hasta comprobar de nuevo las condiciones objetivo.

---

## 6. Remallado, suavizado y reducción

### 6.1 Remallado isotrópico

Objetivo: triángulos con longitudes más uniformes, mejor distribución y calidad. Operaciones típicas: split/collapse/flip de aristas, suavizado y proyección a la superficie original. CGAL documenta remallado isotrópico con longitud objetivo, iteraciones y protección de polilíneas. Fuente: https://doc.cgal.org/6.1/Polygon_mesh_processing/index.html

Parámetros UI:
- longitud de arista objetivo;
- número de iteraciones;
- región;
- preservar bordes/features;
- preservar UV/material boundaries;
- tolerancia de proyección;
- densidad adaptativa por curvatura.

### 6.2 Remallado uniforme vs adaptativo

- Uniforme: útil para edición y simulación estable, pero puede sobredimensionar zonas planas.
- Adaptativo: más densidad en curvatura y detalles; más eficiente para preservar forma.
- Voxel remesh: robusto para unir/reparar, pero puede borrar detalles pequeños y redondear aristas.
- Quad remesh: útil para flujos de subdivisión/edición, pero complejo y de alto coste; no requisito inicial.

### 6.3 Suavizado

Distinguir:
- Laplacian: sencillo, tiende a encoger.
- Taubin/HC: reduce shrinkage, aun puede alterar features.
- bilateral/feature-aware: intenta preservar discontinuidades.
- fairing: optimiza calidad de parche o superficie.

Parámetros: fuerza, iteraciones, región, bordes fijos, features protegidas, cotas de desplazamiento. Mostrar desviación máxima y media respecto a la fuente.

### 6.4 Decimación

- Vertex clustering: rápido, menos control de forma.
- Edge collapse/QEM: mejor control de error geométrico y apariencia.
- Preservar silueta, bordes, UV seams, materiales y landmarks.
- Objetivo por número de caras o porcentaje.
- Tolerancia geométrica máxima.
- Mostrar triángulos eliminados y desviación estimada.

No usar solo porcentaje como promesa de calidad. Un 90% de reducción puede ser aceptable en una superficie orgánica y destruir una pieza con taladros pequeños.

---

## 7. Booleanos y cortes de malla

### 7.1 Precondiciones

Antes de booleano:
- mallas cerradas/orientadas y sin auto-intersecciones;
- escala y tolerancia compatibles;
- geometría de intersección no degenerada;
- operandos sin componentes ambiguos o no-manifold.

CGAL define corefinement como refinar ambas mallas para que las polilíneas de intersección se conviertan en aristas de ambas; los booleanos de volumen requieren superficies cerradas válidas. Fuente: https://doc.cgal.org/6.1/Polygon_mesh_processing/index.html

### 7.2 Operaciones

- unión;
- diferencia;
- intersección;
- corte por plano;
- sección abierta;
- split por otra malla;
- clipping con caja/plano.

Diferenciar “cortar superficie” de “partir volumen cerrado”. Para corte volumétrico, ofrecer conservar ambos lados y opción de tapar las secciones.

### 7.3 Casos degenerados

- contacto tangencial;
- caras coincidentes;
- aristas coincidentes;
- operandos coplanares;
- intersección diminuta;
- escala muy grande/pequeña;
- malla no-manifold;
- múltiples componentes anidados.

La operación debe fallar sin alterar los operandos originales y mostrar diagnóstico.

---

## 8. Reverse engineering: de escaneo a superficie

### 8.1 Tipos de entrada

- nube de puntos sin normales;
- nube con normales;
- malla escaneada;
- malla CAD triangulada;
- múltiples escaneos con solape;
- datos parciales/oclusiones.

No tratar una malla CAD teselada como si fuese una nube escaneada: en la primera pueden existir superficies exactas disponibles en el archivo fuente; en la segunda hay incertidumbre de medición.

### 8.2 Preparación de nube

1. filtrar puntos no finitos;
2. eliminar outliers;
3. estimar densidad local;
4. estimar normales;
5. orientar normales coherentemente;
6. segmentar por regiones;
7. alinear múltiples escaneos si procede;
8. evaluar huecos y zonas de baja confianza.

Mostrar densidad y cobertura; el usuario debe poder excluir puntos de baja confianza.

### 8.3 Registro de escaneos

Alinear múltiples nubes mediante:
- selección manual de correspondencias;
- coarse alignment (feature matching);
- ICP refinado;
- control de escala rígida;
- matriz de transformación guardada y error residual.

No aplicar escala libre por defecto en metrología: cambia dimensiones reales. Informar RMS, error máximo y cobertura de correspondencias.

### 8.4 Reconstrucción de superficie desde puntos

Métodos a evaluar:
- Alpha shapes: permite capturar concavidades según escala alpha; sensible al parámetro y densidad.
- Ball Pivoting: hace crecer triángulos desde puntos; requiere normales y radios adecuados.
- Poisson: reconstrucción global suave, resuelve un problema regularizado; puede cerrar huecos y crear geometría donde no hay datos.
- Marching cubes sobre campo volumétrico: útil con SDF/voxels; resolución y memoria dependientes del voxel.

Open3D documenta Alpha Shapes, Ball Pivoting y Poisson; señala que BPA requiere normales y que Poisson produce una superficie regularizada cuya resolución depende de la profundidad del octree. Fuente: https://www.open3d.org/docs/latest/tutorial/geometry/surface_reconstruction.html

Cada método debe mostrar sus supuestos, parámetros, zonas extrapoladas y desviación a los puntos fuente. No escoger automáticamente un único algoritmo para todo escaneo.

---

## 9. Ajuste de primitivas y superficies CAD

### 9.1 Primitivas detectables

- plano;
- cilindro;
- cono;
- esfera;
- toro;
- eje/línea;
- círculo/arco en secciones.

Proceso:
1. seleccionar región;
2. estimar tipo de superficie;
3. ajustar parámetros por mínimos cuadrados/robustos;
4. calcular residuos;
5. presentar preview;
6. aceptar/rechazar o ajustar tolerancia.

Mostrar radio, diámetro, eje, centro, ángulo, normal y error de ajuste. Los datos ruidosos requieren estimadores robustos y rechazo de outliers.

### 9.2 Segmentación por superficies

Agrupar puntos/caras por:
- continuidad geométrica;
- normales;
- curvatura;
- residuo de ajuste;
- conectividad;
- límites naturales de pieza.

Una segmentación automática puede fusionar superficies que en diseño eran separadas. Permitir editar límites y bloquear regiones.

### 9.3 Superficies libres

Para regiones no primitivas:
- ajustar NURBS/B-spline a puntos;
- controlar grado, número de spans y continuidad;
- preservar bordes y curvas guía;
- evaluar desviación;
- evitar sobreajuste al ruido.

La calidad debe evaluarse por error, continuidad y complejidad de la superficie. Más parches no significan mejor reconstrucción.

### 9.4 Construcción de sólido CAD

Para crear B-rep:
1. reconstruir superficies;
2. definir/ajustar curvas límite;
3. recortar superficies;
4. coser bordes;
5. validar orientación y tolerancias;
6. cerrar shell;
7. convertir a sólido;
8. validar volumen/topología;
9. mantener vínculo con malla/nube fuente.

Un conjunto de superficies ajustadas no es sólido hasta cerrar y validar el shell. El resultado es un nuevo modelo CAD derivado, no el archivo fuente recuperado.

---

## 10. Comparación de desviación y metrología

Crear herramientas de comparación:
- distancia punto-superficie;
- distancia superficie-superficie;
- mapa de desviación con escala de colores configurable;
- RMS, media absoluta, percentiles y máximo;
- histograma;
- sección de comparación;
- desviación por región;
- porcentaje dentro de tolerancia.

No comparar solo vértices si las densidades son diferentes. Usar muestreo superficial y distancia geométrica; declarar método, densidad y tolerancia. Registrar si se comparó malla contra nube, malla contra B-rep o superficie reconstruida contra fuente.

---

## 11. Arquitectura técnica propuesta

### 11.1 Servicios separados

- MeshTopologyService: conectividad, componentes y IDs.
- MeshPickingService: ray casting, BVH y selección.
- MeshEditService: edición de elementos y extrusiones.
- MeshRepairService: degenerados, orientación, stitching y agujeros.
- MeshRemeshService: remesh, smooth y decimate.
- MeshBooleanService: corefinement, split y booleanos.
- PointCloudService: filtros, normales, registro.
- SurfaceReconstructionService: Alpha/BPA/Poisson/SDF.
- PrimitiveFitService: planos/cilindros/conos/esferas/toro.
- SurfaceFitService: NURBS y límites.
- DeviationAnalysisService: mapa de error y estadísticas.
- ProvenanceService: historial, fuente y correspondencias.

### 11.2 Transacciones y reversibilidad

Cada operación crea un resultado derivado y un registro con:
- input asset IDs;
- parámetros y unidades;
- algoritmo/versión;
- tolerancias;
- tiempo y memoria;
- estadísticas antes/después;
- advertencias;
- mapa de correspondencia cuando exista.

No sobrescribir fuente. Las operaciones destructivas sobre una copia deben poder deshacerse; para operaciones grandes, guardar snapshots incrementales o deltas.

### 11.3 Aceleración y Android

- BVH para picking y distancias.
- Índice espacial para vecinos.
- Procesamiento por regiones/chunks.
- Worker threads con cancelación.
- GPU para visualización y ciertos kernels paralelos, sin depender de GPU para consistencia geométrica.
- Límite de triángulos y memoria por dispositivo configurable.
- Vista previa de baja resolución antes de ejecutar operación completa.
- No bloquear gestos/cámara mientras se calcula.
- Liberar buffers temporales y evitar duplicar varias veces la malla completa.

---

## 12. Prioridad de producto

### P0 — edición mínima real de STL
- seleccionar objeto;
- mover/rotar/escalar;
- medir bounds;
- separar componentes;
- corte por plano;
- diagnóstico básico de manifold/bordes abiertos;
- recalcular normales;
- eliminar degenerados;
- historial y revertir.

### P1 — reparación y edición de elementos
- selección cara/arista/vértice;
- mover vértices;
- extruir caras/regiones;
- split/collapse/bevel de arista de malla;
- rellenar agujeros;
- weld controlado;
- decimate y smooth;
- booleanos de malla robustos.

### P2 — remallado y escaneo
- isotropic/adaptive remesh;
- point clouds;
- estimación/orientación de normales;
- registro ICP;
- Alpha/BPA/Poisson;
- comparación de desviación.

### P3 — reconstrucción CAD
- detección/ajuste de primitivas;
- segmentación de superficies;
- NURBS fit;
- curvas límite y sewing;
- sólido B-rep validado;
- export STEP con informe de error.

No bloquear edición básica de STL esperando a terminar reverse engineering.

---

## 13. Matriz de pruebas: 72 casos

### Selección y topología
1. Picking de objeto con malla densa.
2. Picking de cara pequeña.
3. Picking de arista próxima a otra.
4. Picking de vértice superpuesto.
5. Ciclar candidatos de selección.
6. Lupa táctil no tapa objetivo.
7. Lazo visible-only.
8. Lazo through-selection.
9. Pincel con radio en píxeles estable al zoom.
10. Selección de edge loop.
11. Selección de ring.
12. Selección por ángulo.
13. Selección conectada.
14. IDs persistentes tras operación local.
15. Invalidar selección cuando no hay mapping.

### Edición
16. Mover vértice libre.
17. Mover vértice por eje.
18. Mover vértice por plano.
19. Snap a vértice.
20. Weld dentro de tolerancia.
21. No weld de superficies separadas funcionalmente.
22. Split edge.
23. Collapse edge.
24. Flip diagonal.
25. Dissolve edge.
26. Bevel de malla.
27. Extrusión de región.
28. Inset de caras.
29. Delete y fill.
30. Separar selección en objeto nuevo.

### Reparación
31. Eliminar NaN/Inf.
32. Eliminar triángulos degenerados.
33. Fusionar duplicados.
34. Detectar aristas boundary.
35. Detectar non-manifold.
36. Orientar winding.
37. Recalcular normales sin cambiar topología.
38. Rellenar agujero pequeño.
39. Rellenar agujero complejo con preview.
40. No rellenar abertura intencional automáticamente.
41. Reparación no modifica fuente.
42. Verificación posterior detecta auto-intersección.
43. Separar unión non-manifold.
44. Eliminar componente pequeño solo con confirmación.

### Remesh y booleanos
45. Remesh uniforme.
46. Remesh adaptativo.
47. Proteger sharp edges.
48. Proteger UV seams.
49. Smooth con límite de desplazamiento.
50. Decimate preservando silueta.
51. Booleano unión de sólidos de malla.
52. Booleano diferencia.
53. Booleano intersección.
54. Corte por plano conserva ambos lados.
55. Fallo por contacto tangencial no altera originales.
56. Coplanaridad degenerada genera diagnóstico.

### Reverse engineering
57. Nube sin normales.
58. Estimar normales.
59. Orientar normales.
60. Registro de dos escaneos.
61. ICP con error residual.
62. Alpha shape en nube.
63. BPA con radios distintos.
64. Poisson con depth bajo/alto.
65. Ajuste de plano.
66. Ajuste de cilindro.
67. Ajuste de esfera.
68. Ajuste de superficie libre.
69. Coser superficies a shell.
70. Rechazar shell abierto como sólido.
71. Mapa de desviación malla vs CAD.
72. Export STEP y reimportar para verificar tolerancia.

Cada prueba registra dispositivo, versión de algoritmo, RAM, tiempo, pico de memoria, número de elementos, tolerancias, error geométrico, resultado topológico y estado de cámara.

---

## 14. Criterios de aceptación

- La selección es usable con dedo y mantiene precisión en zoom variable.
- Operaciones de malla se distinguen claramente de operaciones CAD exactas.
- Toda reparación se previsualiza y se ejecuta sobre derivado.
- El diagnóstico antes/después muestra qué defectos se resolvieron y cuáles permanecen.
- La reducción y suavizado informan desviación y preservación de features.
- Booleanos exigen precondiciones y fallan sin corromper entradas.
- Reverse engineering declara método, parámetros y error.
- Una superficie reconstruida solo se etiqueta como sólido CAD tras validación topológica.
- El original permanece recuperable.
- La cámara no cambia por operaciones/importaciones salvo comando explícito.

---

## 15. Fuentes públicas principales

- CGAL Polygon Mesh Processing: https://cgal.geometryfactory.com/CGAL/doc/main/Polygon_mesh_processing/index.html
- CGAL Polygon Mesh Repair: https://cgal.geometryfactory.com/CGAL/doc/main/PMP_Mesh_repair/index.html
- CGAL 6.1 remeshing/corefinement: https://doc.cgal.org/6.1/Polygon_mesh_processing/index.html
- Open3D Surface Reconstruction: https://www.open3d.org/docs/latest/tutorial/geometry/surface_reconstruction.html
- FreeCAD Mesh to Shape: https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/Arch_MeshToShape.md

### Lectura crítica de las fuentes
CGAL ofrece operaciones avanzadas de reparación, remallado y booleanos, pero la licencia debe evaluarse por paquete/versión antes de integrarlo en un producto comercial. La documentación de reparación señala límites reales: el relleno de agujeros complejos puede crear auto-intersecciones. Open3D aporta métodos de reconstrucción de nube a malla, pero no convierte automáticamente el resultado en un B-rep paramétrico. FreeCAD documenta una conversión de malla a shape optimizada para caras planas; esto ilustra que “mesh to shape” puede significar un B-rep facetado, no recuperar las superficies CAD originales.

## 16. Incertidumbres para POC

- Memoria y rendimiento de half-edge/BVH en móviles Android de gama baja.
- Umbrales de triángulos para edición táctil en tiempo real.
- Calidad de booleanos de malla en casos coplanares y tangenciales.
- Comportamiento de reparación ante escaneos ruidosos y mallas con auto-intersecciones.
- Coste y licencia de CGAL por paquete y configuración de distribución.
- Rendimiento de Poisson/ICP en ARM64 y necesidad de reducir nube.
- Calidad de ajuste NURBS con escaneos de baja densidad.
- Transferencia de UV/materiales/IDs durante remesh y decimation.

**Conclusión:** La edición de STL debe ser una capacidad de primera clase, pero basada en topología de malla y herramientas propias. El reverse engineering será una etapa avanzada que produce geometría nueva con error medible. La aplicación debe mostrar siempre qué conserva, qué modifica y qué aproximación está realizando.
