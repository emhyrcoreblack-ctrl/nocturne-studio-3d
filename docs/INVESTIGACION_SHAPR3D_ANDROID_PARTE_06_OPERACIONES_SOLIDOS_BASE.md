# Investigación Shapr3D para Android — Parte 06: operaciones de sólidos, barridos, recubrimientos y booleanos

**Proyecto:** NOCTURNE STUDIO 3D  
**Estado:** investigación funcional/documental; todavía no es implementación.  
**Referencia:** comportamiento público documentado de Shapr3D, consultado el 31-10-2026.  
**Objetivo:** especificar comportamiento observable para una implementación CAD independiente en Android. No copiar código, recursos, marca ni mecanismos privados.

---

## 1. Criterio de lectura

Esta parte cubre operaciones que convierten perfiles y cuerpos en geometría 3D o modifican sólidos existentes:

- Extrude
- Revolve
- Sweep
- Loft
- Shell
- Chamfer / Fillet
- Union / Subtract / Intersect
- Relación de estas operaciones con History y Parameter Cards.

La documentación oficial es la fuente principal. Cuando un detalle no está expresamente descrito (por ejemplo, el algoritmo exacto de orientación de un barrido), se marca como **pendiente de observación**, no se inventa.

## 2. Modelo de interacción común

La secuencia funcional observada en las herramientas es:

1. Activar la herramienta desde Tools o el menú adaptativo.
2. Seleccionar geometría válida, respetando el rol y orden cuando corresponda.
3. Mostrar previsualización y controles contextuales/gizmo.
4. Modificar parámetros numéricos o mediante manipulación táctil.
5. En operaciones compatibles, elegir el resultado booleano.
6. Confirmar con Done; cancelar/salir sin confirmar debe descartar la operación en curso.
7. Registrar la operación en History y permitir editar posteriormente sus parámetros.

**Requisito para Android:** los controles táctiles deben ser seleccionables sin depender de hover; los estados de selección deben distinguir perfil, eje, trayectoria, objetivo y herramienta. La previsualización debe actualizarse al cambiar selección/parámetros y mantener cámara/encuadre estables salvo acción explícita del usuario.

## 3. Extrude

### Propósito y entradas
Extiende linealmente una cara o una región cerrada de sketch para crear geometría prismática. La documentación limita la extrusión a caras planas; no confundir con Offset Face. Entradas: una o varias caras/perfiles válidos.

### Flujo
1. Tools > Extrude.
2. Seleccionar caras o perfiles de sketch.
3. Arrastrar el gizmo para definir distancia.
4. Opcionalmente ajustar el Boolean badge y el Draft Angle.
5. Done.

Desde el menú adaptativo, la documentación indica terminar seleccionando un área vacía de la cuadrícula.

### Parámetros de History
- **Profile:** reemplazar/editar los perfiles.
- **Sides:** One-Sided o Symmetric.
- **Extent:** Distance, To Object o Through All.
- **Distance:** longitud explícita.
- **To Object:** seleccionar objeto límite.
- **Through All:** incluye Flip Direction.
- **Draft Angle:** ángulo de desmoldeo/taper.
- **Start:** From Profile, Offset o From Plane.
- **Offset:** Start Offset y End Offset.
- **From Plane:** elegir plano de inicio.

### Boolean automático
- New Body: geometría no intersecta ni contacta cuerpos existentes.
- Union: por ejemplo, se extruye una cara de un cuerpo o un perfil conectado alejándose del cuerpo.
- Subtract: perfil/cara empujado directamente dentro de un sólido.
- Intersect: no se aplica automáticamente; se elige manualmente desde el badge.

La herramienta debe permitir cambiar manualmente la operación sugerida. No asumir que toda extrusión es siempre un cuerpo nuevo.

