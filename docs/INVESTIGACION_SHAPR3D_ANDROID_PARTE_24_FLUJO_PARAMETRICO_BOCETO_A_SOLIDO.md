# Investigación NOCTURNE — Parte 24
## Flujo paramétrico integrado: del boceto 2D al sólido 3D editable

**Fecha:** 2026-10-31  
**Plataforma objetivo:** Android  
**Estado:** investigación y especificación; no implica implementación ni APK.

---

## 1. Objetivo

Definir un flujo coherente en el que un boceto 2D restringido impulse operaciones 3D y el modelo conserve relaciones editables. No basta con ejecutar una extrusión y guardar el resultado como malla: el documento debe recordar el perfil, sus cotas, restricciones, operación, parámetros y referencias.

La meta funcional:
1. Crear o seleccionar un plano.
2. Entrar en Sketch.
3. Dibujar perfiles 2D con precisión táctil.
4. Aplicar restricciones geométricas y cotas.
5. Validar que el perfil sea apto para la operación.
6. Crear Extrude/Revolve/Sweep/Loft u otra operación.
7. Guardar parámetros y dependencias.
8. Editar posteriormente el boceto o la operación.
9. Regenerar las operaciones posteriores de forma determinista.
10. Diagnosticar fallos de referencias sin destruir el documento.

Este documento define comportamiento objetivo para NOCTURNE; no afirma que cada detalle sea idéntico o esté disponible en Shapr3D.

## 2. Modelo mental y entidades

### 2.1 Documento paramétrico

El documento no es una colección plana de mallas. Debe tener:
- parámetros y variables;
- sketches;
- planos/ejes de construcción;
- features/operaciones;
- cuerpos y componentes;
- referencias geométricas;
- materiales y apariencias;
- árbol de historial;
- estado de regeneración;
- snapshots/caché para visualización.

### 2.2 Sketch

Un Sketch contiene:
- plano soporte y sistema de coordenadas local;
- entidades: punto, línea, arco, círculo, elipse, spline, polilínea;
- geometría de construcción y geometría normal;
- cotas;
- restricciones;
- relaciones con geometría proyectada;
- perfiles/regiones cerradas derivados;
- estado de solución y grados de libertad.

Las entidades proyectadas deben distinguirse de geometría nativa y mantener referencia a la fuente cuando sea posible.

### 2.3 Feature

Cada operación debe guardar:
- identificador estable;
- tipo de operación;
- parámetros y unidades;
- referencias a sketches/caras/aristas/ejes;
- cuerpo de entrada y salida;
- estado (válido, advertencia, fallido, suprimido);
- versión de algoritmo/kernel;
- resultado/caché;
- dependencias upstream/downstream.

### 2.4 Identificadores estables y referencias

No usar índices de caras/aristas del kernel como identidad persistente. Un cambio de topología puede reordenarlos. Crear ReferenceResolver que almacene contexto geométrico y semántico:
- entidad fuente;
- tipo topológico;
- superficie/curva de soporte;
- posición, orientación, área/longitud y centroide aproximados;
- relación con feature creadora;
- vecindad/topología;
- historial de evolución topológica cuando el kernel lo proporcione.

Resolver referencias tras regenerar con criterios y tolerancias. Si hay varias candidatas, pedir resolución al usuario. No reasignar silenciosamente una referencia crítica a otra cara.

## 3. Flujo de boceto

### 3.1 Entrada y plano

- Seleccionar plano XY/YZ/ZX, cara plana o plano de construcción.
- Vista normal al plano al entrar, con orientación estable.
- Mostrar rejilla, ejes y origen.
- Permitir crear plano desplazado/angulado.
- Al salir, restaurar orientación/cámara previa de manera predecible; no aplicar zoom inesperado.

### 3.2 Dibujo y snapping

