# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 11
## Visualización, cámara, navegación y selección espacial

**Estado:** investigación funcional/documental; no es implementación.  
**Plataforma objetivo de NOCTURNE:** Android táctil.  
**Referencia:** comportamiento público observable y documentación oficial de Shapr3D.  
**Fecha de consulta:** 31 de octubre de 2026.

---

## 1. Objetivo y límites

Esta parte especifica cómo debe comportarse el espacio de modelado: cámara, proyección, navegación táctil, orientación, rejilla, selección geométrica, resaltado y vistas de sección. La cámara es una capa de presentación: navegar nunca debe modificar coordenadas, topología, historial ni dimensiones del modelo.

La documentación pública consultada describe Shapr3D en iPadOS, macOS y Windows; no debe interpretarse como soporte oficial de Android. En NOCTURNE se toma la semántica funcional como referencia y se diseña una adaptación táctil Android, sin copiar código, recursos ni identidad visual protegidos.

## 2. Modelo de cámara

### 2.1 Estados y parámetros

La cámara debe mantener, como mínimo:

- posición y orientación (cuaternión o base ortonormal);
- punto objetivo/pivote de órbita;
- modo de proyección: perspectiva u ortográfica;
- campo de visión (FOV) para perspectiva;
- escala/altura visible del volumen para ortográfica;
- relación de aspecto derivada del viewport;
- planos near/far de clipping;
- orientación de mundo y orientación de vista;
- estado de animación/transición;
- último punto focal y última vista guardada.

Separar cámara de geometría y de la selección. La cámara puede referenciar un punto del mundo, pero no debe ser propietaria de entidades CAD.

### 2.2 Perspectiva y ortográfica

La interfaz de referencia ofrece un control continuo entre ortográfica (0°) y perspectiva (90°), no solamente un interruptor binario. NOCTURNE debería ofrecer:
- modo ortográfico exacto para construcción, medición y vistas técnicas;
- modo perspectiva para percepción espacial;
- transición intermedia ajustable, si la implementación de cámara la soporta de forma estable;
- persistencia del ajuste por documento.

En ortográfica, las líneas paralelas del mundo permanecen paralelas en pantalla y el tamaño aparente no depende de la profundidad. En perspectiva, los objetos lejanos se reducen. El cambio entre proyecciones debe conservar el encuadre aparente del punto focal, evitando saltos bruscos.

### 2.3 Clipping y precisión

Los planos near/far deben ajustarse a la escala real de la escena. Un rango excesivamente amplio reduce precisión del depth buffer y provoca z-fighting; un near plane demasiado pequeño también empeora la precisión. Recomendación:
- calcular límites visibles a partir de los cuerpos y del encuadre;
- usar margen de seguridad y actualizar sin vibraciones;
- no cambiar unidades ni tolerancias CAD al cambiar cámara;
- probar escenas microscópicas, grandes y con gran diferencia de escala;
- evitar que geometría válida desaparezca al acercar la cámara.

El clipping visual no debe confundirse con una operación booleana ni con Section View.

## 3. Navegación de cámara

### 3.1 Gestos de referencia observables

La ayuda de Shapr3D documenta para pantalla táctil:
- órbita: arrastrar con un dedo sobre la rejilla/espacio de modelado;
- pan: arrastrar con dos dedos;
- zoom: pellizcar con dos dedos;
- rotación alternativa de dos dedos: gesto de torsión, activable en ajustes;
- cubo de orientación: arrastrar para rotar; doble toque para vista predeterminada;
- doble toque sobre una cara: zoom a cara (según plataforma/entrada).

Los gestos de ratón/trackpad no se deben trasladar literalmente a Android. Implementar perfiles táctiles coherentes y, cuando haya teclado/ratón conectado, un mapa secundario configurable.

### 3.2 Reglas de interacción Android

- Un dedo en espacio libre: órbita, salvo que una herramienta activa reclame el gesto.
- Dos dedos: pan/zoom según el gesto dominante; pinch escala el encuadre.
- Dos dedos con torsión: rotación de vista opcional, desactivable.
- Gestos iniciados sobre gizmos, controles, cubo, paneles o geometría seleccionable no deben propagarse a la cámara.
- Al entrar en Sketch, distinguir claramente dibujar/seleccionar de orbitar; no robar un trazo iniciado.
- Mantener umbral de movimiento y temporización para distinguir tap, doble tap y drag.
- Gestos interrumpidos por el sistema (notificación, cambio de foco) deben finalizar en un estado válido.
- Soportar orientación vertical/horizontal, pantallas de distintas densidades y áreas seguras.