### Casos límite y pruebas
- Perfil cerrado simple; varios perfiles; perfiles anidados/huecos.
- Distancia positiva/negativa, simétrica y cero.
- Through All en ambas direcciones y To Object.
- Start Offset y End Offset; inicio desde plano.
- Draft positivo/negativo.
- Extrusión que no toca, toca tangencialmente, atraviesa o solapa un cuerpo.
- Cambio manual New Body/Union/Subtract/Intersect.
- Editar Profile, Extent, Sides y Start desde History y comprobar recálculo de operaciones posteriores.
- Cara no plana y perfil abierto: confirmar rechazo/mensaje, sin geometría corrupta.

## 4. Revolve

### Propósito y entradas
Gira un perfil cerrado o una cara alrededor de un eje para crear geometría axial. Puede producir sólidos como cilindros, conos y esferas. Con altura, permite geometría helicoidal (muelles, bobinas y roscas).

### Flujo
1. Tools > Revolve.
2. Seleccionar perfil y después eje.
3. Ajustar ángulo mediante gizmo.
4. Opcional: elegir Boolean badge.
5. Opcional: definir altura helicoidal.
6. Done.

### Ejes válidos documentados
- Eje de la cuadrícula.
- Eje de construcción.
- Línea de sketch.
- Arista lineal.

### Parámetros de History
- Profile.
- Axis.
- Angle (por defecto 360°).
- Elevation (altura de la hélice).

En una hélice, cada 360° corresponde a una vuelta; la altura define el desplazamiento axial acumulado.

### Boolean automático
Mismos resultados automáticos descritos para Extrude: New Body, Union y Subtract según relación espacial; Intersect se selecciona manualmente.

### Casos límite y pruebas
- Perfil cerrado y cara plana.
- Eje de cuadrícula, construcción, línea de sketch y arista.
- 90°, 180°, 359°, 360° y más de 360°.
- Perfil que cruza/toca el eje; perfil alejado del eje.
- Altura cero y altura positiva/negativa.
- Hélice de varias vueltas (ángulo múltiplo de 360°).
- Interacción táctil para seleccionar eje después del perfil.
- Editar perfil/eje/ángulo/elevación en History.
- Geometrías degeneradas/autointersección: validar fallo controlado.

## 5. Sweep

### Propósito y entradas
Extiende un perfil a lo largo de una trayectoria (spine). Perfil: región de sketch o cara. Trayectoria: elementos de sketch o aristas de un cuerpo. Se utiliza para tubos, cables, canales, raíles y formas que siguen una ruta.

### Flujo
1. Tools > Sweep.
2. Seleccionar perfiles, paths o spines.
3. Done.

En el menú adaptativo, la recomendación documentada es seleccionar perfil y todas las spines antes de activar la herramienta.

### Parámetros de History
- **Profile:** perfil/cara.
- **Path:** trayectoria.
- **Profile Position:** Auto, Path intersection, Closest point, Closest endpoint.
- **Orientation:** Normal to path o Parallel to profile.
- **Twist:** rotación del perfil a lo largo de la ruta.
- **Scale:** variación de tamaño a lo largo del recorrido.
- **Corner type:** Mitre (esquina aguda) o Round (esquina redondeada).

### Recomendaciones y restricciones documentadas
- Colocar el perfil al comienzo de la trayectoria mejora el resultado.
- Los vértices pronunciados pueden provocar autointersección/fallo; redondear esquinas de la ruta puede evitarlo.
- Para transiciones entre secciones de perfiles diferentes, usar Loft, no Sweep.

### Pendiente de observación
La documentación pública consultada no define de forma completa el marco de transporte del perfil, tratamiento de torsión en curvas 3D, reglas exactas de múltiples spines ni todos los mensajes de fallo. Reproducir esos detalles mediante pruebas observables antes de fijar el contrato.

