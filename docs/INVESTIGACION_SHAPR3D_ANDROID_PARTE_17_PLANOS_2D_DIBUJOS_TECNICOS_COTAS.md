# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 17
## Planos 2D, dibujos técnicos, vistas, secciones, cotas y documentación de fabricación

**Estado:** especificación e investigación funcional. No es implementación ni certificación de paridad.  
**Plataforma objetivo:** Android.  
**Alcance:** documentar la transición del modelo 3D a documentación 2D y entregables técnicos. Separar capacidades verificadas de Shapr3D de requisitos CAD generales propuestos para NOCTURNE.

## 1. Objetivo y distinción fundamental

Un dibujo técnico 2D es una representación derivada del modelo 3D, acompañada de anotaciones y reglas de documentación. No debe confundirse con un sketch 2D que participa en la construcción paramétrica del sólido.

NOCTURNE debe tratar por separado:
- **Sketch de modelado:** geometría de entrada para features 3D.
- **Drawing/Sheet:** lámina técnica con vistas proyectadas y anotaciones.
- **Exportación 2D:** PDF, DXF u otro formato de intercambio, según soporte.
- **Plano de fabricación:** documento controlado con unidades, escala, tolerancias, revisión y notas.

Una modificación del modelo puede invalidar vistas derivadas. El sistema debe marcar dibujos afectados como desactualizados y permitir actualizarlos de forma controlada.

## 2. Documento de dibujo y láminas

Arquitectura funcional propuesta:
- Documento de dibujo vinculado al modelo fuente.
- Una o varias láminas.
- Formato de papel y orientación.
- Unidades, escala y sistema de proyección.
- Marco, cajetín, campos de revisión y notas.
- Vistas del modelo y vistas auxiliares.
- Cotas, símbolos, tolerancias y anotaciones.
- Capas/estilos y configuración de impresión.

Cada lámina debe tener tamaño físico explícito y una escala conocida. La geometría de la vista debe poder regenerarse desde el modelo, mientras que las anotaciones manuales deben conservar su intención y referencias.

Formatos de papel iniciales a considerar: ISO A0–A4 y formatos ANSI comunes. No asumir que toda plantilla está disponible en Shapr3D; es un alcance general de NOCTURNE.

## 3. Vistas proyectadas

Vistas principales:
- Frontal.
- Superior.
- Lateral izquierda/derecha.
- Posterior.
- Inferior.
- Isométrica.

Vistas derivadas:
- Proyectada desde otra vista.
- Auxiliar para mostrar una cara inclinada en verdadera magnitud.
- Detalle con escala ampliada.
- Sección completa, media, desplazada o alineada.
- Corte local/roto, si se soporta.
- Vista de geometría oculta.
- Vista sombreada o sombreada con aristas.

Cada vista debe almacenar:
- Referencia al cuerpo/componente y revisión del modelo.
- Dirección y orientación de cámara.
- Escala, posición en lámina y estilo visual.
- Política de líneas ocultas/tangentes.
- Profundidad de sección y referencias de corte.
- Estado de actualización y diagnóstico.

## 4. Proyección y normas

NOCTURNE debe soportar, como mínimo, los sistemas de proyección de primer diedro y tercer diedro, indicando claramente cuál se utiliza. La elección afecta la disposición de vistas; no debe inferirse de forma ambigua.

La geometría proyectada debe respetar escala y orientación. Las líneas visibles, ocultas, de centro, corte y referencia deben tener estilos distinguibles. Los estándares exactos (ISO, ASME u otros) deben ser configurables, porque sus convenciones no son intercambiables.

## 5. Secciones y cortes

Funciones de documentación propuestas:
- Sección completa por plano.
- Media sección para piezas simétricas.
- Sección desplazada por trayectoria.
- Sección alineada.
- Sección local o parcial.
- Control de profundidad y dirección.
- Rayado de materiales/cuerpos cortados.
- Exclusión de elementos normalizados cuando corresponda.
- Identificación de plano de corte y flechas de observación.

Las secciones de dibujo 2D deben distinguirse de Section View del viewport 3D. Una vista de sección en pantalla puede ser temporal; una sección de plano es un objeto documentado, con línea de corte y anotaciones.

## 6. Cotas

Tipos a evaluar:
- Lineal horizontal, vertical y alineada.
- Angular.
- Diámetro y radio.
- Coordenadas/baseline y cadena.
- Ordenada (ordinate).
- Longitud de arco.
- Entre centros y entre elementos.
- Cota de referencia (driven/reference) y cota controladora cuando aplique.

Cada cota debe tener:
- Referencias geométricas asociativas.
- Valor calculado y unidad.
- Precisión decimal y formato.
- Flechas, líneas auxiliares y posición de texto.
- Tolerancia o ajuste.
- Estado de asociación y diagnóstico.

