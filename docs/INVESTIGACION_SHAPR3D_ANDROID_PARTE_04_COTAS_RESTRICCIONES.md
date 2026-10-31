# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 04
## Cotas, restricciones geométricas y expresiones

**Estado:** investigación documental; todavía no implementado ni listo para pruebas de usuario.  
**Objetivo:** especificar con precisión el comportamiento observable del sistema de cotas y restricciones de sketch para la futura versión Android de NOCTURNE.

> Esta documentación describe una implementación independiente basada en documentación pública de Shapr3D. No implica copiar código, recursos, marca ni componentes propietarios.

## 1. Modelo mental confirmado

Un sketch está formado por entidades 2D (líneas, arcos, círculos, splines, etc.). Las cotas fijan medidas; las restricciones fijan relaciones geométricas. Ambas reducen grados de libertad y conservan la intención del diseño al editar.

- **Azul:** entidad subdefinida; conserva uno o más grados de libertad.
- **Verde:** entidad completamente definida; no puede desplazarse o cambiar de forma sin modificar/eliminar restricciones o cotas.
- Para una línea, la documentación describe tres grados de libertad visibles: rotación, desplazamiento horizontal y desplazamiento vertical.
- El menú de restricciones adapta las opciones a la selección actual; solo deben ofrecerse relaciones válidas para los tipos de entidades seleccionados.

Fuentes:  
- https://support.shapr3d.com/hc/en-us/articles/18816009328284-Sketching-in-Shapr3D
- https://support.shapr3d.com/hc/en-us/articles/7409883850908-Sketch-states
- https://support.shapr3d.com/hc/en-us/articles/7873983670044-Constraints-overview

## 2. Cotas de sketch

Cada elemento de sketch puede mostrar una etiqueta de dimensión. La etiqueta es seleccionable y editable; en interacción táctil se abre el teclado numérico/calculadora.

Tipos documentados:
1. Longitud.
2. Diámetro.
3. Radio.
4. Ángulo.

La documentación pública indica que la longitud puede definir la distancia entre dos extremos y distingue tipos de distancia. Debemos verificar visualmente todas las variantes de colocación de cotas antes de fijar el comportamiento final.

Flujo base:
1. Seleccionar entidad.
2. Tocar/clicar etiqueta de dimensión.
3. Introducir valor o expresión.
4. Confirmar; recalcular geometría y resolver restricciones.
5. Mostrar error recuperable si la nueva cota es incompatible con las relaciones existentes.

Fuente:  
https://support.shapr3d.com/hc/en-us/articles/7874245890844-Editing-sketch-dimensions

## 3. Entrada numérica y calculadora

Los campos numéricos aparecen en parámetros de herramientas 2D y 3D. En táctil se toca la etiqueta, se abre el campo, y el botón de teclado abre el numpad/calculadora; se confirma con check. La documentación recomienda punto decimal, no coma.

Operaciones aritméticas básicas confirmadas:
- suma (+)
- resta (-)
- multiplicación (*)
- división (/)

Ejemplo documentado: `10 + 5` produce `15`.

Fuente:  
https://support.shapr3d.com/hc/en-us/articles/7874038080668-Defining-and-calculating-numerical-values

## 4. Variables y expresiones

Las variables nombradas se reutilizan en distintos parámetros. Al cambiar una variable, deben actualizarse automáticamente todos los valores dependientes. Las variables aparecen en History Sidebar, donde se pueden cambiar de valor o renombrar y actualizar referencias.

Las expresiones se admiten en campos numéricos para distancias, ángulos, cantidades, cotas de sketch y transformaciones.

### Operadores y funciones documentados
- Aritmética: +, -, *, /.
- Paréntesis y precedencia estándar.
- Funciones trigonométricas inversas: asin, acos, atan, atan2, acot, asec, acsc.
- pi() y radians(x).
- Unidades explícitas para longitud y ángulos.

### Unidades documentadas
- Longitud: mm, cm, m, in, ft.
- Ángulo: deg.
- Conversiones mixtas: `5 mm + 2 cm` → 25 mm.
- Si no se indica unidad, se usa la unidad predeterminada del espacio de trabajo.
- Los resultados de expresiones en campos deben ser una sola dimensión compatible (longitud, ángulo o escalar); una expresión de área/volumen no es válida en un campo de longitud.
- Los ángulos deben indicar unidad explícita, por ejemplo `30 deg`.
- Se admite entrada fraccionaria imperial con reglas específicas; no aceptar formatos ambiguos.
- En expresiones complejas se usa punto decimal; coma no soportada en llamadas a funciones o definiciones de unidades.

