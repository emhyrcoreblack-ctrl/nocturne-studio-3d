# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 20
## Arquitectura técnica CAD: kernel geométrico, modelo paramétrico, mallas y renderizado

**Estado:** investigación y especificación arquitectónica; no es implementación.  
**Plataforma objetivo:** Android.  
**Objetivo:** definir una arquitectura propia capaz de sostener las herramientas investigadas, con geometría precisa, historial editable, intercambio fiable y viewport fluido.

Esta especificación no afirma conocer la arquitectura interna privada de Shapr3D. Distingue principios generales de ingeniería CAD, decisiones propuestas para NOCTURNE y aspectos que requieren validación mediante prototipos.

## 1. Decisión arquitectónica principal

NOCTURNE no debe ser una aplicación de dibujo 3D que almacena únicamente triángulos. Debe separar cinco dominios:

1. **Modelo de diseño:** intención del usuario, documentos, componentes, operaciones y dependencias.
2. **Geometría exacta:** curvas, superficies, topología y sólidos B-rep cuando el kernel lo permita.
3. **Geometría aproximada:** mallas para visualización, selección auxiliar, fabricación y formatos poligonales.
4. **Presentación:** cámara, materiales, iluminación, overlays, selección y UI.
5. **Persistencia e intercambio:** serialización del proyecto, autosave, importación/exportación y recuperación.

La malla mostrada en pantalla no debe convertirse accidentalmente en la única fuente de verdad de un sólido paramétrico.

## 2. Capas y responsabilidades

| Capa | Responsabilidad | No debe hacer |
|---|---|---|
| UI Android | Gestos, paneles, comandos, accesibilidad | Ejecutar kernel pesado en hilo UI |
| Interaction Controller | Estados de herramienta, selección, entrada y transacciones | Mutar geometría directamente desde eventos táctiles |
| Application/Command Layer | Casos de uso, undo/redo, validación y coordinación | Contener algoritmos geométricos |
| Parametric Model | Árbol de operaciones, parámetros, dependencias y componentes | Depender de widgets o cámara |
| Geometry Kernel Adapter | API interna estable para operaciones geométricas | Exponer detalles del proveedor a toda la app |
| Geometry Kernel | B-rep, curvas, superficies, booleanos y topología | Administrar interfaz o documentos |
| Tessellation Service | Derivar mallas desde geometría exacta | Sobrescribir geometría exacta |
| Rendering Engine | Escena, materiales, luces y overlays | Ser autoridad del historial |
| Persistence Layer | Guardar, versionar, recuperar y migrar | Serializar referencias temporales de GPU |
| Exchange Layer | STEP/IGES/STL/OBJ/3MF y otros formatos | Cambiar cámara o estructura sin consentimiento |

Las dependencias deben apuntar hacia el dominio. UI y renderizado consumen resultados del modelo; el modelo no conoce Android Views, widgets ni APIs gráficas concretas.

## 3. Modelo de datos canónico

### 3.1 Documento
El documento contiene identificador estable y versión de esquema, unidades y tolerancias, parámetros globales, cuerpos, superficies, sketches y componentes, árbol de operaciones y dependencias, materiales/apariencias y recursos, vistas guardadas opcionales, metadatos de importación y estado de guardado/recuperación.

### 3.2 Identidades
No usar índices de array, punteros de memoria ni identificadores GPU como identidad persistente.

Cada entidad persistente necesita ID estable: documento, feature/operación, cuerpo, definición e instancia de componente, entidad de sketch, parámetro y referencia topológica lógica.

Las referencias topológicas a caras/aristas/vértices son difíciles porque las operaciones pueden dividir, fusionar o reemplazar topología. El sistema debe mantener referencias semánticas y mecanismos de resolución, no confiar ciegamente en el índice de una cara.

### 3.3 Definición y resultado
Cada operación guarda tipo, parámetros editables, referencias de entrada, configuración y versión del algoritmo, estado de supresión/visibilidad, resultado derivado o caché regenerable, mensajes de validación y estado de recomputación.

El resultado derivado no sustituye la intención paramétrica. Debe poder reconstruirse o invalidarse cuando cambian las entradas.

## 4. Kernel geométrico

