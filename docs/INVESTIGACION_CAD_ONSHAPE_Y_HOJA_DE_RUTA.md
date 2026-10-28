# Investigación técnica: Onshape y hoja de ruta CAD para NOCTURNE STUDIO 3D
Fecha de investigación: 2026-10-28
Repositorio objetivo: `emhyrcoreblack-ctrl/nocturne-studio-3d`
Alcance: análisis de documentación pública, arquitectura observada en el `index.html` actual y plan de implementación. No es una copia del código propietario de Onshape.

## 1. Resumen ejecutivo

La prioridad no es añadir botones aislados: es separar la aplicación en capas con contratos claros:
1. Navegación/cámara 3D.
2. Geometría de bocetos 2D y coordenadas de trabajo.
3. Modelo geométrico y kernel (malla frente a B-rep).
4. Operaciones paramétricas y dependencias.
5. Selección/topología y referencias estables.
6. Interfaz, historial, importación/exportación y pruebas.

El principal límite técnico actual es que NOCTURNE es una escena Three.js con algunas formas de malla. Aún no es un CAD paramétrico de sólidos: el árbol actual muestra etiquetas de operaciones, pero no reconstruye un grafo de funciones y dependencias; la extrusión usa `THREE.ExtrudeGeometry`; la importación es STL (malla triangular). Las operaciones booleanas CAD robustas y el recálculo paramétrico necesitan un diseño adicional y probablemente un kernel geométrico específico.

## 2. Hallazgos de la documentación pública de Onshape

### 2.1 Modelo paramétrico y FeatureScript
La documentación de FeatureScript describe cada tipo de función como una función, cada elemento del árbol como una llamada con parámetros, y el Part Studio como una secuencia de llamadas cuya salida es la geometría final. La biblioteca estándar implementa funciones como extrusión y redondeo. Esto respalda un enfoque declarativo: guardar parámetros y referencias, no solo la malla final.
Fuente: https://cad.onshape.com/FsDoc/intro.html
Fuente: https://cad.onshape.com/FsDoc/index.html

### 2.2 Bocetos y restricciones
Las herramientas documentadas incluyen línea, rectángulos por esquina/centro, círculos, arcos, splines, puntos y geometría de construcción. Las restricciones incluyen coincidente, concéntrica, paralela, tangente, horizontal, vertical, perpendicular, igual, punto medio, simetría y fijación. Las cotas pueden ser conductoras o de referencia. El estado del boceto se comunica visualmente: infrarrestringido, totalmente restringido o con conflictos.
Fuentes:
- https://cad.onshape.com/help/es/Content/Sketch/sketch_tools.htm
- https://cad.onshape.com/help/es/Content/Sketch/working_with_constraints.htm
- https://cad.onshape.com/help/Content/Sketch/dimension.htm

Implicación para NOCTURNE: separar entidades de boceto (datos geométricos) de su representación visual; usar unidades y coordenadas de plano explícitas; introducir inferencias/snap como ayuda, sin confundirlas con restricciones persistentes; validar perfiles cerrados antes de generar sólidos. Un solver de restricciones es una fase avanzada, no debe simularse con posiciones de pantalla.

### 2.3 Extrusión
Onshape documenta modos de creación sólido/superficie/delgado; resultados Nuevo/Agregar/Quitar/Intersecar; condiciones de fin ciego, hasta siguiente/cara/pieza/vértice y a través de todo; dirección invertida, dirección personalizada, inicio desplazado, simetría, segundo extremo, ángulo de desmoldeo y ámbito de fusión.
Fuentes:
- https://cad.onshape.com/help/es/Content/PartStudio/extrude.htm
- https://cad.onshape.com/FsDoc/library.html

Implicación: el panel de extrusión debe ser un formulario tipado y validado, con vista previa, referencia a perfiles y parámetros guardados. No etiquetar una operación como “Quitar” o “Agregar” si solo se crea una malla separada.