### Casos límite y pruebas
- Trayectoria recta, arco, spline, polilínea y arista de cuerpo.
- Perfil perpendicular y oblicuo al inicio.
- Cada Profile Position.
- Normal to path vs Parallel to profile.
- Twist cero y varias vueltas; Scale 1 y valores distintos.
- Mitre vs Round en esquinas.
- Trayectoria con esquinas agudas, curva cerrada, auto-intersección o longitud cero.
- Más de una spine, perfiles múltiples (verificar cardinalidad y orden).
- Reemplazar perfil/path y modificar todos los parámetros desde History.

## 6. Loft

### Propósito y entradas
Interpola una forma entre secciones transversales. Requiere al menos dos perfiles cerrados; perfiles adicionales se conectan en el orden de selección. Los perfiles pueden ser regiones de sketch o caras.

### Preparación y flujo
1. Crear perfiles cerrados en planos distintos.
2. Opcional: crear curvas guía que intersecten cada sección.
3. Tools > Loft.
4. Seleccionar perfiles en el orden de conexión.
5. Ajustar puntos de conexión y seleccionar guías si se usan.
6. Para loft periódico, activar Periodic Loft desde History.
7. Done.

### Reglas documentadas
- Cada sección debe ser una única sección cerrada.
- No se admiten dos secciones del mismo plano ni secciones que se intersecten.
- Los connection points mapean vértices entre perfiles; se pueden arrastrar y alterar/eliminar torsión.
- Los puntos de conexión no están disponibles cuando hay guías.
- Las guías pueden ser curvas de sketch o aristas; deben intersectar las secciones. Si no intersectan o quedan dentro de una sección, el Loft falla.

### Parámetros de History
- Profiles.
- Periodic Loft.
- Guides.
- Start Tangent Continuity: None, G1 o G2.
- Start Tangent Magnitude.
- End Tangent Continuity: None, G1 o G2.
- End Tangent Magnitude.

### Pruebas
- Dos, tres y múltiples perfiles en distinto orden.
- Secciones de diferente número de vértices.
- Perfiles no coplanares, coplanares y que se intersectan.
- Connection points: arrastrar para introducir/quitar twist.
- Guías que conectan todas las secciones; guía que falla en una sección; guía interior.
- Periodic Loft.
- Continuidad None/G1/G2 y magnitudes.
- Sustituir perfil/guía desde History y verificar que pasos posteriores se actualizan.

## 7. Shell

### Propósito y flujo
Convierte un sólido en una envolvente hueca con espesor de pared uniforme, eliminando una o varias caras.

1. Tools > Shell.
2. Seleccionar cara(s) a eliminar.
3. Definir espesor mediante gizmo.
4. Done.

### Parámetros de History
- **Target:** cuerpo/cara objetivo; permite seleccionar otro objetivo.
- **Thickness:** espesor de pared.

### Pruebas y fallos que deben contemplarse
- Sólidos prismáticos, cilíndricos y de forma orgánica.
- Una cara abierta y varias caras eliminadas.
- Espesor hacia dentro/afuera si la interfaz lo expone (pendiente de confirmar).
- Espesor pequeño, cercano al límite geométrico y excesivo.
- Caras adyacentes, caras estrechas, vértices complejos.
- Cambiar Target y Thickness en History.
- Fallo de kernel: operación atómica, conservar el sólido previo y comunicar causa útil.

La fuente consultada no especifica todas las reglas de dirección ni límites de espesor; deben verificarse experimentalmente.

## 8. Chamfer / Fillet

### Acceso y selección
Tools > Chamfer/Fillet. Para Chamfer, se elige el tipo y luego aristas; se arrastran flechas hacia el cuerpo. Para Fillet, se seleccionan aristas y se arrastra el gizmo. Se confirma con Done.

### Chamfer
- **Auto:** distancias iguales desde la arista; en caras perpendiculares produce bisel de 45°.
- **2-distance:** dos retrocesos diferentes.
- History: Edge, Distance #1, Distance #2, Include Tangent Edges.