Herramientas base: línea, rectángulo, círculo, arco, polilínea, spline, elipse y polígono. Soportar:
- snap a origen, extremos, punto medio, centro, cuadrantes, intersecciones y proyección;
- guías temporales y alineaciones;
- inferencia horizontal/vertical/perpendicular/paralela/tangente;
- entrada numérica durante dibujo;
- cierre de perfil con coincidencia real, no solo proximidad visual;
- geometría de construcción;
- trim, extend, offset, mirror y pattern.

Cada snap debe tener prioridad, tolerancia en pantalla y tolerancia geométrica; no forzar una coincidencia ambigua.

### 3.3 Precisión táctil

- El hit target se define en píxeles/dp, no unidades CAD.
- Lupa de precisión al seleccionar puntos próximos.
- Preselección visible antes de confirmar.
- Teclado numérico contextual para cotas.
- Deshacer una acción sin abandonar el comando.
- Confirmar/cancelar mediante controles visibles; no depender de atajos físicos.
- Teclado Android no debe tapar el punto activo ni los parámetros esenciales.

## 4. Restricciones y solver

### 4.1 Restricciones geométricas

Implementar al menos:
- coincidente;
- horizontal/vertical;
- paralelo/perpendicular;
- tangente;
- igual;
- concéntrico;
- punto sobre objeto;
- punto medio;
- simetría;
- colineal;
- fijo;
- distancia/longitud;
- radio/diámetro;
- ángulo.

Aplicación automática solo cuando la inferencia sea inequívoca. Debe existir control para desactivar auto-constraints y eliminar una restricción concreta.

### 4.2 Grados de libertad

El solver debe informar:
- totalmente restringido;
- subrestringido con DOF restantes;
- sobre-restringido;
- inconsistente;
- no convergente.

No colorear un sketch como “completamente definido” si quedan DOF ocultos. Mostrar qué entidades pueden moverse y permitir localizar restricciones conflictivas.

### 4.3 Solver numérico

Formular restricciones como ecuaciones residuales y resolver iterativamente con Jacobiano, estrategia sparse y tolerancias. Necesita:
- escalado de variables y unidades;
- damping/trust region;
- inicialización desde la solución anterior;
- detección de redundancia y dependencia;
- diagnóstico de singularidad;
- estabilidad ante geometría casi degenerada.

No asumir que un único método resuelve todos los casos. Evaluar solver dedicado de sketch frente a formulación general. Mantener solución estable al arrastrar y no permitir que una pequeña variación salte a otra rama geométrica sin aviso.

### 4.4 Restricciones y cotas como fuente de verdad

Una cota conductora modifica la geometría; una cota de referencia mide sin conducir. Mostrar la distinción. Expresiones y variables deben tener dependencias explícitas y unidades compatibles.

## 5. Validación de perfiles para operaciones

Antes de crear un feature, analizar:
- lazos cerrados;
- extremos coincidentes;
- autointersecciones;
- segmentos de longitud casi cero;
- contornos duplicados;
- lazos anidados;
- orientación de contornos;
- regiones ambiguas;
- perfiles abiertos cuando la operación los admita.

Extrude de sólido suele requerir regiones cerradas; Extrude de superficie puede admitir perfiles abiertos según kernel. No cerrar automáticamente huecos que el usuario no haya querido cerrar.

Para perfiles múltiples, identificar regiones y agujeros con nesting. Mostrar previsualización coloreada y error en la entidad responsable.

## 6. Operaciones que consumen sketches

### 6.1 Extrude

Parámetros:
- distancia;
- dirección normal/invertida/vector;
- simétrica o una/dos direcciones;
- hasta cara/plano/cuerpo cuando exista soporte fiable;
- operación nueva/unir/cortar/intersectar;
- draft/taper;
- alcance/cuerpo objetivo.

Guardar el sketch fuente y todos los parámetros. Al editar la distancia o el sketch, regenerar el feature. Distinguir extrusión de sólido y de superficie.

### 6.2 Revolve