### 3.3 Zoom centrado en el cursor/punto de contacto

El zoom debe sentirse anclado al punto bajo los dedos:
1. proyectar el punto de contacto al rayo de cámara;
2. estimar su intersección con un plano focal estable o superficie de trabajo;
3. modificar distancia (perspectiva) o escala (ortográfica);
4. compensar pan para mantener el punto anclado en la misma posición de pantalla.

En pinch multitáctil, usar el centroide de los dos contactos como ancla. Si no existe intersección fiable, usar el punto focal actual y evitar desplazamientos repentinos.

**Regla crítica NOCTURNE:** zoom no debe modificar geometría, selección, historial, escala CAD ni posición de objetos. Debe evitar saltos de cámara y pérdida del objeto bajo el cursor.

### 3.4 Órbita y pan

- Órbita alrededor de un pivote definido; no girar arbitrariamente alrededor del origen mundial cuando el usuario trabaja lejos de él.
- Si hay selección, ofrecer una acción explícita “Enfocar selección” que establezca pivote y encuadre.
- Pan desplaza cámara y objetivo en paralelo, sin alterar orientación ni escala.
- Evitar inversión accidental de ejes; documentar si el control es tipo trackball o turntable.
- Limitar o gestionar singularidades cerca de los polos para evitar inversión de cámara.
- Permitir volver a una orientación estándar con transición animada breve.
- Cancelar animación de cámara cuando comienza una interacción manual nueva.

## 4. Zoom y encuadre explícitos

Acciones distintas:
- **Zoom to Fit / Ajustar todo:** encuadrar geometría visible del documento.
- **Zoom to Selection / Ajustar selección:** encuadrar el conjunto seleccionado.
- **Zoom to Face / Ajustar cara:** orientar la cámara normal a la cara y encuadrarla.
- **Zoom to Fit Visible:** ignorar cuerpos ocultos.
- **Vista predeterminada/Home:** restaurar orientación y encuadre inicial definido, no necesariamente el encuadre de todo.

El encuadre calcula una caja envolvente de geometría visible, transforma sus esquinas a espacio de cámara y obtiene la escala/distancia mínima con margen. Debe contemplar FOV, relación de aspecto, orientación y margen UI. Para selecciones degeneradas (punto, arista, cara plana) aplicar un tamaño mínimo razonable.

**Comportamiento obligatorio de importación:** importar un segundo archivo no debe disparar Zoom to Fit ni cambiar cámara, pivote o zoom existentes. El objeto nuevo puede aparecer fuera de pantalla; ofrecer una acción explícita para encuadrarlo. Esta regla protege el contexto de trabajo y evita el problema de zoom automático ya identificado en el proyecto.

## 5. Vistas estándar y orientación

Conjunto de vistas:
- Front, Back, Left, Right, Top, Bottom;
- isométrica predeterminada;
- vistas ortográficas oblicuas desde aristas y esquinas;
- vista normal a cara/plano seleccionado;
- vista ortográfica más cercana.

Las transiciones deben ser deterministas y animadas opcionalmente. La cámara debe terminar exactamente en una base ortonormal, no aproximada. Ofrecer rotación en incrementos fijos y ajuste a ortográfica cercana. La orientación normal a una cara debe definir un eje horizontal estable para evitar que la vista rote inesperadamente.

Guardar hasta ocho vistas personalizadas por documento, cada una con orientación, proyección, escala/distancia y objetivo. Evaluar si las vistas guardadas incluyen también visibilidad y estado de sección; si se implementa, explicitarlo para evitar sorpresas.

## 6. Cubo de orientación (View Cube)

El cubo es un control de navegación, no una decoración:
- caras etiquetadas para las seis vistas ortogonales;
- aristas para vistas oblicuas;
- esquinas para isométricas;
- arrastre para rotación continua;
- doble toque para vista predeterminada;
- flechas de giro de 90° cuando se está en vista plana;
- estados visuales para cara activa y orientación actual;
- acción Home/Default y Zoom to Fit disponibles desde su menú contextual;
- objetivo táctil suficientemente grande en Android.

No debe interceptar gestos destinados al viewport fuera de su propia región. Si el cubo se oculta para maximizar pantalla, debe existir un botón persistente y reconocible para recuperarlo. No asumir que el usuario dispone de hover.

