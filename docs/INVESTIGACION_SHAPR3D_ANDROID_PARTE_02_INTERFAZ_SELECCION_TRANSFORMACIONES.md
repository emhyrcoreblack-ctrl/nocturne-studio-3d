# Investigación Shapr3D — Interfaz, selección, acceso contextual y transformaciones (Parte 2)

Fecha: 2026-10-31
Proyecto: NOCTURNE STUDIO 3D para Android
Estado: investigación documental parcial; pendiente contraste visual con versión concreta de Shapr3D.

## 1. Espacio de trabajo y acceso a herramientas

La documentación describe varios mecanismos complementarios:

### 1.1 Menús flotantes
Los menús se sitúan a los lados del espacio de modelado y flotan sobre el lienzo para mantener el modelo visible. El menú principal se ubica a la izquierda y las restricciones de boceto aparecen a la derecha. Las herramientas de boceto y modelado están agrupadas en submenús. Desde el menú principal también se accede al Project Sidebar y al Items Manager.

En iPadOS, el usuario puede cambiar la ubicación del menú principal para preferir el lado derecho.

### 1.2 Project Sidebar
Permite cambiar entre los espacios Modeling, Visualization y 2D Drawings. También facilita crear, renombrar o eliminar dibujos 2D.

### 1.3 Adaptive User Interface
El menú adaptativo recomienda herramientas según la geometría seleccionada:
- Cara seleccionada → Offset Face.
- Perfil de boceto seleccionado → Extrude.
- Cuerpo seleccionado → Move/Rotate.
- Línea o curva de boceto → Sketch mode.
- Línea y cara → Rotate Around Axis.
- Perfil de boceto y eje → Revolve.
- Dos caras de cuerpos diferentes → opciones como Align y Replace Face.

Se puede abrir More para ver herramientas adicionales válidas para la selección. Algunas herramientas iniciadas desde el menú adaptativo se completan tocando un área vacía de la rejilla, sin pulsar necesariamente Done.

### 1.4 Modos
Section View y Measurement Mode pueden estar disponibles sin selección; al seleccionar elementos o activar herramientas, los modos ofrecidos cambian según el contexto.

### 1.5 Command Search
Permite buscar herramientas por nombre y lanzar el comando desde resultados. Si hay elementos preseleccionados, los resultados se filtran para la selección actual.

### 1.6 Menús contextuales
Con ratón/trackpad se accede mediante clic secundario. Las opciones dependen del contexto: cubo de orientación, boceto, modelado, visualización o dibujos 2D. En Android táctil habrá que estudiar qué alternativa equivalente existe y evitar asignar una pulsación larga sin verificar sus conflictos con selección y gestos del sistema.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7378907587484-Accessing-tools
- https://support.shapr3d.com/hc/en-us/articles/7873882619548-Adaptive-user-interface
- https://support.shapr3d.com/hc/en-us/articles/7873942151068-Context-menus

## 2. Selección de geometría

La selección no es una acción aislada: determina el conjunto de herramientas disponibles. La documentación indica que los menús se personalizan según lo seleccionado; por ejemplo, un cuerpo ofrece herramientas de cuerpo y un elemento de boceto ofrece herramientas de boceto.

Los bocetos totalmente definidos aparecen verdes y los subdefinidos azules, según el artículo de selección consultado. Un boceto completamente definido permanece fijo salvo que se elimine una restricción o cota.

La documentación también contempla:
- selección de geometría mediante lápiz, ratón o trackpad;
- selección de elementos y restricciones de boceto;
- selección múltiple y filtros;
- selección completa de objeto mediante doble toque/clic, según dispositivo;
- selección por área y selección a través de geometría en los atajos correspondientes.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7770768736924-Selecting-geometry
- https://support.shapr3d.com/hc/en-us/articles/7873906073884-Keyboard-shortcuts-gestures-and-hotkeys

Pendiente de ficha completa:
- prioridad de selección cuando caras/aristas están superpuestas;
- ciclo entre candidatos;
- tolerancia táctil y radio de selección;
- preselección frente a selección confirmada;
- filtros disponibles por tipo;
- comportamiento exacto en Sketch mode;
- selección a través de sólidos y selección por área;
- cómo se resuelve la selección en pantalla pequeña.

## 3. Items Manager

El Items Manager lista los elementos del proyecto y sirve tanto para organización como para selección. Cada elemento tiene un tipo e icono. La documentación identifica:
- Body.
- Sketch plane.
- Construction plane o axis.
- Mesh.
- Image.
- Folder.

También menciona que cada sketch, body, plane, axis, image y 2D Drawing aparece como item. Se puede filtrar por All Items y tipo de elemento, seleccionar conjuntos de elementos y lanzar herramientas desde el menú adaptativo. El panel puede redimensionarse para ver nombres largos o jerarquías profundas.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7873936188956-Items-Manager

Diferencia conceptual que debe conservar NOCTURNE:
- Items Manager: inventario/organización/visibilidad/selección de elementos del proyecto.
- History: secuencia de acciones paramétricas que construyeron o modificaron el modelo.
No fusionar ambos conceptos en un único árbol sin documentar el comportamiento de referencia.

Pendiente:
- carpetas y jerarquía;
- ocultar/mostrar y filtros;
- Reveal in Items;
- visibilidad global de ocultos;
- orden y selección múltiple;
- comportamiento al borrar un elemento usado por operaciones posteriores.

## 4. Gizmo de movimiento y copia

El gizmo proporciona controles direccionales y de rotación en varias herramientas.

### 4.1 Centro
El centro del gizmo define el centro de rotación y controla su orientación. Se puede arrastrar y ajustar a geometría existente: ejes, caras, aristas, perfiles de boceto y geometría de construcción. Algunas herramientas ofrecen Auto-orientation para controlar la alineación del gizmo.