- perfil y eje;
- ángulo (incluye parcial y 360°);
- dirección/simetría;
- nuevo/unir/cortar;
- validación de intersección con eje;
- límites y autointersecciones.

Eje puede ser línea de sketch, eje de construcción o arista lineal referenciada.

### 6.3 Sweep

- perfil;
- trayectoria;
- orientación del perfil (normal, fija, binormal u opciones soportadas);
- escala/twist si procede;
- mantener perpendicularidad;
- controlar esquinas y continuidad;
- comprobar auto-intersección y torsión.

### 6.4 Loft

- perfiles ordenados;
- conectores/puntos de correspondencia;
- guías;
- continuidad y condiciones de borde;
- cierre;
- sólido/superficie;
- diagnóstico de perfiles incompatibles.

### 6.5 Operaciones derivadas

Patrones, mirror, shell, fillet, chamfer, split y booleanos deben ser features del árbol con parámetros, no solo cambios de malla sin procedencia. Cuando una operación no pueda regenerarse, conservar último resultado válido y mostrar estado fallido.

## 7. Historial paramétrico y regeneración

### 7.1 Grafo de dependencias

Aunque la UI muestre árbol secuencial, internamente mantener DAG:
- Sketch → Extrude;
- Plane → Sketch;
- Feature → Face/Edge reference → downstream feature;
- Variable → Dimension → Sketch/Feature;
- Component → instance/assembly relation.

Cambiar un nodo invalida únicamente dependientes. Features no afectados mantienen resultado/caché.

### 7.2 Transacción de edición

Al editar:
1. capturar estado actual;
2. aplicar cambio en copia/transacción;
3. resolver sketch;
4. regenerar dependientes en orden topológico;
5. validar cada resultado;
6. actualizar visualización atómicamente si todo es aceptable;
7. si falla, conservar último estado válido y permitir corregir/revertir.

No dejar un documento parcialmente regenerado o con geometría que no corresponde a los parámetros mostrados.

### 7.3 Estados y errores

Estados: limpio, sucio, regenerando, válido, advertencia, fallido, suprimido. Mostrar fallo en el feature exacto, no solo un mensaje genérico. Permitir editar parámetros, cambiar referencia, suprimir feature o volver a versión anterior.

### 7.4 Topological naming

Las referencias a caras/aristas son uno de los riesgos centrales del CAD paramétrico. No basarse en “Face17”. Resolver con:
- feature creadora;
- tipo de entidad;
- superficie/curva subyacente;
- centroide y medidas;
- orientación;
- adyacencias;
- evolución de topología;
- contexto de selección.

Si dos caras son equivalentes, pedir al usuario elegir. Registrar referencia ambigua como tal.

## 8. Variables, expresiones y unidades

- Variables globales y locales.
- Nombres únicos y alcance.
- Expresiones matemáticas controladas (sin ejecutar código arbitrario).
- Dependencias acíclicas.
- Unidades dimensionales: longitud, ángulo, área, volumen y unidades derivadas.
- Conversión explícita.
- Mensaje ante incompatibilidad dimensional.
- Recalcular cotas/features dependientes al cambiar variable.
- Evitar ciclos y mostrar la ruta de dependencia.

Ejemplo conceptual: ancho = 2 * radio; altura = ancho + 5 mm. No aceptar suma de longitud con ángulo.

## 9. Importación y geometría de referencia

Un cuerpo importado puede:
- servir como referencia visual;
- aportar aristas/caras proyectadas a Sketch;
- ser transformado;
- recibir operaciones de malla si es mesh;
- ser objetivo de booleanos si representación y validez lo permiten.

No inventar historial paramétrico anterior al archivo importado. El historial empieza en las operaciones creadas en NOCTURNE. Las referencias proyectadas deben marcarse como vinculadas o copiadas; si la fuente cambia, avisar y permitir actualizar.

## 10. UI Android del flujo completo