Una cota de dibujo no debe cambiar el modelo salvo que explícitamente se diseñe como dimensión conductora; por defecto, las cotas del plano documentan el modelo. No confundirlas con cotas paramétricas del sketch.

## 7. Anotaciones y símbolos

Elementos:
- Texto y notas.
- Líderes y multileaders.
- Notas de fabricación y acabado.
- Marcas de centro.
- Líneas de centro.
- Símbolos de diámetro, radio, profundidad y cuadrado.
- Símbolos de soldadura, si se incluye el ámbito.
- Símbolos de textura/acabado superficial.
- Referencias de datum.
- Marcos de control geométrico.
- Burbujas de detalle y etiquetas de sección.
- Globos de componentes y lista de materiales para ensamblajes.

Debe existir control tipográfico, altura de texto en papel, alineación, estilos, capas y legibilidad a escala impresa.

## 8. Tolerancias y GD&T

Separar tolerancia dimensional de tolerancia geométrica.

### Tolerancia dimensional
- Bilateral: ±.
- Unilateral.
- Límites superior/inferior.
- Ajustes y clases cuando se soporten.
- Precisión y redondeo.

### GD&T
Evaluar soporte para:
- Datums y referencias.
- Forma: rectitud, planitud, circularidad, cilindricidad.
- Orientación: paralelismo, perpendicularidad, angularidad.
- Localización: posición, concentricidad/coaxialidad según norma, simetría.
- Perfil de línea y superficie.
- Runout circular y total.
- Marcos de control geométrico, modificadores y zonas de tolerancia.

La representación de símbolos debe seguir una norma elegida y versionada. No presentar un dibujo como conforme a ISO GPS o ASME Y14.5 sin implementar y validar las reglas pertinentes.

## 9. Listas de materiales y globos

Para dibujos de ensamblaje:
- BOM estructurada por componente.
- Cantidad, número de pieza, descripción, material y revisión.
- Globos vinculados a instancias.
- Agrupación de piezas idénticas según definición y configuración.
- Orden y formato de columnas.
- Actualización al cambiar el ensamblaje.
- Control de elementos excluidos y cantidades.

La BOM del dibujo debe ser derivada de la estructura de ensamblaje, no texto manual desconectado, salvo que el usuario elija una tabla manual.

## 10. Cajetín, revisiones y control documental

Campos configurables:
- Nombre de pieza/proyecto.
- Número de plano.
- Autor/dibujante y verificador.
- Fecha.
- Material.
- Escala.
- Unidades.
- Norma de dibujo.
- Revisión.
- Estado (borrador, revisión, liberado).
- Hoja actual y total.
- Notas generales.

Cambios de modelo deben permitir actualizar revisión y registrar qué vistas o cotas necesitan inspección. No incrementar automáticamente una revisión liberada sin política explícita del usuario.

## 11. Actualización asociativa y gestión de cambios

Cada vista mantiene referencia a una revisión del modelo fuente. Si el modelo cambia:
1. Marcar las vistas dependientes como Outdated.
2. Comparar geometría nueva con anterior.
3. Regenerar líneas visibles/ocultas y secciones.
4. Intentar conservar posición de cotas y anotaciones.
5. Detectar cotas colgantes o referencias perdidas.
6. Mostrar diferencias relevantes.
7. Permitir actualizar todo o revisar vista por vista.
8. Registrar el resultado como nueva revisión del dibujo.

No mover anotaciones silenciosamente si la geometría cambió; preservar intención y advertir sobre asociaciones ambiguas.

## 12. Exportación y publicación

Formatos a evaluar:
- PDF vectorial para distribución e impresión.
- DXF para intercambio 2D.
- DWG solo si existe soporte fiable/licencia y compatibilidad comprobada.
- SVG o imagen para previsualización, no sustituto de un plano técnico vectorial cuando se requiera precisión.

Opciones:
- Láminas seleccionadas o conjunto completo.
- Escala 1:1 u otra escala declarada.
- Tamaño de papel.
- Color/monocromo.
- Grosores de línea.
- Fuentes incrustadas o sustitución controlada.
- Capas y entidades en DXF.
- Calidad vectorial/raster para vistas sombreadas.
- Exportar cotas como entidades editables cuando el formato lo permita.

Antes de publicar, validar vistas desactualizadas, cotas colgantes, campos vacíos, escala, unidades y normas. Mostrar advertencias y permitir corregirlas.

## 13. Impresión y previsualización

- Vista previa de página con márgenes.
- Ajustar a página solo cuando el usuario lo solicite.
- Escala real y escala de impresión claramente indicadas.
- Control de orientación, papel y márgenes.
- Evitar recortar vistas o cajetín.
- Mostrar grosor y legibilidad de texto.
- Impresión por hoja o conjunto.
- Comprobar que fuentes y símbolos sobreviven al PDF.