### 2.4 Revolución, barrido y loft
- Revolución: perfiles alrededor de un eje, revolución completa o angular, dirección, simetría y condiciones de fin.
- Barrido: perfil + trayectoria; puede controlar orientación, giro y escala; los perfiles abiertos pueden crear superficies o sólidos delgados.
- Loft: al menos dos perfiles ordenados, con perfiles intermedios y condiciones de continuidad/guía según soporte.
Fuentes:
- https://cad.onshape.com/help/es/Content/PartStudio/revolve.htm
- https://cad.onshape.com/help/es/Content/PartStudio/sweep.htm
- https://cad.onshape.com/help/Content/PartStudio/loft.htm

Implicación: modelar cada función como una definición con entradas, parámetros, salida y diagnóstico. No implementar una operación avanzada antes de disponer de geometría fiable, perfiles válidos y referencias a entidades.

### 2.5 Booleanas
Onshape separa unión, sustracción e intersección; en sustracción distingue cuerpos objetivo y herramientas, y puede conservar herramientas. Varias funciones de creación permiten además definir el comportamiento booleano como parte de la propia operación.
Fuentes:
- https://cad.onshape.com/help/es/Content/PartStudio/boolean.htm
- https://www.onshape.com/en/resource-center/tech-tips/tech-tip-booleans
- https://cad.onshape.com/FsDoc/library.html

Implicación: la operación necesita seleccionar sólidos reales, verificar validez y distinguir contacto, solapamiento y separación. Un simple solapamiento visual entre mallas no equivale a una unión B-rep válida.

### 2.6 Historial, rollback y referencias
La interfaz de Onshape documenta un árbol de funciones paramétricas con barra de rollback, que permite observar el estado del modelo en una etapa anterior.
Fuente: https://cad.onshape.com/help/Content/ui-basics.htm
Fuente complementaria de versiones/historial: https://www.onshape.com/en/resource-center/tech-tips/restore-cad-model-design-version-after-unwanted-changes

Implicación: el historial de NOCTURNE debe ser una secuencia versionada de definiciones de operaciones, con dependencias explícitas, estados de éxito/error y capacidad de reconstrucción. La lista actual de nombres es solo un registro visual y no debe presentarse como historial paramétrico completo.

## 3. Ingeniería inversa permitida y límites

No se requiere ni se propone descompilar ni acceder a código privado. El análisis se limita a:
- Documentación pública y tutoriales oficiales.
- FeatureScript y biblioteca estándar que Onshape publica para consulta.
- API pública y ejemplos permitidos.
- Comportamiento observable de flujos de trabajo.
- Proyectos de código abierto con licencia compatible.

Objetivo: reproducir principios generales de UX y arquitectura CAD, no copiar implementación, marca, código o recursos protegidos.

## 4. Navegación 3D: diagnóstico y propuesta

La documentación de Three.js indica que `OrbitControls` separa órbita, dolly/zoom y pan; un dedo rota, dos dedos hacen dolly/pan, y `zoomToCursor` puede enfocar el zoom hacia el cursor. También expone límites de distancia, velocidades, amortiguación y objetivo de órbita.
Fuente: https://threejs.org/docs/pages/OrbitControls.html
Código de referencia alternativo (proyecto comunitario): https://github.com/pmndrs/three-stdlib/blob/main/src/controls/OrbitControls.ts

En el código actual:
- Se importa `TrackballControls`, no `OrbitControls`.
- `zoomSpeed=0.35`, `panSpeed=0.22`, amortiguación dinámica 0.12.
- El comentario explícitamente fija el zoom al objetivo/origen y no al cursor.
- `controls.target` comienza en (0,0,0); el encuadre del modelo también recentra el objeto.
- El panel móvil se oculta por CSS y se abre con un botón; la zona canvas declara `touch-action:none`.
- Hay varias funciones de vista/cámara y código de orientación; hay que probarlas en contexto antes de reemplazar controles.
- El cubo de orientación usa un segundo renderer WebGL sobre un canvas pequeño; en dispositivos limitados conviene medir el coste y asegurar liberación de recursos.