## 7. Rejilla, ejes y planos

La rejilla sirve como referencia visual y como superficie de interacción, no como geometría del modelo.

- Planos XY, YZ y ZX seleccionables.
- Rejilla de trabajo cambia al entrar en Sketch sobre un plano/cara y vuelve al estado predeterminado al salir.
- Mostrar origen y ejes globales con jerarquía visual diferenciada.
- Control independiente para visibilidad de rejilla, ejes, planos de construcción y geometría de construcción.
- La rejilla puede adaptar espaciado visual al zoom, pero los intervalos de snapping deben seguir siendo numéricamente coherentes.
- No mostrar líneas de rejilla infinitamente densas ni aliasing excesivo.
- Diferenciar rejilla visual, snapping y restricciones geométricas: activar una no debe implicar las otras.
- El plano activo debe ser identificable aun cuando la rejilla esté oculta.

## 8. Selección geométrica

### 8.1 Tipos y filtros

Entidades seleccionables:
- cuerpos;
- caras;
- aristas;
- vértices;
- perfiles y entidades de Sketch;
- restricciones y cotas;
- planos/ejes de construcción cuando una herramienta lo requiera.

Filtros explícitos: All, Bodies, Faces, Edges y, donde proceda, Vertices/Sketch entities. El filtro debe persistir durante una operación cuando el flujo lo requiera, pero restablecerse de forma predecible al salir.

### 8.2 Precisión táctil

La geometría CAD puede ser más pequeña que un dedo. Implementar selección por tolerancia en píxeles/dp, convertida a rayo/espacio de mundo según distancia y escala. No ampliar físicamente la geometría ni cambiar coordenadas para facilitar el toque.

Cuando varias entidades estén dentro de la tolerancia:
- mostrar un selector de elementos superpuestos;
- listar tipo y nombre legible;
- permitir recorrer candidatos;
- resaltar temporalmente cada candidato;
- mantener el menú cerca del contacto sin cubrir la entidad;
- permitir cancelar sin alterar selección previa.

En escenas densas, priorizar la entidad más cercana al rayo, pero no ocultar alternativas relevantes. La selección por prioridad debe considerar contexto de herramienta y filtro activo.

### 8.3 Área de selección

Distinguir dirección del rectángulo:
- izquierda a derecha: seleccionar entidades completamente contenidas;
- derecha a izquierda: seleccionar entidades tocadas por el rectángulo.

Filtros deben poder cambiarse mientras el área de selección está activa. Debe soportar selección múltiple, añadir/quitar con modificador o modo explícito, y mantener un feedback claro del conjunto.

### 8.4 Oclusión y selección interna

Ofrecer:
- selección de elementos visibles;
- selección de elementos ocultos cuando “Show Hidden Edges” esté activo;
- modo Select Through para atravesar cuerpos;
- selector de entidades superpuestas;
- opción de aislar selección cuando convenga.

La selección a través de geometría debe ser deliberada y visible en UI; nunca activar silenciosamente y provocar seleccionar caras internas por error.

## 9. Resaltado y feedback visual

Estados mínimos:
- normal;
- preseleccionado/candidato;
- seleccionado;
- bloqueado/no seleccionable;
- oculto;
- resaltado por foco desde Items Manager;
- geometría de construcción;
- geometría de sección/corte.

No depender solo del color: combinar contorno, grosor, transparencia, patrón o iconografía. Garantizar contraste en distintos fondos y materiales. El hover de escritorio se traduce en Android a previsualización durante el toque/arrastre y a resaltado al navegar listas; no inventar un estado hover permanente sin puntero.

Cuando se resalta un ítem desde el administrador, reflejarlo en viewport y viceversa. La selección debe conservarse al ocultar paneles, y el panel lateral puede abrirse bajo demanda.

## 10. Section View y clipping de visualización

Section View es una operación de visualización no destructiva:
- plano de corte desplazable y rotatorio mediante gizmo;
- invertir lado visible;
- opción de mostrar sección 2D con siluetas/aristas de fondo;
- modo Section Only que oculta geometría y detalles no necesarios;
- Normal to Section para alinear cámara con el plano;
- guardar/restaurar una vista de sección si se decide incluir ese estado.

El plano de sección y sus parámetros deben estar separados de operaciones Split Body/Boolean. Desactivar la vista restaura el modelo completo sin reconstruir geometría ni alterar historial.

