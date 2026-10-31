# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 15
## Historial paramétrico, árbol de operaciones, dependencias y regeneración

**Estado:** investigación y especificación funcional; no es implementación ni certificación de paridad completa.  
**Plataforma objetivo:** Android. **Referencia:** comportamiento público y observable de Shapr3D.

## 1. Objetivo y alcance

Definir el comportamiento de un modelador CAD cuyo sólido final resulta de una secuencia de operaciones editables. Se cubren historial, árbol, edición retroactiva, dependencias, regeneración, identidad topológica, supresión, variables, undo/redo, persistencia, importaciones, ensamblajes y rendimiento Android.

No se atribuye a Shapr3D ninguna arquitectura interna no documentada. Los servicios y algoritmos propuestos son decisiones de diseño para NOCTURNE.

## 2. Modelo mental del historial

Un modelo paramétrico no es solo el sólido final: es el resultado de evaluar instrucciones ordenadas con parámetros y referencias. Ejemplo: Sketch → Extrude → Sketch sobre cara → Cut → Fillet → Pattern.

Cada operación debe conservar:
- ID interno estable, tipo y versión de definición.
- Entradas, referencias seleccionadas y parámetros.
- Dependencias explícitas.
- Estado, resultado geométrico y metadatos de selección.
- Diagnósticos y firma de las entradas usadas para calcularla.

Estados recomendados: Healthy, Dirty, Computing, Suppressed, Failed, Blocked, Outdated y NeedsReferenceRepair. La interfaz debe distinguir fallo, cálculo pendiente y supresión. Nunca presentar geometría antigua como actual sin indicarlo.

## 3. Árbol de operaciones

Debe organizar documento, componentes/instancias, cuerpos, sketches, planos/ejes, operaciones, patrones, referencias externas y geometría importada. La jerarquía visual no sustituye al grafo de dependencias: una feature puede depender de objetos situados en otras ramas.

Interacciones:
- Seleccionar nodo resalta geometría; seleccionar geometría localiza el nodo.
- Ocultar/mostrar solo cambia visibilidad.
- Abrir operación permite editar parámetros.
- Renombrar cambia etiqueta, nunca identidad interna.
- Suprimir/reactivar recalcula dependencias.
- Los nodos fallidos enfocan el diagnóstico y las referencias problemáticas.

No confundir ocultar, suprimir, borrar y deshacer.

## 4. Edición retroactiva y rollback

El usuario debe poder editar una operación antigua y regenerar sus descendientes sin reconstruirlos manualmente.

Flujo: iniciar transacción reversible; abrir parámetros; editar; validar; confirmar o cancelar; marcar Dirty la operación y descendientes; recomputar en orden topológico; publicar resultado coherente; señalar la primera operación fallida. Conservar la última solución válida como obsoleta y claramente identificada.

Un marcador temporal de evaluación (rollback/end-of-part) sería útil para inspeccionar el modelo hasta una operación, mover el límite y restaurar el historial completo. Su disponibilidad y forma exacta en Shapr3D debe verificarse antes de atribuir paridad.

Reordenar solo si las dependencias siguen siendo válidas y el grafo permanece acíclico. Si una operación quedaría antes de sus entradas, bloquear el movimiento y explicar la causa.

## 5. Grafo de dependencias

Ejemplos: Sketch → Extrude; Datum Plane → Sketch; perfiles/rail → Loft o Sweep; aristas → Fillet; feature/eje → Pattern; componente → mate.

Reglas:
- Referenciar entidades identificadas, no índices visuales temporales.
- Declarar tipo esperado de referencia.
- Detectar ciclos antes de ejecutar.
- Propagar Dirty solo a descendientes afectados.
- No recalcular nodos independientes.
- Advertir antes de borrar entradas usadas.
- Recompute determinista para entradas y versiones idénticas.

Al cambiar un nodo: incrementar revisión, invalidar cachés derivadas, recorrer descendientes, marcar Dirty, ordenar topológicamente y programar cálculo. Si el usuario vuelve a editar durante el cálculo, un resultado viejo nunca debe sobrescribir la revisión nueva.

## 6. Identidad topológica persistente

Problema: una operación puede cambiar la topología anterior. Una arista seleccionada para un fillet puede dividirse, desaparecer o fusionarse. Guardar «arista número 17» no es robusto.

NOCTURNE necesita ReferenceResolver con:
- ID persistente si el kernel lo soporta.
- Feature generadora y tipo topológico.
- Procedencia: generated-from, split-from, merged-from.
- Firmas geométricas auxiliares (longitud, área, centro, orientación, radio).
- Adyacencia y contexto local.
- Historial de cambios topológicos.

Las firmas geométricas son pistas, no identidad. Dos entidades pueden compartir atributos.

Orden de resolución: ID persistente; procedencia del kernel; firma geométrica más contexto; si hay ambigüedad, solicitar reparación; si no hay candidato seguro, marcar NeedsReferenceRepair y bloquear descendientes. Nunca reasignar silenciosamente una referencia crítica.