Propuesta de navegación (sin tocar la implementación hasta poder probarla):
1. Definir tabla de gestos por dispositivo: mouse izquierda = órbita; rueda = zoom; mouse medio o derecho = pan; un dedo = órbita; pellizco = zoom; dos dedos arrastrando = pan según una regla consistente.
2. Elegir una sola librería/control principal; evitar que listeners personalizados compitan con los controles.
3. Configurar límites de zoom en relación al tamaño de la escena, no valores arbitrarios universales.
4. Mantener un objetivo de órbita explícito y un comando “centrar/encuadrar selección”.
5. Probar zoom hacia cursor con `OrbitControls.zoomToCursor` si se adopta esa API; verificar interacción táctil real, porque “zoom hacia cursor” en pantalla táctil requiere interpretar el centro del pellizco.
6. Al cambiar de plano/vista, conservar el objetivo y la distancia salvo que la acción sea “encuadrar”.
7. No modificar a la vez cámara, planos, controles y layout en un solo commit.
8. Incluir pruebas manuales en móvil y escritorio con una pieza pequeña, una grande, un STL descentrado y escena vacía.

Criterios de aceptación del zoom:
- Acercar/alejar no cambia la geometría ni la escala del modelo.
- El punto de enfoque no salta de forma inesperada.
- Pellizco no rota la cámara accidentalmente.
- La cámara no atraviesa el modelo ni queda bloqueada fuera de rango.
- “Centrar vista” recupera una vista utilizable.
- Las vistas ortogonales conservan orientación correcta.
- No se degrada el control de cubo ni la selección de planos.

## 5. Estado observado del código actual

Archivo revisado: `index.html` en rama principal (blob observado: `1e2354bcaefe1986803f7b35de678e7fc99dbe88`).

Capacidades presentes:
- Escena Three.js, cámara perspectiva, luces, rejillas y tres planos XY/XZ/YZ.
- Selector de plano, cubo de orientación y menú de perspectivas.
- Rectángulo/círculo parametrizados con extrusión básica.
- Dibujo libre mediante puntos en un plano y extrusión de un perfil cerrado.
- Importación y exportación STL.
- Escala uniforme y cambio de color/material.
- Panel lateral plegable en móvil.

Límites técnicos detectados:
- La geometría se genera como malla Three.js; no hay kernel CAD B-rep en este archivo.
- El STL se importa como geometría triangulada; no recupera características paramétricas ni historial de diseño.
- `operationHistory` contiene cadenas descriptivas, no definiciones editables ni grafo de dependencias.
- `setModel` reemplaza el modelo actual; no hay gestión robusta de varios cuerpos.
- La extrusión dibujada no muestra un solver de restricciones/cotas, ni una comprobación completa de autointersecciones y perfiles complejos.
- No hay selección topológica CAD completa de caras/aristas/vértices ni referencias persistentes a ellas.
- El comando de escala modifica el objeto y vuelve a encuadrarlo; esto debe validarse para que el usuario no lo confunda con zoom.
- La acción de proyección cambia a cámara ortográfica, pero el texto de interfaz indica que volver a perspectiva requiere recargar; diseñar un cambio reversible de tipo de cámara.
- En la vista de orientación se crean recursos WebGL y materiales/canvas; planificar su ciclo de vida y pruebas de rendimiento.
- Las funciones de plano y de cámara necesitan pruebas de regresión, porque una modificación de orientación puede cambiar la percepción del tamaño de las rejillas sin modificar la geometría.

## 6. Arquitectura objetivo

