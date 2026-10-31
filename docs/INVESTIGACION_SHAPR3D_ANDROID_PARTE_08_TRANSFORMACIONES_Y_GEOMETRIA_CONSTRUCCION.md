# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 08
## Transformaciones 3D y geometría de construcción
**Fecha de consulta:** 31 de octubre de 2026  
**Plataforma objetivo:** Android  
**Referencia funcional:** documentación pública oficial de Shapr3D Help Center.

> Investigación funcional y especificación independiente. No se ha copiado código, recursos, marca ni implementación privada. Lo no determinado por documentación pública queda marcado como pendiente de observación.

## 1. Resumen ejecutivo

La familia Transform no es una única operación genérica:
- **Move/Rotate (3D):** gizmo, orientación respecto a geometría, entidades 3D y opción de copia.
- **Translate:** vector definido por dos puntos.
- **Scale:** uniforme o no uniforme, centro configurable y copia.
- **Rotate Around Axis:** rotación alrededor de eje seleccionado y copia.
- **Align:** posicionamiento por referencias geométricas, gizmo y Flip.
- **Mirror:** reflexión respecto a plano de simetría, con o sin originales.
- **Pattern 3D:** patrones lineales/circulares de cuerpos, perfiles y sketches.
- **Construction Plane / Axis:** geometría de referencia persistente.

Lección arquitectónica: cada operación debe guardar referencias, parámetros, política de copia y resultado; no basta con almacenar la matriz final. Esto permite editar historial y recalcular el modelo.

## 2. Move/Rotate (3D)

La documentación enumera regiones de sketch, aristas, caras y cuerpos. Doble toque/clic en una cara puede seleccionar el cuerpo completo. Incluye función Copy.

**Flujo:** Transform > Move/Rotate; seleccionar entidades; activar Copy opcional; usar gizmo; confirmar Done. El gizmo ofrece flechas y tiles para control direccional, puede alinearse con otra geometría y muestra etiquetas dimensionales. Auto-orientation controla si el gizmo se alinea con geometría al mover su centro; la ayuda indica que esta opción aparece al abrir la herramienta desde el menú Transform.

**Historial editable:** Start Center, Target Bodies, Target Faces, Target Edges y Copy.

**Requisitos NOCTURNE:** gizmo con ejes, planos y anillos distinguibles; pivote manipulable; valores numéricos editables; previsualización reversible; multi-selección estable; separación entre gesto de gizmo y órbita de cámara. No se infiere el algoritmo interno exacto de orientación o snapping.

## 3. Translate

Mueve sketches, perfiles de sketch o cuerpos mediante un vector definido por punto inicial y punto final. Flujo: seleccionar entidades, Next, Copy opcional, seleccionar ambos puntos (snapping a grid, aristas o vértices), Done.

Historial: Target Bodies/Faces/Edges, Start Point, End Point y Copy.

**Requisito:** almacenar ambos puntos en coordenadas del modelo y derivar el vector. Editar un punto recalcula el vector. No reducir esta herramienta al mismo flujo de Move/Rotate.

## 4. Scale

Modos documentados:
- **Uniform:** escala proporcional en todas las direcciones, con manipulador de centro.
- **Non-uniform:** factores distintos por eje; centro ajustable moviendo el centro del gizmo.

Incluye Copy. Historial: Target Bodies/Faces/Edges, Uniform, Scale X, Scale Y, Scale Z y Copy.

**Requisitos:** factores numéricos por eje; bloqueo de proporción en uniforme; centro explícito y persistente; validación de factores cero, negativos y extremos; distinguir escala CAD de escala visual de malla importada. El comportamiento límite por entidad debe probarse directamente.

## 5. Rotate Around Axis

Admite sketches, perfiles, aristas, caras y cuerpos. Flujo: seleccionar entidades, Next, elegir eje/línea/arista, Copy opcional, ajustar gizmo angular y Done.

Historial: Target Bodies/Faces/Edges, Axis, Angle y Copy.

**Requisitos:** guardar eje como referencia persistente, sentido y ángulo. Probar ángulos negativos, 0°, 180°, 360° y mayores de una vuelta.

## 6. Align