### Implicaciones para NOCTURNE
Implementar parser tipado por dimensiones (scalar, length, angle), conversión interna a unidades base, precedencia matemática, evaluación segura sin ejecutar código arbitrario, detección de ciclos de variables y propagación de cambios. No basta con usar eval().

Fuente:  
https://support.shapr3d.com/hc/en-us/articles/18320182069916-Variables-and-expressions

## 5. Catálogo de restricciones

La sección oficial enumera las siguientes relaciones. La semántica resumida a continuación está confirmada por el índice oficial y el glosario; las reglas exactas de selección y resolución deberán verificarse con pruebas de interacción.

| Restricción | Efecto geométrico | Selección típica |
|---|---|---|
| Parallel | Mantiene líneas paralelas | Dos o más líneas |
| Perpendicular | Mantiene 90° | Líneas compatibles |
| Tangent | Mantiene tangencia sin cruce local | Línea/arco/círculo compatibles |
| Coincident | Une puntos o hace coincidir geometría | Puntos, extremos o entidad compatible |
| Midpoint | Sitúa un punto en el centro de una línea | Punto + línea |
| Concentric | Comparte centro entre arcos/círculos | Dos o más arcos/círculos |
| Horizontal/Vertical | Alinea una línea con eje horizontal/vertical del plano | Línea |
| Equal | Igual longitud de líneas o igual radio de arcos/círculos | Entidades del mismo tipo compatible |
| Symmetry | Mantiene elementos reflejados respecto a un eje | Elementos + eje |
| Disconnect | Rompe una conexión entre puntos conectados | Punto de unión |
| Lock/Unlock | Fija o libera la entidad en su posición actual | Entidad/punto |
| Make Construction | Convierte geometría normal en geometría de construcción | Entidad de sketch |

Fuente del catálogo:  
https://support.shapr3d.com/hc/en-us/sections/9307825076892-Constraints-menu  
Glosario: https://support.shapr3d.com/hc/en-us/articles/7644593398172-Glossary-of-terms

## 6. Restricciones automáticas y guías

La opción Auto-constraining controla si se agregan restricciones automáticamente o manualmente.

- **Desactivada:** se crean automáticamente solo restricciones entre extremos o puntos medios conectados.
- **Activada:** además pueden generarse Horizontal/Vertical, Perpendicular, Tangent (cuando se crea un arco en un extremo) y Coincident.
- Las Sketch Guide Lines ayudan a alinear entidades y automatizar estas relaciones.
- El tutorial oficial muestra guías para horizontal, vertical, perpendicular y coincidencia; también demuestra la conexión de entidades separadas mediante coincidencia.

No se debe confundir ajuste visual (snapping) con restricción persistente: la app debe guardar la relación geométrica que realmente se haya creado, no solo la posición aproximada del cursor.

Fuentes:
- https://support.shapr3d.com/hc/en-us/articles/7394385784476-Constraint-Settings
- https://support.shapr3d.com/hc/en-us/articles/12469904681244-Connecting-sketches-using-coincidence-constraints

## 7. Gestión de restricciones

El flujo documentado:
1. Seleccionar entidades.
2. El menú de restricciones muestra/activa relaciones aplicables.
3. Aplicar la relación deseada.
4. Para eliminar relaciones, usar Disconnect, Unlock o el icono de borrar correspondiente, según el caso.
5. El menú de restricciones puede abrirse automáticamente en modo Sketch y adaptar su contenido a la selección.

La interfaz debe permitir visualizar restricciones aplicadas y distinguirlas de cotas y guías temporales. Debe ser posible seleccionar una relación y quitarla sin borrar accidentalmente la geometría asociada.

Fuente:  
https://support.shapr3d.com/hc/en-us/articles/7407627891100-Adding-and-removing-constraints

## 8. Atajos y entradas

La tabla oficial de atajos ofrece, en plataformas con teclado, accesos para herramientas de sketch y restricciones. No deben trasladarse literalmente a Android táctil; sirven como referencia para teclado físico opcional. La experiencia táctil debe exponer las mismas capacidades mediante menús contextuales y controles accesibles.

Fuente:  
https://support.shapr3d.com/hc/en-us/articles/7873906073884-Keyboard-shortcuts-gestures-and-hotkeys

## 9. Especificación técnica propuesta para NOCTURNE

### 9.1 Modelo de datos
Cada entidad de sketch debe conservar:
- identificador estable;
- tipo geométrico y parámetros;
- plano/transformación local;
- puntos de control y topología;
- cotas asociadas;
- restricciones asociadas;
- bandera de geometría de construcción;
- estado de definición derivado del solver, no almacenado como verdad independiente.