### Fase 0 — Seguridad de cambios y reproducibilidad
- Crear una rama de trabajo para cada bloque.
- Guardar captura/medidas del comportamiento actual.
- Cambios pequeños y un propósito por commit.
- Comprobar el commit fuente y la versión desplegada antes de declarar una corrección.
- Mantener los planos y el panel visualmente estables mientras se arregla el zoom.

### Fase 1 — Navegación y viewport
- Extraer configuración de cámara/controles a un módulo.
- Separar órbita, pan, zoom, cambio de vista y encuadre.
- Agregar botón de restablecer cámara y límites por bounding box.
- Crear checklist de prueba móvil/escritorio.
- Solo entonces ajustar sensibilidad y zoom-to-cursor.

### Fase 2 — Modelo de datos y operaciones
Definición conceptual de operación:
`{ id, type, parameters, inputs, outputIds, status, error, version }`
- Parámetros con unidades explícitas (mm/radianes o grados en UI con conversión).
- Entradas referenciadas por identificadores de entidades/operaciones.
- Recalcular en orden topológico cuando un parámetro cambie.
- Deshacer/rehacer con comandos o snapshots controlados.
- Mostrar errores por operación sin destruir silenciosamente el último resultado válido.

### Fase 3 — Bocetos
- Estructura de datos de punto, línea, arco, círculo, polilínea, rectángulo y spline.
- Plano de boceto con transformación 2D↔3D formal.
- Ajuste a rejilla, origen, puntos finales, puntos medios y entidades existentes.
- Validación de perfiles cerrados, duplicados, autointersecciones y orientación.
- Herramienta de cota y restricciones básicas.
- Más adelante, solver de restricciones; estudiar SolveSpace como referencia abierta y evaluar licencia/compatibilidad antes de integrar código.

Referencias de solver:
- https://solvespace.readthedocs.io/en/latest/
- https://solvespace.com/tech.pl
- https://github.com/solvespace/solvespace/blob/master/exposed/DOC.txt

### Fase 4 — Kernel geométrico
Para CAD sólido fiable, evaluar un kernel B-rep (por ejemplo Open CASCADE Technology) y las opciones de integración web/WASM, rendimiento, licencias, tamaño del paquete y mantenimiento. No asumir que Three.js puede sustituir al kernel: Three.js renderiza; un kernel modela y valida geometría exacta/topológica.
Fuentes:
- https://www.occt3d.com/dev/doc/overview/html/specification__boolean_operations.html
- https://www.occt3d.com/dev/doc/refman/html/class_b_rep_algo_a_p_i___boolean_operation.html

Alternativas para el corto plazo:
- Seguir con mallas para prototipos visuales y funciones sencillas, etiquetándolo claramente como modelado de malla.
- Para operaciones sólidas paramétricas robustas, hacer una prueba de concepto separada con kernel CAD antes de comprometerse a una integración grande.
- No implementar booleanas “falsas” ocultando/intersectando mallas en pantalla.

### Fase 5 — Operaciones de sólido en orden recomendado
1. Extrusión con Nuevo y parámetros editables.
2. Extrusión Agregar/Quitar/Intersecar cuando haya kernel/booleanas válidas.
3. Revolución.
4. Booleanas de sólidos.
5. Redondeo y chaflán.
6. Barrido y loft.
7. Vaciado, nervios, matrices y simetría.
Cada función debe tener vista previa, validación, edición, cancelación y prueba de regresión.

### Fase 6 — Importación/exportación
- Distinguir explícitamente malla STL de sólidos B-rep.
- Validar archivos, unidades y bounding box.
- Añadir formatos exactos (p. ej. STEP) solo cuando el kernel y el flujo estén listos.
- Conservar la malla original de un STL al aplicar transformaciones y no prometer edición paramétrica recuperada.
- Planificar materiales/texturas por separado de la definición geométrica.

## 7. Matriz de pruebas mínima

