# Directriz del proyecto: NOCTURNE STUDIO 3D para Android — reconstrucción funcional de referencia Shapr3D

Fecha: 2026-10-31
Repositorio: `emhyrcoreblack-ctrl/nocturne-studio-3d`

## 1. Decisión principal del proyecto

El proyecto se replantea desde cero como una aplicación CAD 3D dirigida a Android. La referencia principal de análisis funcional, interacción y experiencia de usuario será Shapr3D.

La instrucción del proyecto es avanzar **una función a la vez, en orden, sin saltarse etapas**. Antes de implementar una función se investigará y documentará su comportamiento; después se especificará, implementará y probará. No se declarará terminada por tener solamente un botón o una representación visual.

Orden de trabajo acordado:
1. Investigar y documentar exhaustivamente la experiencia observable de Shapr3D.
2. Reconstruir de manera independiente sus flujos de trabajo y capacidades observables, buscando la mayor fidelidad funcional y de interacción posible.
3. Completar y verificar primero esa versión de referencia.
4. Solo después aplicar una apariencia visual personalizada a NOCTURNE, sin cambiar arbitrariamente las funciones ya verificadas.

La personalización visual queda expresamente aplazada. No se deben añadir funciones propias, eliminar herramientas de la referencia ni alterar el flujo de trabajo por preferencias de diseño durante la etapa de paridad funcional, salvo que una limitación técnica, de plataforma, accesibilidad, seguridad o licencia obligue a documentar una diferencia.

## 2. Alcance y límite legal/técnico

“Recrear Shapr3D tal cual” se interpreta como un objetivo de **paridad observable de funciones, comportamiento, flujos, jerarquía de herramientas, respuestas de interfaz y precisión CAD**, no como copiar literalmente el producto propietario.

No se copiarán ni extraerán código fuente privado, binarios, recursos gráficos protegidos, marca, iconos propietarios, contenido interno ni mecanismos de protección. El uso personal no convierte automáticamente la copia de esos elementos en autorizada. La implementación será independiente, basada en documentación pública, observación legítima de la aplicación, formatos abiertos y componentes cuya licencia permita el uso previsto.

Cuando una característica no pueda reproducirse igual en Android, se documentarán:
- comportamiento original observado;
- limitación concreta;
- alternativa más fiel posible;
- impacto en la experiencia;
- pruebas que demuestren la diferencia.

No se cambiará silenciosamente el comportamiento de referencia.

## 3. Principios no negociables

- No saltar herramientas ni fases.
- No confundir apariencia con funcionalidad.
- No simular operaciones CAD con simples cambios visuales.
- No presentar una malla triangular como sólido B-rep editable.
- No representar cotas como texto decorativo: deben controlar la geometría cuando sean cotas conductoras.
- No representar el historial como una lista de nombres: debe reconstruir operaciones y dependencias.
- No sustituir ni rediseñar la experiencia de referencia antes de completar la etapa funcional.
- No introducir personalización estética prematuramente.
- No afirmar que una función está terminada sin pruebas reproducibles.
- Cada etapa debe preservar las funciones que ya hayan sido verificadas.

## 4. Ficha obligatoria para cada herramienta o flujo

Cada elemento investigado tendrá una ficha con:
1. Nombre y propósito.
2. Ubicación en la interfaz y formas de acceso.
3. Estado previo y selección necesaria.
4. Secuencia exacta de interacción.
5. Gestos, toques, lápiz y entradas numéricas.
6. Opciones, parámetros, unidades y valores por defecto.
7. Vista previa y respuesta visual.
8. Confirmar, cancelar, deshacer y rehacer.
9. Errores, restricciones y casos límite.
10. Resultado geométrico y efecto sobre el modelo.
11. Efecto en árbol, historial y dependencias.
12. Diferencias entre plataformas cuando existan.
13. Criterios de aceptación y pruebas.
14. Estado: no investigado / investigado / especificado / implementado / probado / aprobado.

No avanzar a la siguiente herramienta hasta cerrar la ficha y los criterios de aceptación de la actual, salvo dependencias técnicas justificadas y registradas.

## 5. Áreas de investigación, en orden

### 5.1 Aplicación, proyectos y documentos
- Inicio, creación y apertura de proyectos.
- Guardado, recuperación, duplicación y gestión de documentos.
- Nombres, unidades, preferencias y ajustes.
- Importación, exportación y recuperación ante errores.

### 5.2 Espacio de trabajo y navegación
- Viewport, cámara, perspectiva y ortográfica.
- Órbita, pan, zoom y gestos multitáctiles.
- Selección, preselección, resaltado y deselección.
- Cubo de orientación y vistas estándar.
- Rejilla, origen, ejes, planos y visibilidad.
- Adaptación a móviles y tabletas Android, densidades y orientaciones.

### 5.3 Organización del modelo
- Elementos, cuerpos, componentes y carpetas si corresponden.
- Árbol/administrador de elementos.
- Visibilidad, ocultar/mostrar, aislar y selección.
- Renombrar, ordenar, agrupar y eliminar.
- Origen, planos y ejes de referencia.

### 5.4 Bocetos 2D
Investigar todas las herramientas de dibujo, incluyendo línea, rectángulo, círculo, arco, spline, elipse, polígono, punto, texto, geometría de construcción, recortar, extender, desfase, transformar y cualquier herramienta disponible en la versión de referencia.

Investigar también:
- selección y edición de entidades;
- inferencias y ajuste;
- rejilla y entrada numérica;
- cotas y unidades;
- restricciones geométricas;
- estados de restricción y resolución de conflictos;
- perfiles abiertos/cerrados y validación.

