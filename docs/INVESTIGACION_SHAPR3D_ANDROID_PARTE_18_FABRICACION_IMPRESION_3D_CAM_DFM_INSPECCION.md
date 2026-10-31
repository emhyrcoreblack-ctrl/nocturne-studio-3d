# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 18
## Fabricación, impresión 3D, mecanizado CNC, CAM e inspección

**Estado:** investigación y especificación funcional. No es implementación ni certificación de paridad.  
**Plataforma objetivo:** Android.  
**Alcance:** flujos de preparación y validación de geometría para fabricación. Separar herramientas CAD observables de Shapr3D de capacidades CAM/inspección que serían extensiones propias de NOCTURNE.

## 1. Objetivo y límites del producto

Un modelo geométrico correcto no garantiza que una pieza pueda fabricarse. La preparación de fabricación debe revisar geometría, material, proceso, tolerancias, orientación, herramientas y restricciones.

Distinguir:
- Modelado CAD: define la geometría y el diseño.
- Preparación de fabricación: adapta/valida la geometría para un proceso.
- Slicing: convierte una malla en trayectorias de impresión por capas.
- CAM: genera trayectorias de herramienta para mecanizado.
- Inspección: compara pieza fabricada con diseño nominal.

No atribuir funciones completas de slicing, CAM o metrología a Shapr3D sin confirmación oficial específica. Estas áreas se documentan como alcance potencial de NOCTURNE o integraciones.

## 2. Impresión 3D: preparación del modelo

Formatos de intercambio frecuentes:
- STL: malla triangular; controlar unidades por convención y verificar escala.
- 3MF: paquete con unidades y metadatos más ricos cuando estén soportados.
- OBJ: malla y referencias de materiales mediante MTL.
- STEP: geometría CAD exacta; normalmente requiere teselación/slicing posterior.

La exportación debe permitir seleccionar cuerpos, componentes o conjunto, unidades, tolerancia de teselación y orientación. Mostrar una previsualización y advertir si hay objetos fuera del volumen de construcción solo si se conoce el tamaño de la máquina objetivo.

### 2.1 Calidad de teselación

Parámetros:
- Desviación lineal máxima entre superficie y malla.
- Desviación angular.
- Longitud máxima de arista, si aplica.
- Resolución adaptativa según curvatura.
- Preservación de bordes agudos.
- Control de tamaño de archivo.

Una teselación demasiado gruesa altera dimensiones y superficies curvas; una demasiado fina aumenta memoria y tamaño sin beneficio práctico. Ofrecer presets (borrador, estándar, alta precisión) y modo avanzado con valores numéricos. Registrar la tolerancia usada en exportación.

### 2.2 Validación de malla

Comprobar:
- Malla cerrada/manifold cuando el proceso lo requiera.
- Normales coherentes.
- Triángulos degenerados.
- Aristas no-manifold.
- Autointersecciones.
- Componentes desconectados.
- Huecos y límites abiertos.
- Caras duplicadas o invertidas.
- Escala y unidades plausibles.

No reparar automáticamente cambios que alteren el diseño sin vista previa y confirmación. Diferenciar error crítico, advertencia y recomendación.

### 2.3 Orientación y volumen de fabricación

Herramientas de preparación posibles:
- Orientar manualmente.
- Alinear una cara con la base.
- Rotar por ángulos exactos.
- Centrar y distribuir piezas.
- Comprobar dimensiones del volumen de impresión.
- Estimar altura y área de contacto.
- Mostrar orientación recomendada con explicación.

La orientación óptima depende de tecnología, material, anisotropía, acabado, soportes y resistencia. Una recomendación automática debe exponer criterios y permitir control manual.

### 2.4 Soportes y slicing

La generación de soportes y trayectorias por capas suele pertenecer a un slicer especializado. NOCTURNE puede:
- Preparar y validar el modelo.
- Exportar 3MF/STL con unidades y orientación.
- Transferir a un slicer externo mediante compartir/abrir con.
- En una fase futura, integrar un motor de slicing compatible.

Si se incorpora slicing, evaluar perímetros, relleno, altura de capa, soportes, brim/raft, retracción, temperaturas y perfiles de máquina/material. No inventar parámetros seguros: dependen de impresora y filamento.

## 3. Mecanizado CNC y CAM

El CAD define la pieza; CAM calcula trayectorias y condiciones de corte. Un flujo CAM requiere datos que no existen en la geometría sola.

