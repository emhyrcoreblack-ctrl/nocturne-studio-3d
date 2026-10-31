# Investigación Shapr3D para Android — Parte 3: ciclo de Sketch, planos y dibujo 2D

Fecha: 2026-10-31
Estado: investigación documental basada en el Manual/ayuda oficial. No es todavía una especificación final de implementación ni una prueba directa de la app en un dispositivo.

## 1. Ciclo general de un boceto

La secuencia base documentada es:
1. Elegir un plano de boceto o una cara plana.
2. Entrar en Sketch.
3. Dibujar entidades 2D con las herramientas del menú.
4. Aplicar restricciones y cotas para definir relaciones y medidas.
5. Salir del modo de boceto.
6. Utilizar perfiles cerrados en operaciones como extrusión o revolución; utilizar geometría abierta para trayectorias, guías o curvas proyectadas según la operación.

Shapr3D distingue perfiles cerrados (regiones encerradas) y bocetos abiertos (curvas no cerradas). Los perfiles cerrados pueden usarse como perfiles de extrusión/revolución/corte; los abiertos pueden servir para barridos, guías o curvas.

Fuentes:
- https://support.shapr3d.com/hc/en-us/articles/18816009328284-Sketching-in-Shapr3D
- https://support.shapr3d.com/hc/en-us/articles/7874240047388-Using-sketch-planes

## 2. Selección del plano

Se puede iniciar un boceto desde:
- un plano del mundo;
- una cara plana existente;
- un plano de construcción;
- el cubo de orientación;
- el menú de vistas.

En la interacción táctil documentada:
- abrir Sketch muestra los tres planos de referencia próximos al origen;
- tocar dos veces el plano elegido inicia el boceto;
- también se puede tocar dos veces una rejilla, cara plana o plano de construcción existente.

Cuando se está dibujando, la vista puede quedar normal al plano. Si el usuario rota accidentalmente la vista, existe el comando “Normal to Sketch” para regresar a una vista perpendicular al plano activo.

El boceto se organiza como item en Items Manager y como paso en History. Si inmediatamente se continúa dibujando sobre el mismo plano después de crear un sketch, Shapr3D puede continuar editando el boceto anterior; en otros casos crea un nuevo sketch. La versión es importante: el artículo indica que versiones anteriores a 5.590 organizaban los sketches de otra manera.

Fuentes:
- https://support.shapr3d.com/hc/en-us/articles/7874240047388-Using-sketch-planes
- https://support.shapr3d.com/hc/en-us/articles/7874247775004-Changing-a-sketch-plane

## 3. Cambiar el plano de un boceto existente

Mientras se está en Sketch mode, Move/Rotate (Sketch) permite desplazar el boceto entre planos mediante los tiles del centro del gizmo. La documentación indica restablecer primero la orientación de vista con doble toque en el Orientation Cube y luego mover el sketch con el gizmo.

Esto debe diferenciarse de cambiar la cámara: mover el plano del boceto modifica la ubicación/orientación de la geometría en el espacio; normalizar la vista solo cambia la cámara.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874247775004-Changing-a-sketch-plane

## 4. Herramientas de dibujo: inventario y comportamiento documentado

### 4.1 Automatic Line/Arc
Es una herramienta específica para uso con lápiz. En modo automático, reconoce trazos y puede crear líneas y arcos a partir del gesto del lápiz. Debe estudiarse aparte de Line y Arc porque la interpretación del trazo y la finalización dependen del dispositivo y de la entrada de lápiz.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

### 4.2 Line
- Se define primero el plano.
- Se activa Sketch > Line.
- Se coloca un punto inicial y luego puntos finales para construir segmentos conectados.
- Se pueden seguir añadiendo puntos para formar polilíneas.
- Cerrar la cadena conectando el último punto con el primero finaliza automáticamente el perfil.
- En flujo táctil con lápiz, la herramienta Line/Arc ofrece un selector de tipo de línea; se dibuja y se levanta el lápiz para terminar el segmento.