## 11. Arquitectura propuesta para NOCTURNE

Separar módulos:
1. **CameraState:** pose, objetivo, proyección, FOV/escala, clipping, vistas guardadas.
2. **CameraController:** órbita, pan, zoom, transiciones, pivote y ajuste a vistas.
3. **TouchGestureRouter:** arbitraje de gestos por región y herramienta activa.
4. **ViewportProjector:** proyección mundo-pantalla y ray casting.
5. **FitCalculator:** encuadre de todo/visible/selección/cara.
6. **OrientationWidget:** cubo y controles de orientación.
7. **GridAndAxesRenderer:** rejilla, origen, ejes y planos.
8. **SelectionQuery:** consulta espacial y filtros de entidades.
9. **SelectionResolver:** desambiguación de superposiciones y selección táctil.
10. **HighlightManager:** estados visuales sincronizados con Items Manager.
11. **SectionViewController:** plano y presentación de sección no destructiva.
12. **ViewportPreferences:** preferencias de navegación, apariencia y accesibilidad.

La cámara y el viewport no deben depender del kernel B-rep. El ray casting de selección debe consultar una representación acelerada sincronizada con el modelo, sin convertir la malla de render en autoridad topológica. Para CAD exacto, devolver referencias estables a caras/aristas/vértices del modelo fuente.

## 12. Persistencia

Por documento:
- última cámara y proyección;
- vistas guardadas;
- configuración de rejilla y plano predeterminado;
- visibilidad de ejes/planos;
- preferencia de Section View si se guarda como estado de vista.

Por dispositivo/usuario:
- sensibilidad de órbita/pan/zoom;
- inversión de gestos;
- rotación con dos dedos;
- tamaño de objetivos táctiles;
- preferencia de navegación.

Al reabrir un proyecto, restaurar cámara de forma estable. Importar geometría adicional no debe sobrescribirla. Si cambia la relación de aspecto, conservar objetivo y orientación y recalcular encuadre sin zoom inesperado.

## 13. Matriz de pruebas de aceptación

| ID | Prueba | Resultado esperado |
|---|---|---|
| CAM-01 | Órbita con un dedo en espacio libre | Gira alrededor del pivote sin alterar modelo |
| CAM-02 | Pan con dos dedos | Desplaza cámara/objetivo sin rotación |
| CAM-03 | Pinch zoom | Zoom suave, sin saltos ni cambios geométricos |
| CAM-04 | Zoom con centroide sobre vértice | El punto permanece visualmente anclado |
| CAM-05 | Zoom en ortográfica | Cambia escala, no perspectiva |
| CAM-06 | Zoom en perspectiva | Cambia distancia/FOV según estrategia estable |
| CAM-07 | Iniciar gesto sobre gizmo | Cámara no captura el gesto |
| CAM-08 | Dibujar Sketch y mover dedo | No se convierte accidentalmente en órbita |
| CAM-09 | Cambiar perspectiva a ortográfica | Conserva encuadre aparente |
| CAM-10 | Escena de gran extensión | Sin clipping inesperado |
| CAM-11 | Escena microscópica | Geometría sigue visible y seleccionable |
| CAM-12 | Ajustar todo | Encuadra cuerpos visibles con margen |
| CAM-13 | Ajustar selección | Solo usa la selección |
| CAM-14 | Ajustar cara | Vista normal y encuadre apropiado |
| CAM-15 | Importar segundo STL | Cámara, zoom y objetivo permanecen intactos |
| CAM-16 | Ocultar un cuerpo y ajustar visible | Cuerpo oculto no afecta el encuadre |
| CAM-17 | Vista Front/Back/Left/Right | Orientación exacta |
| CAM-18 | Vista Top/Bottom | Orientación exacta sin inversión |
| CAM-19 | Seleccionar arista del cubo | Vista oblicua correspondiente |
| CAM-20 | Seleccionar esquina del cubo | Vista isométrica correspondiente |
| CAM-21 | Arrastrar cubo | Rotación coherente y predecible |
| CAM-22 | Doble toque cubo | Restaura vista predeterminada |
| CAM-23 | Girar 90° desde vista plana | Mantiene normal y cambia roll |
| CAM-24 | Guardar y restaurar vista | Recupera pose y proyección |
| CAM-25 | Cambiar plano de rejilla | Cambia plano de trabajo, no geometría |
| CAM-26 | Entrar/salir de Sketch | Rejilla cambia y vuelve correctamente |
| CAM-27 | Zoom extremo sobre rejilla | Espaciado legible, sin saturación |
| SEL-01 | Tocar cara | Selecciona cara correcta |
| SEL-02 | Tocar arista próxima a cara | Selector permite elegir arista |
| SEL-03 | Elementos superpuestos | Lista candidatos y resalta cada uno |
| SEL-04 | Filtro Faces Only | No selecciona cuerpos/aristas |
| SEL-05 | Filtro Bodies Only | No selecciona subentidades |
| SEL-06 | Rectángulo izquierda-derecha | Solo elementos completamente dentro |
| SEL-07 | Rectángulo derecha-izquierda | Incluye elementos tocados |
| SEL-08 | Selección múltiple | Añade/quita de forma explícita |
| SEL-09 | Select Through desactivado | Oclusión respetada |
| SEL-10 | Select Through activado | Permite seleccionar geometría interna |
| SEL-11 | Mostrar aristas ocultas | Aristas visibles y seleccionables |
| SEL-12 | Resaltar desde Items Manager | Coincide con entidad en viewport |
| SEL-13 | Cambiar zoom tras selección | Referencia seleccionada sigue siendo estable |
| SEL-14 | Ocultar panel lateral | No pierde selección ni cámara |
| SEC-01 | Activar Section View | Corte visual no destructivo |
| SEC-02 | Mover/rotar plano | Sección se actualiza continuamente |
| SEC-03 | Invertir lado | Muestra lado opuesto |
| SEC-04 | Section Only | Oculta contexto según especificación |
| SEC-05 | Normal to Section | Cámara queda normal al plano |
| SEC-06 | Desactivar sección | Restaura geometría completa sin cambios CAD |
| SEC-07 | Guardar vista seccionada | Restauración coherente si está soportada |