### Fillet
- **Radius:** redondeo de radio constante.
- **Chordal:** controla anchura de cuerda entre extremos.
- Continuity: G1 (tangencia) o G2 (continuidad de curvatura).
- Corners: Rolling Ball (radio constante) o Setback (radio variable en esquina).
- Profile slider y Magnitude: -1 a 1; modifica sección del filete, y al salir del valor predeterminado la cota deja de representar radio verdadero.
- History: Edge, Size Type, Radius/Width, Continuity, Corner, Overflow (Auto/Cliff/Smooth/Notch), Curvature, Include Tangent Edges, Y-Shaped Blend.

### Pruebas
- Arista única, varias aristas, cadena tangente.
- Chamfer Auto y 2-distance, invertir distancias.
- Fillet Radius y Chordal.
- G1/G2; Rolling Ball/Setback.
- Perfil/magnitud; Overflow; Y-Shaped Blend.
- Aristas que convergen en vértices complejos y radios excesivos.
- Editar aristas/parámetros en History.
- Comprobar que una operación inválida no dañe el sólido ni deje topología inconsistente.

## 9. Operaciones booleanas

Las operaciones booleanas trabajan con cuerpos solapados. La selección de roles importa y debe ser explícita.

### Union
- Une cuerpos solapados en un único cuerpo.
- Seleccionar cuerpos y Done.
- En History, el último cuerpo seleccionado queda por defecto como Target; los restantes como Tools.
- Keep Originals Off: los cuerpos originales se absorben.
- Keep Originals On: crea resultado nuevo y conserva cuerpos originales.
- History: Target, Tool, Type (Union/Subtract/Intersect), Keep Target Bodies, Keep Tool Bodies.

### Subtract
- Requiere al menos dos cuerpos solapados.
- Seleccionar primero Target (cuerpo del que se resta; resaltado púrpura y badge +), después Tool(s) (cuerpos que se sustraen; azul y badge -).
- Keep Originals: All, Modified Bodies, Removed Bodies, None.
- History: Target, Tool, Type y opciones Keep Target/Tool Bodies.

### Intersect
- Requiere al menos dos cuerpos solapados.
- Seleccionar Target y cuerpos que intersectan como Tools.
- Mantiene el volumen común.
- Keep Originals Off deja solo el resultado; On crea un cuerpo nuevo y conserva los originales.
- History: Target, Tool, Type y Keep Target/Tool Bodies.

### Requisitos funcionales comunes
- Identificación visual inequívoca Target/Tool; no depender solo del color (badges + y - y etiquetas accesibles).
- Permitir invertir roles antes de confirmar.
- Mantener selección por lotes de múltiples cuerpos.
- Previsualización del resultado y de qué originales se conservan.
- Detectar cuerpos sin solapamiento y tangencias degeneradas.
- History debe permitir sustituir Target/Tool, cambiar tipo booleano y opciones de conservación.
- El orden de selección debe ser determinista y reflejarse en History.

### Matriz de pruebas booleanas
- Dos sólidos con solapamiento volumétrico; cuerpos separados; contacto tangencial; coincidencia coplanar.
- Union con 2 y N cuerpos; seleccionar en distinto orden.
- Subtract con roles invertidos y múltiples herramientas.
- Intersect con dos y N cuerpos.
- Keep Originals: todos los modos aplicables.
- Cambiar Type desde History y reasignar Target/Tool.
- Cuerpo herramienta conservado y no conservado.
- Recalcular booleano tras editar la operación que creó uno de los cuerpos.

## 10. History y parámetros como parte del contrato de cada herramienta

La operación no termina al generar la forma. Shapr3D registra cada acción en una línea temporal editable. Seleccionar un paso muestra sus parámetros y permite cambiar entradas. Una modificación anterior puede afectar todas las operaciones posteriores.

Funciones de History documentadas:
- Insert Breakpoint para desactivar temporalmente pasos posteriores.
- Suppress/Unsuppress.
- Zoom To.
- Rename.
- Duplicate.
- Delete.
- Expand/Collapse.
- Filtrar pasos por elementos aislados o selección.
- Merge: combina historia en un único estado; permite conservar/eliminar sketches y variables. Es irreversible al salir del proyecto.