### 4.1 Capacidades mínimas
Evaluar un kernel con:
- Curvas 2D/3D y superficies paramétricas.
- Sólidos B-rep con topología manifold y validación.
- Extrusión, revolución, barrido y loft.
- Booleanos robustos.
- Fillet, chamfer, shell y offset.
- Split, trim, extend y operaciones de caras.
- Intersecciones y proyecciones.
- Transformaciones rígidas y afines.
- Consultas de distancia, área, volumen, curvatura y continuidad.
- Healing y diagnóstico de geometría importada.
- Teselación configurable.
- Importación/exportación neutral cuando sea posible.

Una librería de mallas por sí sola no proporciona necesariamente estas capacidades exactas.

### 4.2 B-rep: topología y geometría
Un sólido B-rep combina vértices topológicos asociados a puntos geométricos; aristas asociadas a curvas; bucles y coedges que ordenan aristas en límites; caras asociadas a superficies y regiones paramétricas; shells que agrupan caras; y sólidos que agrupan shells bajo reglas de orientación y cierre.

La topología describe conectividad; la geometría describe forma y posición. No confundir ambas capas. Una misma curva geométrica puede participar en distintas aristas topológicas, y una arista puede tener orientación contextual según la cara.

### 4.3 Tolerancias
Definir políticas explícitas para tolerancia lineal, angular, coincidencia, intersección, teselación, importación y healing.

No usar un epsilon universal para todas las escalas. La estrategia debe considerar unidades y tamaño del modelo. No cambiar tolerancias de un documento silenciosamente al abrirlo en otro dispositivo.

### 4.4 Validación de sólidos
Antes de aceptar una operación:
- Comprobar validez topológica.
- Comprobar orientación y cierre de shells cuando corresponda.
- Detectar aristas libres o no-manifold.
- Comprobar autointersecciones según capacidad.
- Detectar caras degeneradas y tolerancias incoherentes.
- Verificar resultados de booleanos.
- Comparar invariantes básicos cuando proceda (volumen, cuerpos, conectividad).
- Rechazar o marcar resultados dudosos sin corromper el estado anterior.

## 5. Kernel propio frente a kernel integrado

No construir un kernel B-rep desde cero como primera etapa salvo que exista equipo especializado, presupuesto y calendario que lo justifiquen. Es un área de alta complejidad matemática y robustez.

Evaluar alternativas mediante prueba técnica:
- Kernel comercial con licencia compatible y soporte de plataforma.
- Kernel open source con capacidades B-rep suficientes y licencia revisada.
- Arquitectura híbrida: kernel B-rep para sólidos y librerías especializadas para mallas/render.
- Proveedor externo encapsulado detrás de Geometry Kernel Adapter.

### Criterios de selección
1. Robustez de booleanos.
2. Fillet/chamfer/shell en geometría real.
3. Curvas y superficies NURBS.
4. STEP/IGES y healing.
5. Compatibilidad Android/NDK/ABI y toolchain.
6. Rendimiento en ARM64 y memoria.
7. Licencia, atribuciones y obligaciones de distribución.
8. Persistencia y estabilidad entre versiones.
9. Documentación, comunidad, soporte y pruebas.
10. Tamaño del binario y coste de integración.
11. Ejecución de operaciones fuera del hilo UI.
12. Compatibilidad con modelo paramétrico e historial propios.

La decisión final requiere prototipo de operaciones críticas y revisión legal de licencias. No incorporar una dependencia solo porque compile en escritorio.

## 6. Arquitectura paramétrica y grafo de dependencias

El historial debe modelarse como un grafo dirigido acíclico cuando las dependencias de diseño así lo permitan.

Cada feature declara entradas geométricas y referencias, parámetros, dependencias de variables, salidas, precondiciones, función de evaluación, estado/errores y estrategia de invalidación.

### Recomputation
Cuando cambia un parámetro:
1. Identificar nodos afectados.
2. Invalidar resultados derivados aguas abajo.
3. Ordenar evaluación topológicamente.
4. Recalcular solo el subgrafo necesario cuando sea seguro.
5. Resolver referencias topológicas.
6. Validar resultados.
7. Publicar nuevo estado atómico si el commit es válido.
8. Mantener resultados anteriores hasta completar o declarar fallo.