## 14. Criterios de terminado

Esta área no se considera completa hasta que:
- todos los gestos táctiles estén documentados y no entren en conflicto con herramientas;
- el zoom anclado funcione en perspectiva y ortográfica;
- el encuadre sea explícito y determinista;
- importar un archivo adicional no mueva la cámara;
- las vistas estándar y el cubo sean precisos;
- selección táctil de entidades pequeñas tenga desambiguación;
- filtros, selección por área y Select Through estén probados;
- Section View sea no destructivo;
- cámara, selección y geometría tengan estados/persistencia separados;
- la matriz de regresión se ejecute en dispositivos Android de distintos tamaños y densidades.

## 15. Fuentes oficiales consultadas

1. Views and Appearance — https://support.shapr3d.com/hc/en-us/articles/7873944390812-Views-and-Appearance
2. Selecting geometry — https://support.shapr3d.com/hc/en-us/articles/7770768736924-Selecting-geometry
3. Orientation Cube — https://support.shapr3d.com/hc/en-us/articles/7873937480604-Orientation-Cube
4. Keyboard shortcuts, gestures, and hotkeys — https://support.shapr3d.com/hc/en-us/articles/7873906073884-Keyboard-shortcuts-gestures-and-hotkeys
5. Navigation Presets — https://support.shapr3d.com/hc/en-us/articles/7873881091356-Navigation-Presets
6. Control the view of your modeling environment — https://support.shapr3d.com/hc/en-us/articles/13079128172956-Control-the-view-of-your-modeling-environment
7. Grid and sketch settings — https://support.shapr3d.com/hc/en-us/articles/13079113458332-Grid-and-sketch-settings
8. Context menus — https://support.shapr3d.com/hc/en-us/articles/7873942151068-Context-menus
9. Section View — https://support.shapr3d.com/hc/en-us/articles/7873938030492-Section-View
10. 26.50 Advanced Section View controls — https://support.shapr3d.com/hc/en-us/articles/25704790113564-26-50-Advanced-Section-View-controls
11. 5.880 navigation and selection improvements — https://support.shapr3d.com/hc/en-us/articles/20524622488476-5-880-Navigate-faster-manage-items-better-track-edits-clearly

**Nota de certeza:** los gestos, vistas, cubo, filtros y funciones de sección descritos arriba se apoyan en documentación pública de Shapr3D. Las recomendaciones de arquitectura, tolerancia táctil Android, anclaje matemático del zoom, clipping adaptativo y separación de módulos son especificaciones de ingeniería para NOCTURNE, no afirmaciones sobre implementación interna de Shapr3D.