Entradas necesarias:
- Stock/material bruto y dimensiones.
- Sistema de coordenadas de trabajo (WCS).
- Cero de pieza y orientación.
- Máquina y ejes disponibles.
- Herramientas, portaherramientas y geometría.
- Operaciones: planeado, desbaste, acabado, taladrado, roscado, ranurado, contorneado.
- Parámetros de corte y límites del material.
- Sujeciones, mordazas y zonas prohibidas.
- Tolerancias y sobrematerial.
- Estrategia de entrada/salida y evacuación.

### 3.1 Estrategias de mecanizado

Evaluar para una futura capa CAM:
- 2D: perfiles, bolsillos, taladros y ranuras.
- 2.5D: niveles y alturas múltiples.
- 3 ejes: superficies y cavidades.
- 4/5 ejes: orientación continua o indexada, según cinemática y postprocesador.

No presentar una trayectoria como segura solo porque se generó. Se necesita simulación, detección de colisiones y postprocesador validado para máquina/controlador.

### 3.2 Simulación y postprocesado

Requisitos:
- Simular retirada de material.
- Mostrar stock restante.
- Detectar colisiones de herramienta, holder, pieza y fijaciones.
- Detectar gouges, movimientos rápidos peligrosos y límites de máquina.
- Estimar tiempo como aproximación, no garantía.
- Generar código NC mediante postprocesador específico.
- Mostrar unidades, plano de trabajo, offsets y herramienta.
- Permitir revisión antes de exportar.

La salida NC debe identificar postprocesador y versión. No ejecutar código máquina directamente desde una aplicación móvil sin un proceso de validación industrial independiente.

## 4. Tolerancias y manufacturabilidad (DFM)

La validación debe depender del proceso y material. No existe un umbral universal.

Comprobaciones:
- Espesor mínimo de pared.
- Agujeros y diámetros mínimos.
- Radios internos compatibles con herramienta.
- Profundidad de cavidad y relación profundidad/ancho.
- Accesibilidad de herramienta.
- Socavados.
- Ángulos de desmoldeo para moldeo.
- Distancias a bordes y separación entre elementos.
- Interferencias y holguras.
- Tolerancias alcanzables por proceso.
- Acabado superficial requerido.
- Distorsión térmica o anisotropía cuando aplique.

Cada regla debe incluir proceso, material, rango y fuente. Si no se conoce el proceso/material, mostrar solo análisis geométrico genérico y no declarar pieza fabricable.

### 4.1 Análisis de espesor

Métodos potenciales:
- Muestreo de rayos/pares de superficies.
- Análisis de espesor local sobre malla.
- Espesor mínimo global y mapa visual.
- Umbral definido por el usuario o perfil de proceso.

Indicar aproximación, resolución y posibles falsos positivos en zonas complejas. Diferenciar espesor de pared de distancia mínima entre dos superficies cualesquiera.

### 4.2 Accesibilidad y orientación de herramienta

Para CNC, evaluar:
- Acceso de herramienta desde direcciones disponibles.
- Alcance y longitud de herramienta.
- Colisiones con stock y fijaciones.
- Radios internos menores que radio de herramienta.
- Zonas que requieren otra orientación o setup.

Un análisis 3 ejes no debe afirmar manufacturabilidad en 5 ejes, y viceversa.

## 5. Materiales y procesos

La biblioteca de materiales debe distinguir propiedades físicas, visuales y de fabricación:
- Densidad.
- Resistencia y módulo elástico, si existen datos fiables.
- Conductividad/propiedades térmicas cuando sean relevantes.
- Contracción y anisotropía por proceso.
- Dureza y maquinabilidad.
- Límites de temperatura.
- Acabado superficial y tratamientos.

Toda propiedad debe indicar fuente, condición y si es valor típico o certificado. No convertir una apariencia visual PBR en dato físico de material.

## 6. Inspección y comparación con pieza fabricada

Posible módulo de metrología:
- Importar malla o nube de puntos medida.
- Alinear con CAD nominal mediante datum/registro.
- Comparar desviación punto-superficie.
- Mapa de colores con escala explícita.
- Secciones de inspección.
- Dimensiones críticas y GD&T, si se soportan.
- Informe con unidades, método, resolución y versión del nominal.

El alineamiento best-fit no sustituye necesariamente un alineamiento basado en datums. Mostrar el método utilizado y no ocultar desviaciones mediante una alineación inadecuada.

## 7. Flujo de fabricación propuesto

