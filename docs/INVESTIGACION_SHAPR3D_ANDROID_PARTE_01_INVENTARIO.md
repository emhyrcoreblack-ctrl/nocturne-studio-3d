# Investigación Shapr3D — Inventario funcional inicial (Parte 1)

Fecha de consulta: 2026-10-31
Proyecto destino: NOCTURNE STUDIO 3D para Android
Estado: investigación inicial; no equivale a especificación completa ni a implementación.

## 1. Alcance de esta entrega

Esta primera parte establece el mapa oficial de la aplicación a partir del Manual y artículos públicos de Shapr3D consultados el 31-10-2026. Se identifican las familias de herramientas, el comportamiento documentado de algunas operaciones y los flujos de interacción táctil relevantes.

No se afirma haber inspeccionado todas las pantallas ni todos los estados internos. Cada herramienta requiere una ficha detallada y validación adicional con la versión concreta de la aplicación de referencia.

## 2. Plataforma objetivo y limitación de referencia

La página oficial de descarga consultada indica que Shapr3D está disponible para Windows, macOS, iPadOS y visionOS, y que Android no está soportado. Por tanto, Android será una plataforma nueva de destino para NOCTURNE, y la interacción táctil de iPadOS sirve como referencia observable, pero no puede asumirse que sea idéntica en todos los detalles a Android.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7859320619292-Download-Shapr3D

## 3. Mapa del Manual oficial

El índice del Manual oficial enumera estas áreas:

### 3.1 Controles y acceso
- Basic controls and access
- Controls, selection, accessing tools
- Selecting Geometry
- Notable points
- Accessing tools
- Move and copy items using the gizmo

### 3.2 Bocetos
- Sketch controls
- Sketch states, patterns, and dimensioning
- States of sketch points
- Sketch pattern constraint
- Editing sketch dimensions
- Defining your sketch plane
- Changing a sketch plane
- Sketch menu
- Sketching tools:
  - Automatic Line/Arc
  - Line
  - Arc
  - Spline
  - Rectangle
  - Circle
  - Ellipse
  - Polygon
  - Offset Edge (Sketch)
  - Move/Rotate (Sketch)
  - Pattern (Sketch)
  - Text
  - Trim
  - Delete

### 3.3 Restricciones
- Constraint overview, settings, and types
- Adding and removing constraints
- Constraint Settings
- Parallel
- Perpendicular
- Tangent
- Coincident
- Midpoint
- Concentric
- Horizontal/Vertical
- Equal
- Symmetry
- Disconnect
- Lock/Unlock
- Make Construction

### 3.4 Inserción y geometría de referencia
- Add variables
- Import images, files, or projects
- Custom construction planes and axes
- Construction Plane
- Construction Axis

### 3.5 Transformaciones
- Copying items
- Move/Rotate (3D)
- Scale
- Translate
- Pattern (3D)
- Rotate Around Axis
- Align
- Mirror

### 3.6 Modelado
- Offset Face
- Chamfer/Fillet
- Extrude
- Shell
- Loft
- Union
- Subtract
- Intersect
- Split Body
- Revolve
- Sweep
- Replace Face
- Offset Edge (3D)
- Project
- Wrap & Emboss
- Visualize

### 3.7 Modos y análisis
- Quick-toggle modes
- Isolate
- Section View
- Measure

### 3.8 Colaboración y salida
- Team Collaboration
- Published Versions
- Augmented Reality
- Screenshot
- Import/export
- Assemblies
- Mesh files
- STL units
- CNC cutting

Fuente principal:
- https://support.shapr3d.com/hc/en-us/articles/9760033847964-Shapr3D-Manual

## 4. Acceso contextual y principio de interfaz adaptativa

La documentación del manual describe varias formas de acceder a herramientas. Las herramientas pueden estar en menús y también aparecer por contexto según la selección y el flujo. El manual incluye selección geométrica, puntos notables, acceso a herramientas y gizmo de movimiento/copia.