Detectar dependencias circulares antes de evaluar. Resolver variables con sistema explícito de unidades. Registrar errores por parámetro y feature. Separar ecuaciones de sketch, expresiones escalares y restricciones de ensamblaje.

### Topological naming
No existe una solución universal simple para la identidad persistente de caras/aristas tras cambios topológicos. Propuesta:
- Guardar referencia lógica, contexto de feature y criterios geométricos.
- Mantener historial de correspondencias cuando el kernel lo proporcione.
- Resolver por contexto, orientación, superficie, vecindad y medidas con puntuación.
- Detectar ambigüedad y pedir re-selección.
- No reasignar silenciosamente una referencia a otra cara parecida.

## 7. Sketch solver

Separar el solver 2D del kernel B-rep, aunque compartan tipos geométricos básicos.

Capacidades: punto, línea, arco, círculo, elipse, spline y geometría de construcción; restricciones coincidente, horizontal, vertical, paralela, perpendicular, tangente, concéntrica, igual, simetría; cotas de longitud, radio, diámetro, ángulo, distancia y coordenadas; grados de libertad; detección de restricciones redundantes/contradictorias; solución incremental; unidades y expresiones.

El solver distingue subrestringido, totalmente restringido, sobrerrestringido e inconsistente. La interfaz no comunica “completamente restringido” solo por color si el solver no lo confirma.

## 8. Mallas y teselación

### 8.1 Fuente de verdad
Cuando existe B-rep, la malla de render es derivada. Si el archivo es STL/OBJ/PLY u otro formato poligonal, la malla importada puede ser la geometría de origen, pero no debe fingirse que posee historial CAD o superficies exactas.

### 8.2 Datos de malla
Separar posiciones, índices de triángulos, normales, UV, atributos por vértice/cara, materiales/grupos, transformación de instancia y datos de picking/aceleración.

### 8.3 Teselación adaptativa
La teselación depende de tolerancia de cuerda, desviación angular y tamaño en pantalla. Permitir calidad distinta para preview interactiva, vista final, exportación de fabricación y medición/inspección.

La teselación visual no altera cotas ni volumen exacto. Al cambiar cámara se puede ajustar nivel de detalle sin cambiar definición del sólido.

### 8.4 Mallas importadas
Conservar fuente y metadatos; detectar unidades; detectar normales invertidas, agujeros, componentes desconectados y degenerados; ofrecer reparación explícita y reversible; no prometer edición paramétrica de triángulos como si fuera B-rep. Ofrecer herramientas de malla solo donde exista soporte real.

## 9. Renderizado y escena

El renderer es una vista del modelo, no el propietario del documento.

Responsabilidades: renderizar geometría teselada, materiales PBR, texturas, luces y entorno; mostrar selección, preselección, cotas, restricciones, ejes, rejilla y manipuladores; mantener cámara independiente del historial; gestionar visibilidad, clipping y modos de visualización; sincronizar escena con cambios del documento.

Arquitectura recomendada:
- Scene Graph para transformaciones, visibilidad e instancias.
- Render Graph para pases, sombras, transparencias y postprocesado.
- Recursos GPU como cachés regenerables.
- Picking independiente del color/render final.
- Overlays separados de la geometría.
- Ciclo de vida explícito ante pérdida/recreación del contexto gráfico.

En Android, evaluar backend gráfico según dispositivos, controladores y capacidades. Encapsular la API para no acoplar el modelo CAD a un backend único. Medir compatibilidad, precisión de picking, memoria de texturas y estabilidad tras suspensión/reanudación.

## 10. Transformaciones y sistemas de coordenadas

Definir y documentar sistemas de coordenadas del documento, cuerpos/componentes, sketches/planos, cámara y pantalla; unidades internas y conversión de presentación.

Requisitos: transformaciones explícitas entre espacios; matrices y cuaterniones con convenciones fijas; no mezclar grados/radianes ni coordenadas diestras/zurdas sin conversión; evitar error por aplicar transformaciones repetidas sobre vértices; conservar transformaciones de instancia cuando proceda; documentar orden de multiplicación y pivotes.

## 11. Concurrencia y transacciones