### 5.5 Operaciones 3D
Investigar cada operación disponible, su acceso contextual, parámetros, previsualización, validación, confirmación, edición posterior, cancelación y efecto en el historial. Incluir extrusión, revolución, barrido, loft, operaciones booleanas, redondeo, chaflán, vaciado, división, simetría, patrones, desplazamientos de cara, proyección y demás herramientas que se verifiquen en la versión estudiada.

### 5.6 Selección, medición y precisión
- Selección de caras, aristas, vértices, cuerpos y perfiles.
- Filtros y selección múltiple.
- Distancias, ángulos, radios, diámetros y medidas.
- Referencias geométricas y precisión/unidades.

### 5.7 Historial y edición paramétrica
- Orden de operaciones.
- Parámetros editables.
- Dependencias entre funciones.
- Regeneración y propagación de cambios.
- Rollback, supresión, reordenamiento y errores.
- Estabilidad de referencias topológicas.

### 5.8 Importación y edición de archivos
Investigar formatos soportados y comportamiento real por tipo de geometría: B-rep, superficies y mallas. Distinguir con claridad qué se puede editar en cada caso. STL no debe tratarse como si contuviera el historial paramétrico original.

### 5.9 Materiales, apariencia y exportación
- Colores, materiales y texturas.
- Apariencia de cuerpos/caras.
- Iluminación y visualización.
- Exportación, resolución/tolerancias y unidades.

### 5.10 Ensamblajes y capacidades avanzadas
Investigar componentes, instancias, relaciones, movimiento, grados de libertad, interferencias y herramientas avanzadas que realmente existan en la versión objetivo.

## 6. Arquitectura técnica: investigación antes de comprometerse

La meta es una aplicación Android. La opción nativa (Kotlin para aplicación/interfaz y C++ mediante JNI para un kernel CAD) es una hipótesis técnica inicial, no una decisión irreversible hasta realizar pruebas de concepto.

Investigar y comparar:
- kernel B-rep y modelado exacto;
- Open CASCADE Technology y compatibilidad/licencia Android;
- alternativas de kernel y condiciones comerciales;
- solver de restricciones 2D y compatibilidad de licencias;
- renderizado 3D Android, OpenGL ES/Vulkan;
- integración JNI, rendimiento, memoria, tamaño del paquete y dispositivos mínimos;
- persistencia de documentos y formato nativo;
- importación/exportación CAD.

Three.js puede servir para prototipos o visualización, pero no debe confundirse con un kernel geométrico CAD. Open CASCADE y SolveSpace son candidatos de investigación, no integraciones aprobadas automáticamente. Revisar licencias y obligaciones antes de adoptar cualquier dependencia.

## 7. Método de ejecución por herramienta

Para cada herramienta:
1. Investigar documentación oficial y comportamiento observable.
2. Recopilar referencias visuales propias y anotar plataforma/versión.
3. Redactar ficha funcional completa.
4. Definir modelo de datos y dependencias.
5. Diseñar interacción táctil Android equivalente.
6. Implementar una sola unidad funcional.
7. Probar casos normales, límites, errores, cancelar y deshacer.
8. Comprobar integración con árbol e historial cuando aplique.
9. Registrar evidencia y limitaciones.
10. Marcar como aprobada solo tras verificarla.

Los cambios de código deben ser pequeños, aislados y con commits descriptivos. Mantener una lista de regresiones y comprobar la versión desplegada antes de comunicar que una corrección está publicada.

## 8. Criterio de finalización de la etapa de referencia

La etapa funcional no se considerará terminada hasta que:
- todas las herramientas y flujos identificados en la versión de referencia estén inventariados;
- cada ficha tenga comportamiento y criterios de aceptación;
- las herramientas implementadas hayan pasado sus pruebas;
- las diferencias inevitables de Android estén documentadas;
- el árbol, el modelo geométrico y el historial mantengan coherencia;
- los archivos se guarden, reabran e intercambien correctamente según los formatos soportados.

Después de esa aprobación se iniciará una fase separada de apariencia personalizada. Esa fase podrá cambiar identidad visual, tema, iconografía y composición estética, pero deberá conservar los comportamientos funcionales aprobados.

## 9. Fuentes de partida ya identificadas

- Manual y ayuda de Shapr3D: https://support.shapr3d.com/hc/en-us/sections/12847448075036-Manual
- Acceso a herramientas: https://support.shapr3d.com/hc/en-us/articles/7378907587484-Accessing-tools
- Tipos de archivo: https://support.shapr3d.com/hc/en-us/articles/7874523890076-Supported-file-types
- Descarga y plataformas: https://support.shapr3d.com/hc/en-us/articles/7859320619292-Download-Shapr3D
- Conceptos de modelado CAD: https://www.shapr3d.com/
- Open CASCADE: https://www.opencascade.com/
- SolveSpace: https://github.com/solvespace/solvespace
- Android stylus: https://developer.android.com/develop/ui/views/touch-and-input/stylus-input

Estas fuentes son un punto de partida, no una investigación exhaustiva. Confirmar versión, fecha y plataforma al estudiar cada comportamiento.

## 10. Estado inicial

- Objetivo: CAD 3D para Android.
- Referencia principal: Shapr3D.
- Meta: máxima paridad funcional y de interacción observable, con implementación independiente.
- Orden: primero reconstrucción funcional; después apariencia personalizada.
- Método: una herramienta a la vez, sin saltar fichas ni pruebas.
- Implementación: todavía no iniciada bajo esta nueva directriz.
- Próximo paso: inventario exhaustivo de Shapr3D por versión/plataforma y matriz de herramientas/gestos/estados.