Consecuencia para NOCTURNE:
- No basta con copiar una barra estática.
- La selección debe reconocer tipo de entidad y contexto.
- La interfaz debe exponer acciones compatibles con la selección actual.
- Debe existir un acceso explícito a las herramientas para evitar que el usuario dependa exclusivamente de sugerencias contextuales.
- Cada herramienta debe poder activarse por el flujo documentado correspondiente, siempre que la plataforma permita reproducirlo.

Pendiente de investigar en detalle: prioridades cuando una selección puede admitir varias herramientas, reglas de aparición/desaparición, gestos de confirmación y disposición por dispositivo.

## 5. Gestos táctiles documentados (referencia iPadOS)

La ayuda oficial de atajos y gestos documenta en iPadOS:
- Pan: arrastrar con dos dedos.
- Órbita: tocar la rejilla con un dedo y arrastrar.
- Zoom: pellizcar hacia dentro o fuera con dos dedos.
- Zoom a cara: doble toque sobre una cara.

También documenta para Windows combinaciones diferentes con ratón, teclado y lápiz. Las instrucciones no deben copiarse sin adaptación al dispositivo Android; se usarán como comportamiento de referencia para pruebas táctiles.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7873906073884-Keyboard-shortcuts-gestures-and-hotkeys

Criterios de prueba iniciales para Android:
1. Órbita con un dedo sobre zona libre de rejilla.
2. Selección de geometría sin disparar órbita accidental.
3. Pan con dos dedos.
4. Zoom por pellizco.
5. Centrado/zoom a cara por doble toque si se confirma que es parte del comportamiento de referencia para la versión objetivo.
6. Combinaciones de lápiz y dedo, si el hardware Android lo admite.
7. Prevención de gestos del sistema y rechazo de palma al dibujar con lápiz.

## 6. Historial: comportamiento confirmado por documentación

La barra lateral History:
- registra herramientas y acciones usadas para crear el modelo;
- presenta una línea temporal de pasos;
- permite seleccionar un paso y revisar/modificar parámetros disponibles;
- utiliza Parameter Cards en el espacio de modelado;
- cambios en pasos anteriores pueden afectar operaciones posteriores;
- puede filtrarse y combinar pasos según el artículo oficial.

Esto confirma que el historial no es simplemente un registro cronológico decorativo: permite volver a operaciones y editar parámetros.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/11567903089180-History

Implicación de arquitectura:
- persistir operaciones y parámetros;
- conservar relaciones entre entradas y salidas;
- recalcular las operaciones posteriores dependientes;
- mostrar errores de regeneración sin perder silenciosamente el último estado válido;
- diseñar identificadores/referencias geométricas robustas.

Pendiente: documentar exactamente qué acciones generan pasos, cuáles se agrupan/combinen, filtros, edición y recuperación ante fallos.

## 7. Operaciones de modelado verificadas en documentación

### 7.1 Extrude
La extrusión puede operar sobre caras o perfiles de boceto cerrados y empuja/tira en dirección lineal. Puede crear un cuerpo nuevo, agregar material a uno existente, sustraer material o producir una intersección, según las condiciones geométricas y la opción booleana. Puede incluir ángulo de desmoldeo. La documentación describe selección del perfil, uso del gizmo y ajuste manual de la acción booleana.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874453786908-Extrude

### 7.2 Revolve
Requiere perfil y eje; permite ajustar el ángulo y la acción booleana. La documentación también describe un parámetro de altura para generar geometría helicoidal, como bobinas, resortes o roscas.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874456570268-Revolve

### 7.3 Sweep
Requiere perfiles y trayectorias/ejes guía (spines). El perfil puede ser un boceto cerrado o una cara; la trayectoria puede ser geometría de boceto o aristas del cuerpo. Se utiliza para formas que siguen una ruta.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874456833948-Sweep

### 7.4 Loft
Interpela geometría entre perfiles de sección. Los perfiles se seleccionan en el orden de conexión. Puede utilizar curvas guía que intersectan las secciones y puntos de conexión ajustables. La documentación también menciona Loft periódico y su ajuste desde History.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874427572508-Loft