### 4.2 Flechas
Las flechas tienen dos formas de uso:
- arrastrar para mover/rotar dinámicamente;
- seleccionar una flecha e introducir un valor preciso.

### 4.3 Baldosas
Las tiles permiten movimientos lineales sobre un plano.

### 4.4 Etiquetas de dimensión
Muestran el valor actual junto a la flecha. En entrada táctil/lápiz, se toca la etiqueta para modificar el valor mediante el teclado numérico.

### 4.5 Copy badge y Link badge
Copy activa duplicación en lugar de mover el original. Manteniéndolo activo se pueden crear múltiples copias. Link controla si la acción de copia queda vinculada al historial; una copia no vinculada aparece como Unlinked Copy.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7383914603548-Move-and-copy-items-using-the-gizmo

## 5. Transformaciones 3D documentadas

### 5.1 Move/Rotate (3D)
Puede mover o rotar regiones de boceto, aristas, caras y cuerpos. Usa gizmo con flechas y tiles, alineación a geometría, etiquetas dimensionales y copia. Al seleccionar un cuerpo, la herramienta puede activarse automáticamente; doble toque en una cara selecciona el cuerpo completo. Se confirma con Done.

En History se pueden revisar/modificar referencias como centro inicial, cuerpos objetivo, caras objetivo, aristas objetivo y estado de copia.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874396289308-Move-Rotate-3D

### 5.2 Translate
Mueve bocetos, perfiles o cuerpos mediante un vector definido por punto inicial y punto final. Los puntos se ajustan a rejilla, aristas o vértices. Puede copiar y registra ambos puntos y los elementos objetivo en History.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7888735383580-Translate

### 5.3 Scale
Incluye modos Uniform y Non-uniform. El modo uniforme escala proporcionalmente desde un punto central; el no uniforme permite diferentes proporciones por eje y definir el centro mediante el gizmo. Puede escalar una copia.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7874396722460-Scale

### 5.4 Copia
La copia no pertenece exclusivamente a Move/Rotate. Según herramienta puede usarse un Copy badge o una casilla:
- Move/Rotate: copia de cuerpo mediante gizmo.
- Move/Rotate (Sketch): copia de elementos de boceto.
- Translate: copia desplazada por vector.
- Scale: copia a otra escala.
- Rotate Around Axis: copia rotada alrededor de eje.

Fuente:
- https://support.shapr3d.com/hc/en-us/articles/7369335889564-Copying-items

## 6. Requisitos de reproducción en Android

No implementar una barra de herramientas genérica como sustituto de la experiencia completa. La arquitectura de interfaz deberá contemplar:

1. Espacio de modelado persistente y dominante.
2. Menús laterales flotantes y paneles desplegables.
3. Project Sidebar con espacios de trabajo.
4. Items Manager separado de History.
5. Selección contextual con menú adaptativo.
6. Acceso completo por menús y búsqueda de comandos, no solo por contexto.
7. Gizmo 3D con centro reubicable, flechas, rotación, tiles, valores numéricos, copia y alineación.
8. Transformaciones paramétricas registradas en History.
9. Tolerancias táctiles apropiadas para dedos, con precisión numérica para tareas CAD.
10. Comportamiento equivalente con lápiz cuando Android y el hardware lo permitan.

## 7. Criterios de aceptación iniciales

### Acceso contextual
- Seleccionar una cara ofrece Offset Face cuando sea geométricamente válido.
- Seleccionar un perfil cerrado ofrece Extrude.
- Seleccionar un cuerpo ofrece Move/Rotate.
- Seleccionar perfil y eje ofrece Revolve.
- La lista More solo muestra comandos válidos para el conjunto de selección.
- La búsqueda de comandos respeta la selección previa.

### Items Manager
- Todo elemento de proyecto aparece con tipo reconocible.
- Seleccionar un elemento en el panel selecciona el mismo elemento en el viewport.
- El filtro por tipo limita la lista sin borrar elementos.
- Items Manager no se confunde con el historial de operaciones.

### Gizmo y transformaciones
- Arrastrar flecha cambia posición/ángulo en el eje esperado.
- Introducir un valor produce desplazamiento/rotación exactos en unidades del documento.
- Reubicar centro cambia pivote/orientación sin alterar geometría de forma inesperada.
- Copy crea una copia separada y mantiene el original.
- Link/unlink se refleja en el comportamiento de historial.
- Translate usa el vector entre dos puntos capturados.
- Scale uniforme conserva proporciones; no uniforme permite cambiarlas por eje.
- Cancelar no deja una transformación parcial.

## 8. Estado de esta parte

| Elemento | Estado |
|---|---|
| Menús flotantes y Project Sidebar | Comportamiento básico investigado |
| Adaptive UI | Ejemplos de selección/herramienta documentados |
| Command Search | Función básica documentada |
| Context menus | Disponibilidad documentada para ratón/trackpad |
| Selección de geometría | Principios básicos documentados |
| Items Manager | Inventario y función básica documentados |
| Gizmo | Centro, flechas, tiles, dimensiones y copia documentados |
| Move/Rotate 3D | Función básica e historial documentados |
| Translate | Función básica e historial documentados |
| Scale | Modos uniforme/no uniforme documentados |
| Copying items | Variantes por herramienta documentadas |
| Detalle de gestos/selección en cada estado | Pendiente |
| Inspección visual y pruebas Android | Pendiente |

## 9. Próxima parte

Continuar con bocetos, comenzando por el ciclo de entrada/salida del modo Sketch, definición/cambio de plano, estados de boceto y puntos notables. Después estudiar cada herramienta de dibujo individualmente, en el orden del Manual, antes de pasar a restricciones.