Referencias válidas documentadas: caras planas, esféricas y cónicas; sketches; planos y ejes de construcción; aristas circulares y sketches circulares; elementos lineales (sketches y aristas).

Flujo: seleccionar uno o varios cuerpos móviles; Next; elegir cara/arista del cuerpo móvil; elegir objetivo compatible o arrastrar snap point a snap point; ajustar con gizmo y Flip; Done.

El gizmo permite rotar alrededor del centro, mover por ejes, trasladar sobre plano y voltear 180°. Snapping contempla vértices alineados, aristas colineales, arcos/caras coplanares y aristas paralelas. Historial público menciona Target Body.

**Requisitos:** distinguir referencia móvil y objetivo; resolver orientación y posición sin saltos; mostrar tipo de snap; rechazar referencias incompatibles; multi-cuerpo conserva posiciones relativas.

## 7. Mirror

Puede reflejar sketches, caras o cuerpos. Plano de espejo puede ser plano base, cara, perfil de sketch, eje, línea de sketch o plano de construcción.

Flujo: seleccionar elementos (azul, badge Mirror); elegir plano (púrpura, badge Target); configurar Keep Originals; Done. Desactivar Keep Originals retira el original al completar.

Historial: Target Bodies, Target Faces, Plane y Keep Originals.

**Implicación geométrica:** reflexión invierte orientación; el kernel debe corregir normales/topología, no limitarse a invertir matriz visual. Para sketches, changelog documenta restricciones automáticas de simetría al reflejar curvas; no extrapolar a cuerpos.

## 8. Pattern 3D

Crea patrones de cuerpos 3D, perfiles o sketches completos. A diferencia de Pattern Sketch, los cuerpos resultantes no mantienen conexión entre sí; se agrupan en carpeta de Items Manager.

### Lineal
Distribución por uno, dos o tres ejes. Elegir Linear; seleccionar cuerpos/perfiles; definir **Total Distance** (distancia total distribuida equitativamente) o **Spacing Distance** (distancia entre instancias); definir Quantity; orientar con flecha del gizmo; introducir valor y repetir en otros ejes si procede.

### Circular
Distribuye copias alrededor de centro. Elegir Circular; seleccionar cuerpos/perfiles; mover centro del gizmo; definir **Total Angle** o **Spacing Angle**; Quantity; orientación:
- **Uniform:** mantiene orientación original de cada copia.
- **Rotated:** rota cada copia respecto al centro.

Historial documenta Target Bodies/Faces, Definition, Quantity y Distance. Changelog confirma soporte de variables para entradas como quantity, distance y angle.

**Requisitos NOCTURNE:** preservar semántica Total/Spacing; patrones lineales 1D/2D/3D; centro/eje circular explícito; instancias seleccionables y agrupadas; actualización reproducible; límites por rendimiento; advertir colisiones sin eliminar elementos; evaluar instancing de viewport sin perder acceso a geometría para edición/exportación.

## 9. Geometría de construcción

### 9.1 Principio
Geometría auxiliar para posicionar elementos: planos para sketches/espejo, ejes para patrones circulares y líneas auxiliares. Planos y ejes son infinitos conceptualmente, aunque se muestran con tamaño visual finito.

La ayuda advierte que geometría de construcción solo es visible en formato nativo Shapr3D; al exportar sketches a X_T, STEP o IGES, los elementos de construcción se omiten. NOCTURNE debe definir su propia política de exportación.

### 9.2 Construction Plane — tipos
- **Offset Plane:** desplazado desde cara, plano o perfil plano; offset y tamaño editables.
- **Midplane:** equidistante entre dos caras/planos/perfiles planos.
- **Plane Through 3 Points:** definido por tres puntos; snapping a grid, sketch o cuerpo.
- **Plane on Curve at Point:** normal a una curva en un punto.
- **Plane Perpendicular to Edge at Point:** perpendicular a arista/eje/línea en punto de referencia.
- **Plane Through Edge at Angle:** rotado alrededor de arista/eje/línea, midiendo ángulo desde cara/plano/perfil de referencia.
- **Plane Parallel to Face at Point:** paralelo a cara/plano/perfil y pasando por punto elegido.

Historial conserva referencias fuente y parámetros como offset, ángulo y tamaño.