Parameter Cards (función documentada como despliegue limitado en la fecha consultada):
- Controles esenciales sobre el área de modelado.
- Abrir tarjeta completa al seleccionar de nuevo la herramienta activa.
- Configuración Show on Tool Start y Show on History Edit.
- Mover tarjeta; en iPad se puede arrastrar fuera de pantalla para ocultarla.
- En Android, la equivalencia exacta de gestos debe verificarse; no copiar comportamiento específico de iPad sin pruebas.

**Implicación de arquitectura:** cada operación debe guardar parámetros serializables, referencias estables a entidades/topología, roles de selección y dependencias. La recomputación debe ser determinista y transaccional. Evitar almacenar únicamente la malla resultante: se perdería la edición paramétrica de History.

## 11. Plan de implementación independiente para NOCTURNE

No iniciar la implementación hasta cerrar la investigación y establecer el motor geométrico.

Orden sugerido para la fase posterior:
1. Kernel/modelo B-rep o integración con kernel CAD apto; evaluar licencias y Android NDK.
2. Grafo de operaciones e historial paramétrico con referencias robustas.
3. Boolean kernel y diagnóstico de errores.
4. Extrude y Revolve.
5. Shell y Chamfer/Fillet.
6. Sweep y Loft (mayor complejidad geométrica).
7. Gizmos, Parameter Cards y edición en History.
8. Pruebas de regresión geométrica, persistencia y rendimiento en dispositivo Android.

No asumir que Three.js por sí solo proporciona operaciones B-rep exactas. Puede servir para visualización, pero el modelado sólido robusto requiere kernel geométrico adecuado o una capa propia de geometría computacional con límites claramente aceptados.

## 12. Criterio de aceptación

Cada herramienta se considera implementada solo cuando:
- Acepta los tipos de geometría documentados y rechaza los inválidos de forma segura.
- Reproduce la secuencia de selección y los parámetros relevantes.
- Ofrece preview, confirmación y cancelación sin corrupción.
- Guarda una operación editable en History.
- Los cambios paramétricos recalculan dependencias posteriores.
- Pasa toda la matriz de pruebas y pruebas de regresión.
- Funciona con interacción táctil Android y no requiere hover.
- Los límites no confirmados están documentados y no se presentan como paridad completa.

## 13. Fuentes oficiales consultadas

- Extrude: https://support.shapr3d.com/hc/en-us/articles/7874453786908-Extrude
- Revolve: https://support.shapr3d.com/hc/en-us/articles/7874456570268-Revolve
- Sweep: https://support.shapr3d.com/hc/en-us/articles/7874456833948-Sweep
- Loft: https://support.shapr3d.com/hc/en-us/articles/7874427572508-Loft
- Shell: https://support.shapr3d.com/hc/en-us/articles/7874427098268-Shell
- Chamfer/Fillet: https://support.shapr3d.com/hc/en-us/articles/7874402399900-Chamfer-Fillet
- Union: https://support.shapr3d.com/hc/en-us/articles/7874427955996-Union
- Subtract: https://support.shapr3d.com/hc/en-us/articles/7874461913884-Subtract
- Intersect: https://support.shapr3d.com/hc/en-us/articles/7874455776668-Intersect
- Boolean operations: https://support.shapr3d.com/hc/en-us/articles/10565066254108-Boolean-operations
- History: https://support.shapr3d.com/hc/en-us/articles/11567903089180-History
- Parameter Cards: https://support.shapr3d.com/hc/en-us/articles/31002224435356-Parameter-Cards
- Changelog (26.190): https://support.shapr3d.com/hc/en-us/articles/7536511116188-Changelog

---
**Conclusión:** estas herramientas constituyen una cadena paramétrica integrada, no comandos aislados. La paridad exige tanto geometría correcta como selección, roles, gizmos, preview, parámetros, historial editable y comportamiento táctil.