## 14. Flujo Android

La creación/edición de dibujos en pantalla táctil requiere:
- Selección precisa de vistas y anotaciones.
- Gestos de zoom/pan en la lámina sin alterar la cámara 3D.
- Panel contextual para propiedades de vista/cota.
- Herramientas de alineación y distribución.
- Snap a geometría proyectada.
- Entrada numérica y teclado apropiado.
- Confirmación de cambios y undo/redo.
- Modo de previsualización de impresión.

Separar claramente navegación del viewport 3D y navegación de la hoja 2D. Evitar que un gesto de zoom sobre el plano modifique la cámara del modelo.

## 15. Matriz de pruebas de aceptación

### Vistas
1. Crear vista frontal desde modelo.
2. Crear superior y lateral proyectadas.
3. Verificar primer diedro.
4. Verificar tercer diedro.
5. Crear isométrica.
6. Crear vista auxiliar de cara inclinada.
7. Crear detalle con escala distinta.
8. Mostrar/ocultar líneas ocultas.
9. Mostrar líneas de centro.
10. Cambiar estilo visible/sombreado.

### Secciones
11. Crear sección completa.
12. Crear media sección.
13. Crear sección desplazada.
14. Crear sección alineada.
15. Crear sección local si está soportada.
16. Cambiar dirección/profundidad.
17. Verificar rayado.
18. Actualizar sección tras modificar modelo.

### Cotas y anotaciones
19. Cota horizontal/vertical.
20. Cota alineada.
21. Cota angular.
22. Diámetro y radio.
23. Cota de cadena/baseline.
24. Cota de referencia.
25. Modificar precisión y unidad.
26. Crear nota con líder.
27. Crear marcas de centro.
28. Crear datum y marco GD&T.
29. Aplicar tolerancia bilateral y unilateral.
30. Detectar cota colgante al cambiar geometría.

### Ensamblajes y control
31. Generar BOM desde ensamblaje.
32. Insertar globos asociados.
33. Actualizar cantidades al cambiar instancias.
34. Editar cajetín y revisión.
35. Gestionar varias láminas.
36. Marcar dibujo desactualizado al cambiar modelo.

### Exportación e impresión
37. Exportar PDF vectorial.
38. Exportar DXF y reabrirlo en otra aplicación.
39. Verificar escala y unidades.
40. Imprimir en tamaño de papel definido.
41. Detectar vistas/cotas pendientes antes de publicar.
42. Cancelar exportación sin archivo parcial.

### Android
43. Zoom/pan de lámina independiente del viewport.
44. Seleccionar anotación con precisión táctil.
45. Editar valor con teclado numérico.
46. Deshacer y rehacer cambios de dibujo.
47. Mantener fluidez con láminas complejas.
48. Reabrir documento conservando asociaciones.

## 16. Criterios de aceptación

- Drawing y sketch de modelado son entornos distintos.
- Las vistas se derivan del modelo y conservan asociaciones.
- Las modificaciones del modelo marcan dibujos desactualizados.
- Cotas y anotaciones mantienen referencias o notifican pérdida.
- Proyección y norma están explícitas.
- Secciones, BOM y tolerancias se representan con semántica correcta.
- PDF/DXF preservan escala, unidades y entidades según sus capacidades.
- La impresión coincide con la previsualización.
- La navegación 2D no altera cámara 3D.
- La conformidad normativa solo se declara tras pruebas específicas.

## 17. Separación de certeza

**A verificar en Shapr3D según versión, plataforma y plan:** creación de dibujos técnicos, vistas proyectadas, secciones, cotas, anotaciones, plantillas, exportación 2D y restricciones de edición. No asumir que todas las capacidades tradicionales de un sistema de drafting completo están presentes.

**Requisitos CAD generales propuestos para NOCTURNE, no atribuidos a Shapr3D:** múltiples láminas, cajetines configurables, primer/tercer diedro, GD&T completo, BOM asociativa, revisiones, DXF/DWG y validación de liberación.

**Pendiente de verificación:** lista exacta de herramientas de dibujo de Shapr3D, disponibilidad por plataforma/plan, normas admitidas, formatos de salida y comportamiento asociativo después de cambios de modelo.

## 18. Próximo bloque

Parte 18: fabricación y preparación de geometría; impresión 3D, orientación, soportes (solo análisis de flujo), teselación, tolerancias, mecanizado CNC, exportación CAM, inspección y validación de manufacturabilidad. Separar funciones reales de Shapr3D de capacidades adicionales que NOCTURNE podría requerir como producto CAD/CAM.