El historial puede permitir editar el plano y las proyecciones de la acción de línea automática, según el tipo de acción generada.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874250627484-Line

### 4.3 Arc
- Se activa Sketch > Arc.
- En flujo ratón/trackpad se colocan/arrastran los extremos, se ajusta la curvatura y se confirma.
- En flujo táctil con lápiz, se elige Arc desde el selector Line Type bajo Line/Arc, se dibuja el arco y se completa saliendo del área del sketch.
- La ayuda describe editar plano y proyecciones de la acción en History.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874294891804-Arc

### 4.4 Spline
La herramienta crea curvas suaves mediante puntos de control/ajuste (fit points). La tabla de gestos documenta que se puede añadir un punto de ajuste adicional con una pulsación prolongada sobre la spline. Se debe investigar la diferencia entre puntos de ajuste, tangencias y restricciones de la curva antes de especificar el solver.

Fuentes:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu
- https://support.shapr3d.com/hc/en-us/articles/7873906073884-Keyboard-shortcuts-gestures-and-hotkeys

### 4.5 Rectangle
El Manual confirma herramienta Rectangle y edición de dimensiones. La mecánica exacta de variantes (esquina-esquina, centro-esquina u otras), previsualización y entrada numérica deberá verificarse en la ficha individual de la versión de referencia. No asumir opciones por analogía con otro CAD.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

### 4.6 Circle
Crea un perfil circular cerrado de radio constante. El tutorial oficial describe seleccionar el centro y luego definir el radio mediante arrastre/toque; las dimensiones se pueden precisar posteriormente.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/13079114694684-Introduction-to-2D-sketch-tools-and-settings

### 4.7 Ellipse
El Manual la define como perfil cerrado definido por eje mayor y eje menor. Deben documentarse selección de primer eje, segundo eje, previsualización y edición dimensional exacta con el artículo específico antes de implementar.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

### 4.8 Polygon
Está en el menú Sketch. La tabla de atajos registra la tecla G en el uso con teclado. Pendiente confirmar el método de creación, número de lados, centro/radio, orientación y edición de parámetros.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7873906073884-Keyboard-shortcuts-gestures-and-hotkeys

### 4.9 Offset Edge (Sketch)
Está listado como herramienta de boceto. Debe documentarse su selección de aristas/perfiles, distancia, dirección, unión de esquinas y comportamiento ante autointersecciones antes de programar.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

### 4.10 Move/Rotate (Sketch)
Transforma entidades de boceto en el plano, con gizmo. Se debe distinguir de Move/Rotate 3D, que opera en el espacio 3D sobre cuerpos y otras geometrías.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

### 4.11 Pattern (Sketch)
La herramienta Pattern está en el menú Sketch y tiene una página específica de restricciones de patrón. La definición final deberá registrar tipo de patrón, dirección, cantidad, separación, selección de entidades y relación paramétrica entre instancias.

Fuentes:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu
- https://support.shapr3d.com/hc/en-us/sections/7768308896540-Sketch-controls

### 4.12 Text
La herramienta Text aparece en el menú Sketch. Debe investigarse cómo se introduce el texto, fuente, tamaño, alineación, contorno y conversión a geometría utilizable por operaciones CAD.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

### 4.13 Trim
La herramienta recorta segmentos de geometría de boceto. Se debe investigar cómo detecta regiones y cruces, qué ocurre con restricciones existentes, y cómo maneja perfiles cerrados o abiertos.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

### 4.14 Delete
El Manual lista Delete como herramienta de boceto. Debe distinguirse borrar entidades de boceto, borrar restricciones seleccionadas y desconectar puntos. Investigar la propagación de cambios sobre perfiles y operaciones posteriores.

Fuente:
- https://support.shapr3d.com/hc/en-us/sections/7768311423516-Sketch-menu

## 5. Estados de boceto y puntos

Los estados de boceto expresan grados de libertad:
- Under-defined (azul): quedan movimientos o cambios posibles.
- Fully-defined (verde): las relaciones y dimensiones fijan la geometría; no puede moverse libremente salvo al modificar/eliminar una restricción o cota.