Propuesta de etapas visibles sin saturar pantalla:
- modo Sketch con barra contextual;
- panel de restricciones/cotas contextual;
- botón de terminar sketch;
- selección de región;
- tarjeta de parámetros de feature;
- árbol de historial plegable;
- estado de regeneración y errores.

Panel lateral colapsable por icono; no ocupar pantalla permanentemente. La herramienta activa debe tener confirmación/cancelación clara. En móvil, mostrar controles críticos cerca del área de trabajo sin tapar geometría. Gestos de cámara no deben activar accidentalmente dibujo o selección.

## 11. Persistencia y compatibilidad

Guardar:
- sketches, entidades y IDs;
- restricciones y cotas;
- variables/expresiones;
- referencias;
- features y parámetros;
- versiones de kernel/algoritmos;
- estado/cachés reconstruibles;
- diagnósticos y último resultado válido.

Al abrir en una versión nueva:
- migrar esquema de documento;
- regenerar si hace falta;
- comparar resultado;
- mantener copia de seguridad;
- no perder silenciosamente features desconocidos; preservar como nodo no editable/resultado cacheado.

Export STEP/STL no preserva todo el árbol paramétrico. El archivo nativo de NOCTURNE sí debe preservarlo.

## 12. Arquitectura propuesta

Servicios:
- SketchEntityModel;
- ConstraintGraph;
- SketchSolver;
- ProfileRegionBuilder;
- FeatureDefinition/FeatureExecutor;
- DependencyGraph;
- ReferenceResolver;
- TopologyEvolutionMap;
- RecomputeScheduler;
- TransactionManager;
- ParameterExpressionEngine;
- UnitSystem;
- DocumentSerializer/Migrator;
- FeatureDiagnostics.

Cada feature define inputs, outputs, parámetros, validador, dependencias y serialización. Kernel CAD encapsulado detrás de una interfaz; UI no llama directamente a OCCT/Parasolid.

## 13. Plan de implementación por incrementos

P0:
- Sketch 2D sobre planos principales;
- líneas, rectángulos y círculos;
- coincidencia, horizontal/vertical, cotas lineales/radio;
- perfil cerrado;
- Extrude de sólido;
- árbol mínimo y edición de distancia;
- undo/redo y persistencia.

P1:
- arcos, polígonos, trim, offset;
- restricciones paralela/perpendicular/tangente/igual;
- solver con DOF y diagnóstico;
- Revolve;
- variables y expresiones simples.

P2:
- spline/elipse;
- Sweep y Loft;
- patrones/mirror;
- referencias proyectadas;
- ReferenceResolver y evolución topológica;
- recomputación incremental.

P3:
- cotas/solver avanzados;
- referencias complejas a caras/aristas;
- dependencias multi-cuerpo;
- operaciones de superficie;
- robustez de migración y documentos grandes.

La paridad funcional se valida por flujo completo, no por presencia de botones.

## 14. Matriz de regresión: 70 pruebas

**Sketch y precisión**
1. Sketch en XY.
2. Sketch en cara plana.
3. Plano desplazado.
4. Línea con entrada numérica.
5. Rectángulo con ancho/alto.
6. Círculo por centro/radio.
7. Arco con extremos.
8. Spline con puntos.
9. Snap a origen.
10. Snap a punto medio.
11. Snap intersección.
12. Guía horizontal/vertical.
13. Lupa táctil.
14. Zoom no altera tolerancia de selección en píxeles.
15. Cancelar comando sin geometría parcial.

**Solver**
16. Coincidente cierra perfil.
17. Horizontal/vertical.
18. Paralelo/perpendicular.
19. Tangencia.
20. Igualdad.
21. Concéntrico.
22. Punto medio.
23. Simetría.
24. Cota conductora.
25. Cota de referencia.
26. DOF correcto.
27. Sketch totalmente restringido.
28. Sketch sobre-restringido.
29. Restricciones redundantes.
30. Geometría inconsistente.
31. Solver no converge.
32. Arrastre no salta de rama.