### 7.5 Chamfer/Fillet
Permite biselar o redondear aristas. El artículo describe manipulación de flechas/gizmo y parámetros para definir el resultado.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874402399900-Chamfer-Fillet

### 7.6 Split Body
Divide un cuerpo en varias partes sin retirar material. El elemento de corte puede ser un plano de construcción, plano de rejilla, perfil de boceto, cara, imagen o una cara del propio cuerpo. Incluye ajustes para conservar originales.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874462683036-Split-Body

## 8. Importación y exportación: inventario de formatos

La página oficial de tipos de archivo consultada indica:

### 8.1 Importación
- Bocetos 2D: DWG, DXF y SVG.
- Cuerpos 3D: X_T/X_B, STEP, IGES, STL (para referencia), SHAPR, SLDPRT y SLDASM.
- Formatos avanzados de empresa: NX, CATIA, Creo, Solid Edge y JT, con disponibilidad condicionada al plan.
- Imágenes: PNG, JPG, PDF 2D (una o primera página), TIFF, BMP, ICO, RAW y GIF no animado.

La documentación advierte que en DWG/DXF no se importan relaciones ni restricciones; se importan entidades geométricas compatibles, como líneas, polilíneas, curvas Bézier, arcos, círculos, elipses y polígonos. La indicación “STL (for reference only)” debe respetarse: no se debe prometer que un STL recupere el árbol paramétrico original.

### 8.2 Exportación
- 2D: DWG, DXF, PDF, JPEG, PNG y SVG.
- 3D: SHAPR, X_T/X_B, STEP, 3MF, IGES, OBJ con colores, STL, GLB y USDZ.
- Formatos avanzados sujetos al plan: JT y otros listados por la página.
- Exportación de malla y formatos de intercambio CAD tienen propósitos distintos.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874523890076-Supported-file-types

Pendiente:
- verificar disponibilidad de cada formato por sistema operativo y plan;
- documentar unidades, tolerancias, orientación y opciones de exportación;
- diseñar pruebas de round-trip para formatos CAD y de malla.

## 9. Inventario maestro: estado de investigación

| Área | Estado |
|---|---|
| Plataformas soportadas | Verificado en artículo de descarga |
| Índice general de herramientas | Inventariado desde Manual |
| Gestos iPadOS | Primera extracción documentada |
| Historial | Comportamiento básico documentado |
| Extrude | Comportamiento básico documentado |
| Revolve | Comportamiento básico documentado |
| Sweep | Requisitos básicos documentados |
| Loft | Requisitos básicos documentados |
| Chamfer/Fillet | Comportamiento básico documentado |
| Split Body | Comportamiento básico documentado |
| Formatos | Inventario preliminar documentado |
| Bocetos y herramientas individuales | Pendiente ficha detallada |
| Restricciones individuales y solver | Pendiente ficha detallada |
| Selección y filtros | Pendiente ficha detallada |
| Gizmo y transformaciones | Pendiente ficha detallada |
| Booleanas individuales | Pendiente ficha detallada |
| Shell, Offset Face, Replace Face | Pendiente ficha detallada |
| Proyección, Wrap & Emboss | Pendiente ficha detallada |
| Árbol/Items Manager | Pendiente ficha detallada |
| Variables y expresiones | Pendiente ficha detallada |
| Assemblies | Pendiente ficha detallada |
| Materiales/Visualize | Pendiente ficha detallada |
| Medición y Section View | Pendiente ficha detallada |
| Guardado/sync/colaboración | Pendiente ficha detallada |
| Variaciones por plataforma y versión | Pendiente comprobación sistemática |

## 10. Próxima entrega de investigación

La siguiente parte debe estudiar a nivel de ficha:
1. Espacio de trabajo y estructura visual.
2. Selección de geometría y puntos notables.
3. Gizmo y movimiento/copia.
4. Reglas de acceso a herramientas y menú adaptativo.
5. Árbol/Items Manager e historial, distinguiendo sus responsabilidades.

Después se investigarán los bocetos herramienta por herramienta, sin saltar ninguna del inventario.