La reparación debe resaltar la referencia perdida, indicar tipo esperado y feature consumidora, permitir elegir entidad compatible, previsualizar, cancelar y registrar la corrección como transacción reversible.

## 7. Supresión, activación, eliminación y visibilidad

- **Suprimir:** desactiva temporalmente una operación sin borrar su definición; descendientes se recalculan o quedan bloqueados.
- **Reactivar:** reincorpora la operación tras validar referencias y parámetros.
- **Eliminar:** quita el nodo; mostrar dependencias afectadas y permitir cancelar/reparar.
- **Ocultar:** cambia solo visibilidad; no modifica evaluación.
- **Patrones:** distinguir definición del patrón y ocurrencias individuales.

## 8. Variables, expresiones y unidades

Sistema común para sketches, features, patrones y ensamblajes:
- Variables nombradas y expresiones matemáticas.
- Referencias entre variables y cotas.
- Unidades y conversiones.
- Validación dimensional.
- Detección de ciclos y variables inexistentes.
- Propagación de cambios a consumidores.

Ejemplo: ancho = 30 mm; alto = ancho * 0.5; profundidad = 12 mm. Una expresión dimensionalmente incompatible debe rechazarse. Cambiar unidad de visualización no debe cambiar magnitud física.

## 9. Regeneración y arquitectura propuesta

Servicios separados:
- **DocumentGraph:** nodos y relaciones.
- **FeatureNode:** definición, parámetros, referencias y resultado.
- **DependencyGraph:** dependencias y ciclos.
- **RecomputeScheduler:** orden, prioridades, cancelación.
- **KernelAdapter:** interfaz al kernel geométrico.
- **ReferenceResolver:** identidad y reparación topológica.
- **ResultCache:** resultados y firmas de entradas.
- **TransactionManager:** cambios atómicos.
- **UndoRedoManager:** comandos/deltas.
- **DiagnosticService:** errores comprensibles.
- **PersistenceService:** guardado, autosave y recuperación.

Algoritmo: validar parámetros; detectar ciclos; calcular conjunto Dirty; ordenar; comprobar caché por firma, versión de feature y kernel; ejecutar; validar geometría; actualizar referencias; publicar atómicamente; limpiar Dirty solo si la revisión sigue vigente; emitir progreso y diagnóstico.

## 10. Cálculo asíncrono Android

- No bloquear el hilo de interfaz.
- Mostrar progreso en operaciones largas.
- Cancelar cuando el kernel lo permita.
- Descartar resultados obsoletos.
- Limitar concurrencia para proteger memoria y batería.
- Priorizar cálculo necesario para la interacción actual.
- Mantener viewport interactivo cuando sea seguro.
- Agrupar cambios rápidos para evitar recomputes redundantes.
- Crear checkpoints en documentos grandes.

## 11. Undo/redo transaccional

Cada acción lógica debe ser atómica: aplicar completa o no aplicar. Ejemplos: cambiar profundidad, editar cota, reparar referencia, suprimir, reordenar.

Undo debe revertir definición, referencias y resultados; redo no debe duplicar nodos. Restaurar razonablemente selección y foco. Agrupar gestos continuos en una transacción y evitar una entrada por frame. Un fallo de recompute no debe dejar el documento parcialmente modificado.

Combinar snapshots/checkpoints periódicos con comandos o deltas para limitar memoria y tamaño.

## 12. Guardado, recuperación y versionado

Persistir definiciones, parámetros, grafo, referencias/procedencia, geometría importada, versiones de esquema/kernel, supresión/visibilidad, variables y expresiones. No depender solo de la malla teselada final: un documento paramétrico debe poder reconstruirse desde el historial.

Autosave periódico y tras transacciones importantes; escritura atómica; checkpoint previo a operaciones arriesgadas; al reabrir, detectar cálculo interrumpido y regenerar desde estado consistente; nunca guardar resultados parciales como válidos; migraciones explícitas de esquema.

## 13. Importaciones y editabilidad

| Entrada | Edición razonable | Límite |
|---|---|---|
| STEP/IGES/X_T | B-rep importado, caras/aristas y operaciones directas posteriores si se conserva la representación | No recuperar automáticamente el historial original |
| STL/OBJ/PLY | Malla, selección y herramientas de malla compatibles | No es B-rep paramétrico por defecto |
| 3MF | Malla, unidades y materiales compatibles | No implica historial de features |
| GLB/glTF/FBX/USD | Escena, transformaciones, mallas y materiales/texturas compatibles | No equivale a CAD B-rep |

Para STL, permitir edición de malla sin fingir que triángulos son caras CAD analíticas. Conversión a B-rep, si existe, debe ser explícita y advertir sobre precisión/pérdida de información.

## 14. Historial de ensamblajes

Distinguir definición de componente, instancia, transformación, mate, articulación, referencias entre componentes y operaciones de contexto. Editar definición compartida actualiza instancias; editar una instancia no debe alterar otras. Las referencias externas muestran vínculo, versión y estado; si la fuente cambia o falta, explicar qué queda desactualizado.

## 15. Experiencia y diagnósticos