- UI nunca espera sincrónicamente a operaciones largas de kernel.
- Cálculos reciben snapshot inmutable o contexto transaccional controlado.
- Cancelación cooperativa para tareas largas.
- Resultados obsoletos se descartan si cambió la revisión del documento.
- Commit valida que la revisión de origen siga vigente.
- Undo/redo registra cambios del modelo, no comandos visuales de cámara.
- Guardado toma snapshot consistente.
- No compartir objetos mutables del kernel entre hilos sin garantías documentadas.

## 12. Persistencia, recuperación y compatibilidad

El formato nativo almacena intención paramétrica, geometría importada, resultados, recursos y metadatos para reconstruir el proyecto.

Requisitos: esquema versionado, migraciones explícitas, escritura atómica o journal, autosave, recuperación tras cierre inesperado, checksums, gestión de archivos externos/texturas, no guardar handles GPU ni punteros del kernel, guardar versión del kernel y serialización, política de cachés incompatibles y pruebas de abrir/guardar entre versiones.

## 13. Importación y exportación

Separar adaptadores por formato. Cada importador reporta unidades, entidades importadas/omitidas, validez geométrica, materiales/texturas conservados o perdidos, conversión B-rep/malla, errores y advertencias.

Exportación permite elegir alcance, unidades, precisión de teselación y opciones del formato. No altera documento, cámara ni selección. STEP/IGES requieren flujo de geometría exacta; STL/OBJ/3MF requieren flujo de malla y metadatos apropiados.

## 14. API interna sugerida

Contratos conceptuales, no código final:
- DocumentService: abrir, cerrar, guardar, snapshot y recuperación.
- CommandDispatcher: invocar, validar, cancelar y confirmar comandos.
- SelectionService: filtros, picking, ciclo de candidatos y selección múltiple.
- FeatureGraph: dependencias, invalidación y orden de regeneración.
- SketchSolver: restricciones, DOF y solución.
- GeometryKernelAdapter: operaciones B-rep y consultas.
- MeshService: reparación, análisis, teselación y operaciones poligonales.
- SceneService: sincronización entre documento y escena.
- RenderService: cámara, materiales, luces, overlays y viewport.
- ExchangeService: importación/exportación.
- UndoRedoService: transacciones de edición.
- ResourceService: texturas, materiales y archivos asociados.

Los contratos usan IDs y tipos de dominio estables, no objetos UI ni handles gráficos.

## 15. Estrategia de pruebas del kernel

Crear corpus de modelos de referencia: cubo/prisma, cilindro y cono, sólidos con agujeros, caras tangentes/casi tangentes, aristas cortas, caras estrechas, superficies NURBS, sólidos importados de distintos CAD, mallas abiertas/cerradas/no-manifold, escalas extremas y modelos con patrones/muchos cuerpos.

Para cada operación registrar éxito/fallo, tiempo, validez B-rep, volumen/área, número de cuerpos/caras/aristas, desviación, memoria, determinismo, undo/redo y regeneración.

## 16. Matriz de pruebas de aceptación

