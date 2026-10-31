# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 05
## Herramientas restantes de Sketch, patrones y proyección

**Estado:** investigación documental. No es código implementado ni una compilación instalable.  
**Alcance:** completar el mapa de herramientas de sketch y documentar patrones 2D/3D y proyección para la futura app Android.

## 1. Inventario oficial de Sketch

El índice oficial de Shapr3D enumera estas herramientas:
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
- Project (Sketches)
- Trim
- Delete

Fuente: https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

Las herramientas Line y Arc, y el ciclo de sketch/planos, ya están cubiertos en la Parte 03. Esta entrega profundiza en las restantes y en sus relaciones.

## 2. Offset Edge (Sketch)

Crea nueva geometría de sketch a una distancia especificada de geometría existente. Puede operar sobre un elemento individual o sobre una cadena:
- **Single:** desplaza un único borde.
- **Chain:** desplaza una cadena conectada.
- Si el elemento seleccionado pertenece a varios loops, aparecen flechas para elegir qué loop desplazar.
- La dirección y distancia se controlan mediante gizmo.
- El historial permite editar el plano y, cuando aplique, las proyecciones asociadas.

Implicaciones para NOCTURNE:
- Distinguir cadena topológica de selección múltiple independiente.
- Construir offset geométrico real, no duplicación visual.
- Resolver esquinas/intersecciones, bucles cerrados, autointersecciones y distancias demasiado grandes.
- Mantener referencias estables para que la operación sea editable.

Fuente: https://support.shapr3d.com/hc/en-us/articles/7874298998172-Offset-Edge-Sketch

## 3. Move/Rotate (Sketch)

La herramienta mueve o rota entidades 2D seleccionadas dentro del contexto del sketch. Debe diferenciarse del Move/Rotate 3D: transforma geometría en el plano de sketch, preservando las restricciones que puedan mantenerse y recalculando las que resulten afectadas. La documentación del menú y los atajos confirma que es una herramienta propia del entorno Sketch.

Pendiente de verificación visual: grados de libertad del gizmo, pivote, selección de punto de anclaje, copia durante transformación y tratamiento de geometría restringida. No fijar detalles no confirmados hasta observar tutorial o app de referencia.

Fuente índice: https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

## 4. Pattern (Sketch)

Crea copias de entidades 2D espaciadas uniformemente. Incluye dos tipos:

### 4.1 Patrón lineal
- Distribución a lo largo de uno o dos ejes rectos.
- Seleccionar entidades del sketch.
- Definición **Total:** distancia global entre primera y última instancia.
- Definición **Spacing:** distancia entre instancias consecutivas.
- Control de cantidad de copias.
- Flechas de gizmo controlan dirección; puede definirse un segundo eje.
- La etiqueta de dimensión permite introducir el valor numérico.

### 4.2 Patrón circular
- Copias alrededor de un centro configurable mediante el gizmo.
- Definición **Total:** ángulo global del patrón.
- Definición **Spacing:** ángulo entre instancias consecutivas.
- Control de cantidad.
- Orientación **Uniform:** mantiene orientación original de cada copia.
- Orientación **Rotated:** rota cada instancia alrededor del centro del patrón.

### 4.3 Relación paramétrica
Los patrones de sketch incluyen una restricción de patrón predeterminada que mantiene la relación entre instancias. Un patrón no es simplemente un conjunto de duplicados independientes: debe permitir editar cantidad, distribución y parámetros compartidos manteniendo la asociación. El tutorial oficial muestra el uso de variables para controlar cantidad y separación.

Detalles confirmados:
- Patrón lineal en una o dos direcciones.
- Patrón circular con centro, ángulo, cantidad y orientación.
- Las instancias permanecen vinculadas por la restricción de patrón.
- En el tutorial, al eliminar la relación de patrón, los elementos pasan a ser entidades editables de manera independiente.

Implicaciones para NOCTURNE:
- Entidad Pattern con referencia al conjunto semilla, tipo, ejes/centro, cantidad, modo Total/Spacing, orientación y parámetros.
- Restricción/relación de patrón diferenciada de restricciones geométricas ordinarias.
- Edición de una instancia y propagación según las reglas del patrón.
- Pruebas de cambios de cantidad, separación, ángulo, variables y conversión a geometría independiente.

Fuentes:
- https://support.shapr3d.com/hc/en-us/articles/7874323891228-Pattern-Sketch
- https://support.shapr3d.com/hc/en-us/articles/12469977533212-Sketch-pattern

## 5. Trim

Elimina segmentos de sketch no deseados entre puntos o dentro de un contorno. Flujo documentado:
1. Entrar en Sketch > Trim.
2. Seleccionar los segmentos que se quieren eliminar.
3. Terminar tocando un área vacía de la cuadrícula o pulsando Escape.

Implicaciones:
- La selección debe resolver qué tramo de curva queda entre intersecciones.
- Recortar puede dividir una curva en segmentos topológicos y modificar perfiles cerrados.
- Actualizar restricciones, cotas, referencias, regiones cerradas y operaciones dependientes.
- Undo debe restaurar exactamente la topología anterior.
- No borrar la curva completa si el gesto selecciona solo un tramo.

Fuente: https://support.shapr3d.com/hc/en-us/articles/7874324658204-Trim

## 6. Delete (Sketch)

Permite eliminar entidades seleccionadas del sketch. Flujo documentado: seleccionar entidades, ejecutar Delete y terminar con Escape o Exit Sketching.

Para NOCTURNE, Delete debe diferenciar:
- eliminar entidad geométrica;
- eliminar relación/cota seleccionada;
- eliminar instancia o patrón completo;
- consecuencias sobre restricciones y operaciones que dependan de esa geometría.