Mensajes recomendados:
- “Esta operación necesita regenerarse”.
- “No se pudo resolver la arista seleccionada porque cambió la geometría anterior”.
- “3 operaciones dependen de este sketch”.
- “El patrón está bloqueado porque su eje no está disponible”.
- “Se conserva la última geometría válida; el resultado visible está desactualizado”.
- “La operación se canceló. El modelo anterior permanece intacto”.

Evitar errores crípticos sin explicación; los detalles técnicos pueden expandirse en un panel.

## 16. Matriz de pruebas de aceptación

### Historial y edición
1. Crear sketch/extrusión y verificar orden.
2. Editar profundidad de operación inicial.
3. Cambiar perfil y regenerar.
4. Cancelar editor sin cambios.
5. Renombrar sin cambiar ID.
6. Ocultar/mostrar sin alterar historial.
7. Suprimir/reactivar.
8. Eliminar con descendientes y mostrar impacto.
9. Editar feature antigua con varias posteriores.
10. Inspeccionar estado intermedio con rollback si se implementa.

### Dependencias
11. Cambiar plano y actualizar solo descendientes.
12. Cambiar sketch independiente sin recalcular otros cuerpos.
13. Detectar ciclo.
14. Bloquear reordenamiento antes de sus entradas.
15. Reordenar operaciones independientes cuando sea seguro.
16. Eliminar referencia usada por patrón y diagnosticar.
17. Cambiar variable global y actualizar consumidores.

### Topología
18. Editar extrusión y conservar referencia inequívoca.
19. Dividir arista y detectar cambio de cardinalidad.
20. Eliminar cara usada por fillet.
21. Resolver por procedencia del kernel.
22. Detectar candidatos ambiguos y pedir selección.
23. Reparar referencia manualmente.
24. Deshacer/rehacer reparación.
25. Verificar que no exista reasignación silenciosa.

### Regeneración
26. Recalcular grafo lineal.
27. Recalcular grafo ramificado.
28. Recalcular solo nodos Dirty.
29. Reutilizar caché con entradas idénticas.
30. Invalidar caché al cambiar versión.
31. Cancelar cálculo largo.
32. Editar parámetro durante cálculo y descartar resultado obsoleto.
33. Simular fallo y conservar solución anterior marcada obsoleta.
34. Recuperar descendientes al corregir antecesora.

### Parámetros
35. Evaluar expresión válida.
36. Detectar variable inexistente.
37. Detectar ciclo entre variables.
38. Rechazar incompatibilidad dimensional.
39. Convertir mm/in sin alterar magnitud.
40. Cambiar unidad visual sin alterar geometría.

### Undo/persistencia
41. Deshacer edición paramétrica.
42. Rehacer sin duplicar features.
43. Deshacer supresión.
44. Revertir fallo sin documento parcial.
45. Reabrir conservando árbol.
46. Interrumpir guardado y recuperar checkpoint.
47. Migrar esquema anterior.
48. Abrir con kernel distinto y aplicar política de regeneración.

### Importación/ensamblajes
49. Importar STL y tratarlo como malla.
50. Importar STEP y crear operaciones posteriores.
51. Cambiar definición y actualizar instancias compartidas.
52. Cambiar una instancia sin afectar otras.
53. Romper referencia externa y mostrar estado.
54. Recuperar referencia externa al relocalizar archivo.

### Android
55. Mantener UI fluida durante recompute.
56. Agrupar cambios rápidos.
57. Cancelar al cerrar documento con seguridad.
58. Limitar caché en documentos grandes.
59. Mostrar progreso y operación responsable.
60. Impedir que cálculo antiguo sobrescriba revisión nueva.

## 17. Criterios de aceptación

La función no está terminada hasta que el árbol represente operaciones reales; se puedan editar features antiguas; los cambios se propaguen por dependencias; recompute sea determinista e incremental; referencias topológicas se resuelvan o pidan reparación; los errores conserven el último estado válido; undo/redo sea transaccional; guardado preserve estructura paramétrica; malla y B-rep se traten según sus capacidades; y el cálculo no bloquee Android.

## 18. Separación de certeza

**A contrastar directamente en Shapr3D:** árbol/Project, edición de operaciones y tarjetas de parámetros cuando estén disponibles, comportamiento del historial, edición de sketches/features, gestión de cuerpos/componentes y persistencia.

**Arquitectura CAD general propuesta para NOCTURNE, no atribuida a Shapr3D:** grafo explícito, estados Dirty/Blocked, scheduler incremental, topological naming, procedencia, reparación asistida, rollback marker, snapshots/deltas, recuperación transaccional y caché.

**Pendiente de verificación empírica:** alcance exacto de reordenamiento, supresión, rollback, persistencia de referencias tras cambios topológicos, regeneración interna y disponibilidad por versión/plataforma. No convertir hipótesis de diseño en afirmación de paridad.

## 19. Siguiente bloque

Parte 16: colaboración, documentos, proyectos y gestión de archivos; autosave/sincronización; versiones y conflictos; exportación de entregables; organización de proyectos; permisos y trabajo compartido; inicio y recuperación de documentos. Separar siempre funciones confirmadas de Shapr3D y decisiones propias de NOCTURNE.