Cada restricción debe guardar tipo, referencias estables a entidades/puntos, parámetros (si aplica), estado de supresión/validez y procedencia (manual/automática).

### 9.2 Solver
Se requiere un solucionador geométrico 2D con:
- variables geométricas y ecuaciones por restricción;
- resolución incremental al mover o editar;
- cálculo de grados de libertad;
- detección de restricciones redundantes, incompatibles o degeneradas;
- estabilidad numérica y tolerancias geométricas;
- preservación de la solución más cercana a la posición previa cuando haya múltiples soluciones;
- propagación de cambios por variables y cotas.

No declarar un sketch verde únicamente porque todos los elementos tengan alguna etiqueta: el solver debe verificar que no quedan grados de libertad relevantes.

### 9.3 Parser de expresiones
Parser propio y seguro con AST, evaluación dimensional, validación de unidades, funciones permitidas, referencias a variables, detección de ciclos y mensajes de error claros. Las conversiones se hacen internamente a unidades base y se presentan en unidad del proyecto.

### 9.4 Interfaz táctil
- Etiquetas de dimensión tocables y editables.
- Teclado numérico con operadores y selector de variables/unidades.
- Iconos de restricciones con hit targets amplios.
- Guías temporales diferenciadas de restricciones persistentes.
- Feedback inmediato de entidad azul/verde.
- Undo/redo atómico para cada aplicación/eliminación de cota o restricción.
- Evitar que el teclado o paneles tapen la geometría que se está editando.

## 10. Matriz de pruebas de aceptación

| ID | Prueba | Resultado esperado |
|---|---|---|
| DIM-01 | Cambiar longitud de una línea | Longitud exacta y geometría recalculada |
| DIM-02 | Cambiar radio/diámetro | Curva actualizada sin perder referencias |
| DIM-03 | Editar ángulo | Relación angular exacta |
| DIM-04 | Introducir 12+34 | Resultado 46 |
| DIM-05 | Introducir 5 mm + 2 cm | Conversión correcta a unidad del proyecto |
| VAR-01 | Crear variable y usarla en dos cotas | Ambas cotas responden al cambiar variable |
| VAR-02 | Crear dependencia circular | Error explícito; no bloquear la app |
| CON-01 | Aplicar horizontal/vertical | Línea mantiene alineación al editar |
| CON-02 | Aplicar parallel/perpendicular | Relación persiste ante cambios |
| CON-03 | Aplicar tangent | Contacto tangente estable |
| CON-04 | Aplicar coincident/midpoint | Puntos comparten posición exacta |
| CON-05 | Aplicar concentric/equal | Centro/radio o longitud compartida |
| CON-06 | Aplicar symmetry | Pareja permanece simétrica al editar |
| CON-07 | Lock y luego Unlock | Fija/libera grados de libertad correctamente |
| CON-08 | Disconnect | Se separa la unión sin borrar entidades |
| CON-09 | Make Construction | Geometría deja de formar perfil sólido, pero sigue visible/utilizable como referencia |
| AUTO-01 | Auto-constraints OFF | Solo conexiones de extremos/medios automáticas |
| AUTO-02 | Auto-constraints ON | Se generan las relaciones compatibles descritas |
| STATE-01 | Sketch incompleto | Azul y desplazable |
| STATE-02 | Sketch completamente restringido | Verde y estable |
| UNDO-01 | Aplicar restricción y deshacer | Revierte solo esa operación |
| TOUCH-01 | Editar cota con teclado táctil | Flujo usable sin teclado físico |

## 11. Pendientes de verificación antes de implementar

La documentación escrita no define todos los detalles de UX ni del solver. Antes de codificar, hay que contrastar en una instalación de referencia o tutoriales oficiales:
- orden exacto de selección para cada restricción;
- selección de ejes de simetría y comportamiento con líneas de construcción;
- qué entidades acepta Equal en cada combinación;
- cotas de distancia entre dos entidades y posición de etiquetas;
- resolución de conflictos, prioridades y mensajes al sobre-restringir;
- edición de cotas de splines y estados de puntos;
- patrón de sketch y su restricción específica;
- comportamiento exacto de Delete/Disconnect/Unlock;
- restricciones automáticas en intersecciones y casos límite.

## 12. Criterio de salida de esta fase

Esta entrega es una especificación de investigación, **no una versión instalable**. No está lista para probar como aplicación. La fase funcional de sketch solo podrá considerarse implementada cuando todas las pruebas DIM, VAR, CON, AUTO, STATE, UNDO y TOUCH estén automatizadas y superadas en Android, además de una ronda manual con lápiz/táctil y pantalla de tamaño real.