El artículo de estados describe tres grados de libertad básicos para una entidad lineal: rotación, desplazamiento horizontal y desplazamiento vertical. La clasificación completa depende del tipo de entidad y sus parámetros.

Los puntos de boceto también tienen estados visuales propios; puntos conectados, coincidentes o sujetos a punto medio se muestran con centro relleno, según la documentación de restricciones.

Fuentes:
- https://support.shapr3d.com/hc/en-us/articles/7409883850908-Sketch-states
- https://support.shapr3d.com/hc/en-us/articles/7407627891100-Adding-and-removing-constraints

## 6. Ajustes y guías de boceto

El sistema de snapping y sketch guide ayuda a alinear geometría y crear restricciones al dibujar. El tutorial oficial describe guías que detectan horizontal, vertical y perpendicular, y relaciones de coincidencia entre entidades separadas. Debe mantenerse una distinción explícita entre:
- snap temporal (ayuda de colocación);
- guía visual (indicación de alineación);
- restricción persistente (relación almacenada en el modelo).

No toda alineación visual debe convertirse en restricción, y la política de auto-constraining debe ser configurable.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/12469904681244-Connecting-sketches-using-coincidence-constraints
- https://support.shapr3d.com/hc/en-us/articles/13079114694684-Introduction-to-2D-sketch-tools-and-settings

## 7. Criterios de aceptación del subsistema Sketch

1. El usuario puede seleccionar plano mundo, cara plana o plano de construcción y entrar en boceto.
2. La cámara se normaliza al plano y puede volver a normalizarse después de una órbita accidental.
3. Las entidades se almacenan en coordenadas del plano, no como coordenadas de pantalla.
4. El sistema diferencia perfil cerrado y geometría abierta.
5. La cadena de líneas se cierra automáticamente cuando el extremo final coincide con el inicial.
6. El boceto aparece como elemento independiente en Items Manager y como paso en History.
7. Se puede reabrir y editar el sketch sin perder sus entidades.
8. Mover el sketch a otro plano cambia su transformación geométrica, no solo la cámara.
9. Las entidades y puntos tienen estados visuales coherentes con sus grados de libertad.
10. Snap, guías y restricciones persistentes se distinguen internamente.
11. La herramienta activa se puede cancelar sin dejar geometría parcial no confirmada.
12. Las operaciones posteriores reaccionan correctamente a la edición del sketch o notifican un error sin destruir el último resultado válido.

## 8. Matriz de avance

| Elemento | Estado |
|---|---|
| Flujo general Sketch | Documentado |
| Selección de plano | Documentada |
| Normal to Sketch | Documentado |
| Reutilización/creación de sketch según contexto | Documentada con nota de versión |
| Cambio de plano del sketch | Documentado |
| Line | Documentado a nivel básico |
| Arc | Documentado a nivel básico |
| Automatic Line/Arc | Inventariado; detalle parcial |
| Spline | Inventariado; detalle parcial |
| Rectangle | Inventariado; detalle parcial |
| Circle | Documentado a nivel básico |
| Ellipse | Inventariado; detalle parcial |
| Polygon | Inventariado; detalle parcial |
| Offset Edge (Sketch) | Inventariado; detalle pendiente |
| Move/Rotate (Sketch) | Inventariado; detalle parcial |
| Pattern (Sketch) | Inventariado; detalle parcial |
| Text | Inventariado; detalle pendiente |
| Trim | Inventariado; detalle pendiente |
| Delete | Inventariado; detalle pendiente |
| Sketch states | Documentado |
| Sketch point states | Parcial |
| Snapping / guides | Documentado a nivel conceptual |
| Cotado y restricciones | Se estudiarán en la Parte 4 |

## 9. Próxima parte

Investigar el sistema de cotas y restricciones: edición de dimensiones, unidades, variables y expresiones, auto-constraining, anclaje de entidades, estados de puntos, grados de libertad, todas las restricciones individuales y tratamiento de conflictos. Después completar las fichas detalladas pendientes de las herramientas de dibujo.