Navegación:
- Ratón y táctil; escena vacía y modelo importado.
- Zoom mínimo/máximo, zoom repetido, pinch y pan.
- Cambio XY/XZ/YZ y vistas estándar.
- Rotación bloqueada/desbloqueada.
- Encuadrar cubo, objeto descentrado y objeto de gran tamaño.

Bocetos:
- Rectángulo, círculo, perfil de 3+ puntos.
- Cierre de perfil, cancelación, cambio de plano.
- Perfil abierto, punto repetido, arista duplicada, autointersección.
- Dimensiones no válidas y unidades.

Operaciones:
- Extrusión positiva, valores vacíos/negativos, plano distinto.
- Modelo anterior preservado si falla la operación.
- Exportar/importar STL de la misma geometría.
- Booleanas solo tras disponer de kernel adecuado.
- Verificar que las modificaciones de parámetros actualizan las operaciones dependientes.

Despliegue:
- Validar el archivo fuente de GitHub y el recurso publicado por Pages.
- Abrir en caché limpia y con query versionada.
- Confirmar errores de consola y carga de módulos.
- No afirmar que se ha probado en móvil real si solo se ha revisado el código.

## 8. Priorización práctica

P0: no perder la apariencia estable; diagnosticar la publicación y corregir zoom con cambios aislados.
P1: navegación consistente y pruebas de regresión.
P2: bocetos como entidades de datos (no solo líneas de visualización).
P3: historial de operaciones real y parámetros editables.
P4: prueba de concepto de kernel B-rep y booleanas.
P5: ampliar funciones CAD de forma incremental.

## 9. Fuentes consultadas

1. Onshape FeatureScript introduction — https://cad.onshape.com/FsDoc/intro.html
2. Onshape FeatureScript index — https://cad.onshape.com/FsDoc/index.html
3. Onshape Standard Library — https://cad.onshape.com/FsDoc/library.html
4. Onshape sketch tools (Spanish) — https://cad.onshape.com/help/es/Content/Sketch/sketch_tools.htm
5. Onshape constraints (Spanish) — https://cad.onshape.com/help/es/Content/Sketch/working_with_constraints.htm
6. Onshape dimensions — https://cad.onshape.com/help/Content/Sketch/dimension.htm
7. Onshape extrude (Spanish) — https://cad.onshape.com/help/es/Content/PartStudio/extrude.htm
8. Onshape revolve (Spanish) — https://cad.onshape.com/help/es/Content/PartStudio/revolve.htm
9. Onshape sweep (Spanish) — https://cad.onshape.com/help/es/Content/PartStudio/sweep.htm
10. Onshape loft — https://cad.onshape.com/help/Content/PartStudio/loft.htm
11. Onshape boolean (Spanish) — https://cad.onshape.com/help/es/Content/PartStudio/boolean.htm
12. Onshape UI basics/history — https://cad.onshape.com/help/Content/ui-basics.htm
13. Three.js OrbitControls — https://threejs.org/docs/pages/OrbitControls.html
14. SolveSpace documentation — https://solvespace.readthedocs.io/en/latest/
15. SolveSpace constraint solver technology — https://solvespace.com/tech.pl
16. Open CASCADE Boolean operations — https://www.occt3d.com/dev/doc/overview/html/specification__boolean_operations.html
17. Open CASCADE Boolean API — https://www.occt3d.com/dev/doc/refman/html/class_b_rep_algo_a_p_i___boolean_operation.html

## 10. Decisiones pendientes antes de implementar
- ¿La app seguirá siendo un prototipo ligero basado en Three.js/mallas, o se aprueba una integración de kernel B-rep/WASM para CAD sólido real?
- ¿Qué navegadores/dispositivos son objetivo mínimo?
- ¿Qué formatos de intercambio son prioritarios después de STL?
- ¿Se prioriza primero navegación y bocetos o la prueba de kernel? Recomendación: navegación estable, bocetos de datos y luego prueba de kernel en una rama aislada.