### 9.3 Construction Axis — tipos
- **Axis Through 2 Points:** pasa por dos puntos (puntos de sketch, vértices o puntos nuevos).
- **Axis Through 2 Planes:** intersección de dos elementos planos.
- **Axis of Cylinder/Cone:** eje de simetría/rotación de cara cilíndrica o cónica.
- **Axis Along Edge:** coincide con arista lineal o línea de sketch.
- **Axis Perpendicular to Face at Point:** normal a cara/plano/perfil en punto de referencia.

Historial conserva referencias y, donde corresponde, longitud visual del eje.

### 9.4 Datos requeridos
Cada entidad de construcción necesita ID persistente, tipo, referencias geométricas estables, parámetros dimensionales, estado válido/error, visibilidad, dependencias en historial y política de exportación. Si la cara/arista fuente desaparece, marcar referencia rota y permitir reasignación; no sustituir silenciosamente por otro plano/eje.

## 10. Arquitectura funcional recomendada

### 10.1 Contrato de operación
Cada transformación/construcción debe guardar:
1. operationId, type y versión.
2. Entidades objetivo por IDs persistentes.
3. Referencias (puntos, ejes, planos, caras, aristas).
4. Parámetros con unidades y sistema de coordenadas explícitos.
5. Política de copia/originales.
6. Estados preview, commit, cancel y error.
7. Resultado geométrico y mapeo topológico.
8. Dependencias para regeneración.
9. Entrada de historial editable.
10. Pruebas deterministas de regeneración y undo/redo.

### 10.2 Intención y resultado
No guardar solamente matrices 4x4 finales. Guardar intención semántica: vector entre dos puntos, eje + ángulo, plano espejo, pivote + factores de escala, referencias de alineación y patrón + quantity/spacing/total. La matriz final puede derivarse para renderizado.

### 10.3 CAD exacto y mallas
Para sólidos CAD, transformar en kernel B-rep y validar caras, aristas, orientación y volumen. Mallas importadas se transforman como mallas, conservando unidades, origen y asociación al objeto. No prometer edición B-rep de STL; la edición de topología exacta requiere conversión/reconstrucción explícita.

### 10.4 Android
- Handles táctiles grandes y separados.
- Gestos de cámara y gizmo mutuamente excluyentes durante herramienta activa.
- Done/Cancel accesibles.
- Teclado numérico con unidades y edición rápida.
- Snap points con color, forma y etiqueta; no depender solo del color.
- Undo/redo y cancelación durante preview.
- Panel contextual plegable para no bloquear viewport.
- Coherencia entre coordenadas de pantalla, cámara, mundo y pieza; zoom nunca modifica valores geométricos.

## 11. Matriz de pruebas

| ID | Caso | Resultado esperado |
|---|---|---|
| T08-01 | Move body por X con valor | Traslación exacta e historial editable |
| T08-02 | Move face/edge/sketch region | Entidad válida y topología correcta |
| T08-03 | Cambiar pivote antes de rotar | Giro alrededor del centro nuevo |
| T08-04 | Auto-orientation on/off | Gizmo predecible |
| T08-05 | Copy en Move/Rotate | Original intacto |
| T08-06 | Translate entre vértices | Vector igual a diferencia de puntos |
| T08-07 | Translate con grid/aristas | Snapping correcto |
| T08-08 | Scale uniforme 2x | Proporciones preservadas |
| T08-09 | Scale no uniforme XYZ | Factores independientes |
| T08-10 | Scale con Copy | Original intacto |
| T08-11 | Scale cero/negativa/extrema | Validación explícita |
| T08-12 | Rotate Around Axis 90° | Giro correcto |
| T08-13 | Rotar con eje construcción | Referencia persistente |
| T08-14 | Align cara a cara | Coplanaridad correcta |
| T08-15 | Align circular a circular | Centros/ejes coincidentes |
| T08-16 | Align Flip | Orientación invertida 180° |
| T08-17 | Align multi-cuerpo | Relaciones internas preservadas |
| T08-18 | Mirror Keep Originals | Original y reflejo |
| T08-19 | Mirror sin Keep Originals | Original retirado |
| T08-20 | Mirror con plano/eje de construcción | Simetría correcta |
| T08-21 | Mirror B-rep | Normales/topología/volumen válidos |
| T08-22 | Pattern lineal Total vs Spacing | Distribución exacta |
| T08-23 | Pattern lineal 2/3 ejes | Rejilla regular |
| T08-24 | Pattern circular Uniform/Rotated | Orientaciones diferenciadas |
| T08-25 | Editar Quantity/Distance/Angle | Regeneración determinista |
| T08-26 | Pattern de cuerpo importado | Compatibilidad por tipo |
| T08-27 | Plane Offset/Midplane | Ubicación y referencias editables |
| T08-28 | Plane Through 3 Points colineales | Rechazo degenerado |
| T08-29 | Plane on Curve at Point | Normal local correcta |
| T08-30 | Plane Through Edge at Angle | Ángulo desde referencia correcta |
| T08-31 | Axis Through 2 Points coincidentes | Rechazo de eje indefinido |
| T08-32 | Axis Through 2 Planes paralelos | Rechazo sin intersección única |
| T08-33 | Axis of cylinder/cone | Eje de simetría correcto |
| T08-34 | Fuente cambia topología | Dependencia rota visible y reasignable |
| T08-35 | Undo/redo de cada herramienta | Restauración exacta |
| T08-36 | Cancelar preview | Sin geometría/historial residual |
| T08-37 | Gesto gizmo vs cámara | Sin conflicto de input |
| T08-38 | Transformar conjunto | Posiciones relativas conservadas |
| T08-39 | Zoom durante edición numérica | Valor geométrico no cambia |
| T08-40 | Exportar construcción | Política documentada y consistente |