**Perfiles/features**
33. Perfil cerrado válido.
34. Perfil abierto rechazado para extrusión sólida.
35. Hueco interior reconocido.
36. Contornos múltiples.
37. Autointersección detectada.
38. Segmento degenerado.
39. Extrude distancia exacta.
40. Extrude simétrico.
41. Extrude unir.
42. Extrude cortar.
43. Extrude intersectar.
44. Revolve 360°.
45. Revolve parcial.
46. Eje inválido.
47. Sweep con trayectoria válida.
48. Sweep auto-intersecta.
49. Loft perfiles ordenados.
50. Loft perfiles incompatibles.

**Historial y regeneración**
51. Editar cota actualiza sketch.
52. Editar sketch regenera extrusión.
53. Cambiar variable actualiza features.
54. Dependiente se invalida.
55. No dependiente conserva caché.
56. Fillet downstream mantiene referencia válida.
57. Cara de referencia desaparece.
58. Referencia ambigua solicita resolución.
59. Feature fallido conserva último resultado.
60. Recompute cancelado no deja estado parcial.
61. Undo/redo transaccional.
62. Guardar/abrir conserva árbol.
63. Migrar documento de versión anterior.
64. Nodo de feature desconocido se conserva.

**Importación/Android**
65. Proyectar arista de STEP a Sketch.
66. Referenciar malla sin tratarla como B-rep.
67. Teclado no tapa cota.
68. Panel lateral plegado.
69. Operación pesada no bloquea cámara.
70. Cambiar sketch no altera encuadre inesperadamente.

Registrar parámetros, unidades, kernel, tiempos, estado del solver, topología, cámara y resultado de regeneración.

## 15. Criterios de aceptación

El flujo está listo cuando un usuario crea un perfil, lo restringe y acota, genera un sólido, edita el sketch o la operación y observa regeneración coherente. Referencias perdidas se diagnostican sin reasignación silenciosa. Undo/redo, guardado y reapertura conservan árbol y parámetros. La UI Android permite completar el flujo con táctil sin paneles permanentes ni saltos de cámara.

## 16. Incertidumbres técnicas

- Elección e integración del solver de restricciones.
- Robustez del ReferenceResolver/topological naming.
- Rendimiento de regeneración en ARM64.
- Compatibilidad de features avanzados entre kernels.
- Estrategia de migración del documento nativo.
- Persistencia de referencias a geometría importada.
- Límites de complejidad de sketch y tamaño de DAG en dispositivos modestos.

## 17. Fuentes y marco técnico

- OCCT Modeling Data: https://dev.opencascade.org/doc/overview/html/occt_user_guides__modeling_data.html
- OCCT Modeling Algorithms: https://dev.opencascade.org/doc/overview/html/occt_user_guides__modeling_algos.html
- OCCT STEP guide: https://github.com/Open-Cascade-SAS/OCCT/blob/master/dox/user_guides/step/step.md
- CGAL Polygon Mesh Processing (para distinguir ruta de mallas): https://doc.cgal.org/6.1/Polygon_mesh_processing/index.html
- SolveSpace, solver paramétrico de código abierto: https://github.com/solvespace/solvespace
- FreeCAD Sketcher documentation: https://wiki.freecad.org/Sketcher_Workbench
- Android Storage Access Framework, para persistencia y selección de documentos: https://developer.android.com/training/data-storage/shared/documents-files

Las fuentes describen componentes técnicos y proyectos de referencia, no certifican que una arquitectura concreta funcione en Android sin pruebas. Licencias y compatibilidad de cada dependencia deben verificarse antes de integrar.

**Conclusión:** el corazón paramétrico de NOCTURNE debe preservar la intención de diseño: sketch, restricciones, cotas, features, referencias y dependencias. El resultado 3D es regenerable a partir de esa definición, no un objeto opaco que solo puede editarse deformando su malla.