| ID | Prueba | Resultado esperado |
|---|---|---|
| ARC20-001 | Abrir documento nativo | Reconstruye estructura e IDs |
| ARC20-002 | Guardar y reabrir | Modelo equivalente |
| ARC20-003 | Editar parámetro aguas arriba | Recalcula dependientes |
| ARC20-004 | Cambiar parámetro no relacionado | No recalcula subgrafo ajeno |
| ARC20-005 | Crear dependencia circular | Detecta ciclo y explica |
| ARC20-006 | Expresión con unidades | Resultado dimensional correcto |
| ARC20-007 | Extruir sketch cerrado | Sólido válido |
| ARC20-008 | Extruir perfil abierto | Comportamiento definido o error claro |
| ARC20-009 | Revolución de perfil | Resultado válido |
| ARC20-010 | Sweep con trayectoria | Resultado y orientación correctos |
| ARC20-011 | Loft entre perfiles | Correspondencia y continuidad evaluadas |
| ARC20-012 | Boolean Union | Resultado topológicamente válido |
| ARC20-013 | Boolean Subtract | Volumen coherente |
| ARC20-014 | Boolean Intersect | Resultado correcto incluso sin intersección |
| ARC20-015 | Fillet de arista | Radio válido o error sin corrupción |
| ARC20-016 | Chamfer de arista | Distancias y orientación correctas |
| ARC20-017 | Shell | Espesor y caras removidas coherentes |
| ARC20-018 | Split Body | Particiones correctas |
| ARC20-019 | Offset Face | Superficie desplazada y topología válida |
| ARC20-020 | Importar STEP | Sólidos y unidades interpretados |
| ARC20-021 | Importar IGES | Superficies/curvas y advertencias claras |
| ARC20-022 | Importar STL | Malla preservada; no se finge B-rep |
| ARC20-023 | Teselar B-rep | Desviación dentro de tolerancia |
| ARC20-024 | Cambiar calidad de malla | Geometría exacta intacta |
| ARC20-025 | Editar sketch restringido | Solver mantiene restricciones |
| ARC20-026 | Sketch sobrerrestringido | Diagnóstico comprensible |
| ARC20-027 | Referencia topológica ambigua | Solicita resolver, no reasigna |
| ARC20-028 | Operación kernel cancelada | No publica resultado parcial |
| ARC20-029 | Commit con documento modificado | Detecta revisión obsoleta |
| ARC20-030 | Undo/redo de feature | Restaura estados correctos |
| ARC20-031 | Pérdida de contexto gráfico | Reconstruye recursos de render |
| ARC20-032 | Importar archivo adicional | Cámara permanece igual |
| ARC20-033 | Exportar STL | Documento original no cambia |
| ARC20-034 | Escena con instancias | Comparte geometría y conserva transforms |
| ARC20-035 | Malla no-manifold | Diagnóstico y reparación explícita |
| ARC20-036 | Modelo a escala extrema | Tolerancias y medidas estables |
| ARC20-037 | Cierre durante guardado | Recupera última transacción válida |
| ARC20-038 | Migración de esquema | Abre o informa incompatibilidad |
| ARC20-039 | Kernel falla en feature | Estado anterior se conserva |
| ARC20-040 | Preview durante arrastre | Resultado vigente sin bloquear UI |
| ARC20-041 | Dos tareas de recompute | Resultado antiguo no sobrescribe nuevo |
| ARC20-042 | Texturas ausentes | Aviso y fallback visual |
| ARC20-043 | Booleanos casi tangentes | Resultado validado o fallo controlado |
| ARC20-044 | Superficie degenerada importada | Healing o advertencia sin corrupción |
| ARC20-045 | Repetir misma operación | Resultado determinista dentro de tolerancias |

## 17. Plan de prototipos y decisiones pendientes

Antes de seleccionar kernel:
1. Crear app de prueba Android ARM64 mínima que invoque kernel desde NDK.
2. Importar STEP y exportar STEP conservando sólidos.
3. Probar Extrude, Revolve, Boolean Union/Subtract, Fillet y Shell.
4. Medir latencia y memoria con modelos pequeños, medianos y grandes.
5. Probar cancelación y concurrencia.
6. Probar estabilidad de referencias topológicas tras editar operaciones.
7. Evaluar teselación y picking.
8. Revisar licencias, atribuciones y distribución.
9. Comparar al menos dos opciones con el mismo corpus.
10. Registrar resultados cuantitativos antes de elegir.

Decisiones aún no cerradas: proveedor/kernel definitivo, backend de render, lenguaje de integración, formato nativo final, estrategia de solver y límites de edición de mallas importadas.

## 18. Criterios de salida

La arquitectura estará suficientemente definida cuando la fuente de verdad de cada modelo esté clara; B-rep y mallas tengan responsabilidades distintas; la API del kernel esté encapsulada; el modelo paramétrico sea reproducible; las transacciones eviten estados parciales; persistencia/migraciones estén versionadas; la estrategia Android ARM64 haya sido probada; licencias y distribución estén documentadas; y el corpus cubra operaciones críticas y casos degenerados.

## 19. Conclusión

El corazón de NOCTURNE no será el viewport: será la relación coherente entre intención paramétrica, geometría exacta, topología, mallas derivadas, historial y transacciones. La interfaz puede evolucionar sin rehacer el kernel si las capas se mantienen desacopladas. Una decisión equivocada sobre la fuente de verdad geométrica o la identidad topológica comprometería muchas herramientas futuras.

La siguiente fase debe convertir esta arquitectura en una evaluación técnica comparativa de kernels y bibliotecas candidatas, con prototipos medibles en Android antes de fijar dependencias definitivas.