## 12. Criterios de aceptación
- Cada herramienta tiene flujo, selección, parámetros, cancelación, confirmación e historial definidos.
- Probados tipos de referencia, no solo cuerpo simple.
- Snapping validado geométricamente.
- Regeneración reproduce el mismo resultado.
- B-rep mantiene validez topológica y orientación.
- Mallas importadas soportadas sin prometer B-rep.
- UX táctil separa manipulación y cámara.
- Comportamientos no confirmados quedan marcados como pendientes.

## 13. Incertidumbres y trabajo pendiente
1. Observar gizmo real: orden de gestos, handles, pivote por defecto y snapping.
2. Verificar selección de entidades para Scale y Align en todas las plataformas.
3. Comprobar límites de cantidad y rendimiento de Pattern 3D.
4. Probar Mirror en cuerpos complejos y planos coincidentes.
5. Documentar diferencias entre iPadOS, macOS y Windows; la documentación consultada no prueba disponibilidad Android.
6. Definir política NOCTURNE para exportación de construcción, referencias rotas y mallas.

## 14. Fuentes oficiales
- Transform menu: https://support.shapr3d.com/hc/en-us/sections/7768328803228-Transform-menu
- Copying items: https://support.shapr3d.com/hc/en-us/articles/7369335889564-Copying-items
- Move/Rotate (3D): https://support.shapr3d.com/hc/en-us/articles/7874396289308-Move-Rotate-3D
- Scale: https://support.shapr3d.com/hc/en-us/articles/7874396722460-Scale
- Translate: https://support.shapr3d.com/hc/en-us/articles/7888735383580-Translate
- Pattern (3D): https://support.shapr3d.com/hc/en-us/articles/7874397541532-Pattern-3D
- Rotate Around Axis: https://support.shapr3d.com/hc/en-us/articles/7874421304092-Rotate-Around-Axis
- Align: https://support.shapr3d.com/hc/en-us/articles/7874398317596-Align
- Mirror: https://support.shapr3d.com/hc/en-us/articles/7874422018588-Mirror
- Construct menu: https://support.shapr3d.com/hc/en-us/sections/27721924446492
- Understanding construction geometry: https://support.shapr3d.com/hc/en-us/articles/7874356105756-Understanding-construction-geometry
- Construction Plane: https://support.shapr3d.com/hc/en-us/articles/7874364567452-Construction-Plane
- Construction Axis: https://support.shapr3d.com/hc/en-us/articles/7874363611676-Construction-Axis
- Changelog: https://support.shapr3d.com/hc/en-us/articles/7536511116188-Changelog

---
**Estado:** investigación documental Parte 08 guardada. No se modificó código ni se generó APK/build.