1. Seleccionar cuerpo/componente.
2. Confirmar unidades y orientación.
3. Elegir proceso y material, si se conoce.
4. Ejecutar análisis de geometría y manufacturabilidad.
5. Revisar advertencias y corregir diseño si procede.
6. Elegir formato y tolerancia de exportación.
7. Previsualizar y exportar.
8. Abrir en slicer/CAM externo o módulo integrado.
9. Simular proceso en herramienta especializada.
10. Fabricar y medir.
11. Importar resultados de inspección y comparar.

Cada etapa debe dejar claro qué herramienta realiza el cálculo y qué validación sigue pendiente.

## 8. Android: interacción y rendimiento

- Análisis geométrico pesado fuera del hilo UI.
- Procesamiento por lotes y progreso cancelable.
- LOD para visualizar mallas densas.
- No duplicar innecesariamente buffers de vértices.
- Permitir exportar en segundo plano con estado.
- Recuperar tareas interrumpidas cuando sea seguro.
- Mostrar advertencias legibles en pantalla pequeña.
- Ofrecer inspección detallada con leyenda y unidades.
- No bloquear edición CAD mientras se prepara una exportación independiente, si la arquitectura lo permite.

## 9. Matriz de pruebas de aceptación

### Exportación e impresión 3D
1. Exportar STL en milímetros.
2. Exportar STL en pulgadas y verificar escala.
3. Exportar 3MF con unidades.
4. Comparar teselación gruesa y fina.
5. Preservar bordes agudos según tolerancia.
6. Detectar malla abierta.
7. Detectar arista no-manifold.
8. Detectar normales invertidas.
9. Detectar triángulo degenerado.
10. Detectar componentes desconectados.
11. Mostrar dimensiones y orientación.
12. Cancelar exportación sin archivo parcial.

### DFM
13. Detectar pared por debajo del umbral configurado.
14. Mostrar mapa de espesor y resolución.
15. Detectar agujero menor que límite de proceso.
16. Detectar radio interior incompatible con herramienta.
17. Detectar cavidad inaccesible desde dirección seleccionada.
18. Verificar tolerancia frente a rango de proceso.
19. No emitir diagnóstico específico sin material/proceso.
20. Distinguir advertencia de fallo crítico.

### CAM
21. Definir stock y WCS.
22. Definir herramienta y holder.
23. Generar trayectoria de contorno.
24. Generar bolsillo.
25. Simular retirada de material.
26. Detectar colisión con fijación.
27. Detectar gouge.
28. Verificar límites de máquina.
29. Asociar postprocesador y versión.
30. Rechazar salida NC si faltan datos obligatorios.

### Inspección
31. Importar malla medida.
32. Alinear por datums.
33. Ejecutar best-fit y etiquetar método.
34. Generar mapa de desviación con unidades.
35. Detectar puntos fuera de tolerancia.
36. Crear sección de inspección.
37. Exportar informe con nominal y revisión.

### Android
38. Ejecutar análisis sin bloquear UI.
39. Cancelar análisis.
40. Procesar malla grande con memoria limitada.
41. Mostrar progreso.
42. Recuperar exportación interrumpida.
43. Mantener precisión de unidades al compartir archivo.

## 10. Criterios de aceptación

- Exportaciones preservan unidades y declaran tolerancia de teselación.
- Las mallas se validan antes de fabricación cuando sea pertinente.
- No se confunde CAD con slicing o CAM.
- Las recomendaciones DFM declaran proceso/material y límites.
- CAM requiere máquina, herramienta, stock, fijaciones y postprocesador definidos.
- Trayectorias se simulan y revisan antes de uso.
- Inspección declara método de alineamiento y resolución.
- El análisis no bloquea la interfaz Android.
- Los informes conservan unidades, revisión y procedencia.

## 11. Separación de certeza

**A verificar directamente en Shapr3D:** opciones actuales de exportación de sólidos/mallas, formatos, control de calidad de teselación, herramientas de análisis y cualquier integración o flujo de fabricación anunciado oficialmente.

**Capacidades CAD/CAM generales propuestas para NOCTURNE, no atribuidas a Shapr3D:** slicing, soportes, generación de trayectorias CNC, postprocesadores, simulación de mecanizado, DFM por proceso y metrología dimensional.

**Pendiente de verificación:** formatos y parámetros de exportación disponibles en cada plataforma/plan; capacidades reales de análisis; integraciones vigentes. No afirmar CAM o slicing nativo sin evidencia oficial.

## 12. Próximo bloque

Parte 19: experiencia de usuario táctil Android y productividad; gestos, selección, precisión, teclado numérico, menús contextuales, accesibilidad, estados de herramienta, paneles adaptativos, rendimiento de viewport y prevención de conflictos entre navegación y modelado.