Debe mostrar consecuencias coherentes y permitir Undo. La política exacta de cascada de dependencias se debe comprobar antes de copiar el comportamiento.

Fuente: https://support.shapr3d.com/hc/en-us/articles/9310918605980-Delete-Sketch

## 7. Text en Sketch

El índice oficial incluye Text como herramienta de Sketch y el manual describe texto colocado sobre un plano, una cara o una superficie compatible. Se usa para incorporar geometría tipográfica al diseño; no debe confundirse con una anotación de interfaz.

Pendiente de investigación visual:
- edición del contenido;
- selección de fuente y tamaño;
- conversión a curvas/perfiles;
- limitaciones de fuentes y caracteres;
- comportamiento sobre caras no planas;
- compatibilidad con extrusión y exportación.

Hasta confirmar estos detalles, NOCTURNE debe mantener Text como requisito del inventario, pero no inventar un panel de parámetros supuestamente idéntico.

Fuente general: https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

## 8. Project — proyección de geometría

La herramienta Project permite proyectar sketches, aristas o caras sobre otra cara o sketch. La proyección es importante para reutilizar geometría existente como referencia en un nuevo sketch.

Implicaciones:
- Transformar correctamente geometría entre sistemas de coordenadas 3D y el plano destino.
- Resolver proyección ortogonal y compatibilidad con la superficie destino conforme a la herramienta de referencia.
- Mantener vínculo con el origen proyectado cuando la operación sea asociativa.
- Distinguir geometría proyectada de geometría dibujada libremente.
- Si cambia el origen, recalcular proyección y dependencias; si deja de ser válida, señalar el error sin corromper el sketch.

El comportamiento exacto en superficies curvas y el carácter asociativo de cada modalidad deben validarse con la documentación/tutorial específico antes de implementar.

Fuente del índice: https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

## 9. Pattern (3D): no confundir con Pattern (Sketch)

La herramienta 3D está en Transform y puede distribuir cuerpos, perfiles de sketch o sketches completos:
- **Lineal:** hasta tres ejes.
- **Circular:** alrededor de un centro.
- **Total/Spacing:** distancia o ángulo global frente a separación entre copias.
- **Quantity:** número de instancias.
- En cuerpos 3D, las copias no quedan conectadas paramétricamente entre sí como las instancias del patrón 2D.
- Los cuerpos resultantes se organizan automáticamente en una carpeta del Items Manager para facilitar selección.

Esta diferencia es fundamental: Pattern (Sketch) mantiene una restricción de patrón dentro del sketch; Pattern (3D) organiza copias de objetos 3D y no crea una relación de edición solidaria entre los cuerpos resultantes.

Fuente: https://support.shapr3d.com/hc/en-us/articles/7874397541532-Pattern-3D

## 10. Matriz de pruebas propuesta

| ID | Prueba | Resultado esperado |
|---|---|---|
| OFF-01 | Offset Single de una línea | Copia paralela a distancia indicada |
| OFF-02 | Offset Chain de un loop | Cadena desplazada como conjunto |
| OFF-03 | Elemento compartido por dos loops | Permite elegir loop mediante dirección |
| OFF-04 | Offset que produce autointersección | Resultado controlado o error recuperable |
| MOV-SK-01 | Mover geometría libre | Posición actualizada en el plano |
| MOV-SK-02 | Mover geometría restringida | Solver conserva relaciones válidas o informa conflicto |
| PAT-SK-01 | Patrón lineal Total | Primera/última instancia delimitan distancia total |
| PAT-SK-02 | Patrón lineal Spacing | Distancia entre instancias consecutivas constante |
| PAT-SK-03 | Patrón en dos ejes | Rejilla 2D de instancias |
| PAT-SK-04 | Patrón circular Total/Spacing | Distribución angular correcta |
| PAT-SK-05 | Orientación Uniform/Rotated | Orientación corresponde al modo |
| PAT-SK-06 | Cambiar variable de cantidad | Patrón se actualiza |
| PAT-SK-07 | Romper relación de patrón | Instancias pasan a ser independientes |
| TRIM-01 | Recortar tramo entre intersecciones | Solo desaparece el segmento seleccionado |
| TRIM-02 | Recortar perfil cerrado | Regiones y topología se recalculan |
| DEL-01 | Borrar entidad con restricciones | Dependencias tratadas sin corrupción |
| TEXT-01 | Crear texto en plano | Texto visible y editable |
| TEXT-02 | Usar texto como perfil | Solo si conversión a geometría está soportada |
| PROJ-01 | Proyectar arista a sketch | Geometría aparece en el plano destino |
| PROJ-02 | Modificar geometría de origen | Proyección asociativa se actualiza, si aplica |
| PAT-3D-01 | Patrón lineal 3D en tres ejes | Distribución correcta |
| PAT-3D-02 | Patrón circular 3D | Copias alrededor del centro |
| PAT-3D-03 | Revisar Items Manager | Cuerpos patrón agrupados en carpeta |

## 11. Estado de certeza

**Confirmado por documentación oficial:** catálogo de Sketch; modos Single/Chain de Offset Edge; patrón lineal/circular y parámetros Total/Spacing/Quantity; orientación Uniform/Rotated; restricción de patrón 2D; pasos básicos de Trim y Delete; alcance general de Pattern 3D y diferencia de asociación entre patrones 2D y cuerpos 3D.

**Parcialmente confirmado / requiere observación adicional:** Move/Rotate Sketch, Text, detalles de Project, manejo de topología en Trim, propagación de restricciones al Offset y política de dependencias al Delete.

## 12. Criterio de salida

No iniciar la implementación completa de estas herramientas hasta terminar las fichas funcionales, resolver las dudas marcadas y preparar casos de prueba. El objetivo es paridad funcional observable en Android con implementación independiente, no una reproducción de código propietario.
