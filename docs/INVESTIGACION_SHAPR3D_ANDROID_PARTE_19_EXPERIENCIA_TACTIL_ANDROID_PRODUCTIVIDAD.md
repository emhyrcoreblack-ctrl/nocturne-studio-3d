# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 19
## Experiencia táctil Android, productividad y estados de interacción

**Estado:** especificación de investigación y requisitos; no es una implementación.  
**Plataforma objetivo:** Android, teléfonos y tabletas.  
**Referencia funcional:** comportamiento observable y documentación pública de Shapr3D, sin asumir que ofrece una versión Android oficial.  
**Principio:** trasladar patrones útiles de interacción CAD táctil a una implementación propia, conservando precisión, previsibilidad y trazabilidad.

## 1. Objetivo y alcance

Esta parte define cómo debe sentirse y comportarse NOCTURNE al modelar con dedo, stylus, teclado o ratón en Android. La interfaz no debe obligar al usuario a elegir entre precisión y espacio de trabajo. La geometría debe seguir siendo el centro de la pantalla; los controles aparecen cuando aportan contexto y desaparecen cuando estorban.

Se especifican la separación entre navegación y modelado, selección de subelementos, entrada numérica, menús y accesos rápidos, paneles adaptativos, estados de herramientas, feedback, accesibilidad, rendimiento y pruebas de regresión.

No basta con dibujar controles: cada gesto y transición debe producir resultados geométricos verificables, reversibles y consistentes.

## 2. Principios de interacción

1. Una acción debe producir un resultado predecible.
2. La cámara nunca modifica el modelo.
3. La intención activa gobierna los gestos; no se cambia de significado silenciosamente.
4. La precisión precede a la velocidad; las acciones destructivas requieren confirmación adecuada.
5. Las operaciones confirmadas entran al historial; las vistas previas canceladas no dejan residuos.
6. Herramienta activa, selección, restricciones, unidades y modo de entrada deben ser visibles.
7. La interfaz es adaptable; los paneles secundarios no ocupan permanentemente el espacio de modelado.
8. Ninguna función esencial depende exclusivamente de color, sonido o un gesto complejo.

## 3. Máquina de estados de interacción

Implementar una máquina de estados explícita, no una colección de booleanos dispersos.

| Estado | Significado | Comportamiento requerido |
|---|---|---|
| Idle | Sin comando activo | Navegación y selección disponibles según configuración |
| Preselect | Candidato bajo el puntero | Resaltar candidato sin alterar selección |
| Selected | Elementos seleccionados | Mostrar acciones contextuales y propiedades |
| ToolActive | Comando iniciado | Mostrar instrucciones y filtros válidos |
| AwaitingInput | Espera punto, entidad o valor | Capturar entrada y mantener estado hasta completar/cancelar |
| Preview | Resultado provisional | Actualizar sin comprometer geometría |
| ValidationError | Entrada o geometría inválida | Explicar causa y permitir corrección |
| Committing | Confirmación transaccional | Validar, crear operación de historial y actualizar dependencias |
| Cancelled | Comando cancelado | Descartar preview y restaurar estado anterior |
| Recomputing | Regeneración del modelo | Mostrar progreso si es perceptible; bloquear solo comandos incompatibles |
| ModalPanel | Panel o diálogo bloqueante | Definir destino de gestos |

Transiciones:
- Idle a ToolActive al invocar un comando.
- ToolActive a AwaitingInput al mostrar el primer paso requerido.
- AwaitingInput a Preview cuando existe información suficiente para calcular resultado provisional.
- Preview a AwaitingInput si falta otro parámetro o el usuario edita una entrada.
- Preview a Committing solo por confirmación explícita.
- Cualquier estado previo a Committing puede cancelarse sin crear historial.
- Un error no debe borrar entradas válidas.
- Committing es atómico: éxito completo o rollback completo.

## 4. Separación entre navegación y modelado

En pantalla táctil, los mismos dedos pueden navegar la cámara, seleccionar entidades o introducir geometría. Una asignación ambigua provoca selecciones accidentales, zoom inesperado y pérdida de precisión.

Política recomendada:
- En Idle, reservar gestos de dos dedos para navegación y toque simple para selección.
- Con herramienta de dibujo activa, el toque introduce el punto o entidad solicitado.
- Mantener una acción visible para cambiar temporalmente a navegación sin cancelar la herramienta.
- Permitir bloquear/desbloquear cámara.
- Un gesto iniciado sobre un control UI no se propaga a la escena.
- Al iniciar un gesto, fijar su destino (viewport o interfaz) hasta que termine.
- No interpretar un arrastre corto como órbita si comenzó sobre una entidad arrastrable.
- Ofrecer preferencias para stylus, dedo, mano izquierda y ratón.

| Gesto | Acción de referencia | Salvaguarda |
|---|---|---|
| Arrastre con dos dedos | Pan | No seleccionar geometría |
| Pinch con dos dedos | Zoom | Mantener punto focal bajo los dedos cuando sea posible |
| Arrastre con un dedo en modo cámara | Órbita | Mostrar indicador de modo cámara |
| Doble toque en entidad | Selección/centrado contextual configurable | Nunca ejecutar edición destructiva |
| Zoom to Fit | Encuadrar contenido | Comando explícito; nunca dispararlo por importar archivo |
| Vista estándar | Frente/arriba/lado/isométrica | Mantener centro y escala predecibles |

Las asignaciones exactas deben poder configurarse y documentarse. No prometer paridad gesto por gesto sin pruebas en el dispositivo objetivo.

## 5. Selección táctil de geometría

Tipos de selección: cuerpo/objeto, cara, arista, vértice, curva o entidad de sketch, plano/eje/punto de construcción, componente/instancia, y elementos de dibujo 2D.

### Picking en espacio de pantalla
La selección debe calcularse en espacio de pantalla, no con tolerancia fija en unidades del modelo. La tolerancia táctil se expresa en píxeles físicos o dp convertidos correctamente y se adapta a densidad y escalado.

Requisitos:
- Priorizar candidatos próximos al centro de contacto y conservar lista ordenada.
- Aplicar prioridades configurables por filtro.
- No favorecer siempre el cuerpo cuando se edita un sketch.
- Para aristas delgadas, usar región de captura mayor que el grosor visual.
- Para vértices coincidentes, mostrar selector de candidatos.
- En geometría superpuesta, ofrecer ciclo de selección sin alterar cámara.
- Mostrar nombre/tipo del candidato cuando exista ambigüedad.
- Distinguir preselección de selección persistente.
- Soportar selección por ventana y lazo cuando el dispositivo y espacio lo permitan.
- Filtros visibles: todo, cuerpos, caras, aristas, vértices, sketch, construcción y componentes.

### Dedo, stylus y ratón
- Dedo: mayor radio de tolerancia y confirmación contextual ante ambigüedad.
- Stylus: tolerancia más estrecha, hover si el hardware lo soporta; no depender de hover para completar operaciones.
- Palm rejection cuando exista stylus activo, sin bloquear permanentemente entradas de dedo.
- Ratón: hover, clic, modificadores y rueda según capacidades disponibles.
- La presión del stylus se ignora salvo que exista una función explícita que la utilice.

### Selección múltiple
- Añadir/quitar con modificador visible y accesible.
- Mantener selección primaria para operaciones que requieren entidad principal.
- Mostrar contador y tipos.
- Definir orden estable para perfiles, caras y cuerpos.
- Al cambiar filtro, no borrar silenciosamente selección incompatible.

## 6. Entrada numérica, cotas y parámetros

Requisitos:
- Campo numérico contextual junto a operación o en banda compacta.
- Teclado adecuado para longitud, ángulo, porcentaje y coordenadas.
- Aceptar unidades explícitas y conversiones configurables.
- Aceptar expresiones y variables si el motor paramétrico las soporta.
- Mostrar unidad activa.
- Distinguir valor provisional, validado y confirmado.
- No convertir valores inválidos silenciosamente.
- Permitir reemplazar el valor completo con facilidad.
- Enter confirma cuando proceda; Escape/atrás cancela o cierra teclado según jerarquía de foco.

Flujo:
1. Activar herramienta.
2. Mostrar parámetro principal y unidad.
3. Presentar preview geométrico.
4. Introducir valor, expresión o arrastrar manipulador.
5. Sincronizar ambas formas de entrada.
6. Validar rango, unidad, topología y restricciones.
7. Confirmar o cancelar.
8. Crear/actualizar nodo de historial.

Casos límite: campo vacío, separador decimal regional, signo negativo no permitido, ángulo fuera de rango, unidad incompatible, expresión circular, variable inexistente, división por cero, cambio de unidades, teclado que cubre controles y pérdida de foco al rotar dispositivo. El teclado Android no debe ocultar el manipulador ni la confirmación.

## 7. Menús, comandos y productividad

### Menú contextual
Depende de selección y estado. Una cara ofrece acciones de cara; una arista, operaciones de arista; un cuerpo, transformaciones/booleanos/propiedades; un sketch, edición/restricciones/cotas; un componente, relaciones e instancias. Presentar solo comandos válidos o explicar por qué están deshabilitados.

### Menús flotantes y radiales
- Menús anclados cerca de selección, reposicionados para permanecer en pantalla.
- Menú radial opcional para accesos frecuentes con una mano.
- Objetivos táctiles amplios.
- Tocar fuera cierra solo si no se pierden datos.
- Comportamiento consistente entre teléfono y tableta.

### Búsqueda de comandos
- Buscar por nombre, sinónimo y categoría.
- Mostrar recientes y favoritos.
- Respetar contexto y señalar comandos no aplicables.
- Ejecutar y mostrar instrucciones de uso.
- No convertir la búsqueda en el único acceso a herramientas esenciales.

### Favoritos
Favoritos configurables, accesos recientes, reordenación sin alterar identificadores internos, atajos de teclado y persistencia global o por proyecto según preferencia.

## 8. Paneles adaptativos y espacio de viewport

El panel secundario —incluido el panel derecho de propiedades/operaciones— debe poder ocultarse y abrirse mediante un icono reconocible. No debe permanecer abierto por defecto ocupando una parte sustancial de la pantalla.

Requisitos:
- Botón persistente para mostrar/ocultar.
- Al ocultarse, viewport recupera espacio inmediatamente.
- Al abrirse, no cambia cámara ni zoom.
- Recordar último estado por dispositivo o preferencia.
- En teléfono, usar panel inferior/hoja/superposición según contexto; en tableta, panel lateral redimensionable.
- Mostrar propiedades relevantes para el contexto.
- Cerrar con atrás sin cancelar operación activa.
- Si hay cambios sin confirmar, evitar descartarlos silenciosamente.
- No cubrir selección o manipulador; reposicionar panel o solicitar ajuste explícito, nunca cambiar cámara silenciosamente.

La prioridad del viewport es una decisión de producto: interfaz contextual, compacta y recuperable.

## 9. Feedback visual, háptico y audio

- Preselección distinta de selección confirmada.
- Contorno/relleno legible para selección.
- Restricciones con iconos y etiquetas, no solo colores.
- Snapping indica referencia (punto final, centro, tangencia, perpendicular, etc.).
- Operación inválida indica causa cerca del parámetro o geometría.
- Regeneración muestra progreso si tarda.
- Feedback háptico opcional y configurable.
- Errores no dependen solo de vibración/sonido.
- Evitar animaciones largas en tareas repetitivas.

## 10. Accesibilidad y ergonomía

- Objetivos táctiles adecuados para teléfono.
- Escalado de interfaz independiente del zoom geométrico.
- Contraste en tema claro/oscuro.
- Estados distinguibles sin depender solo del color.
- Etiquetas accesibles y orden lógico de foco.
- Compatibilidad razonable con lectores de pantalla.
- Preferencia zurda y reubicación de controles.
- Reducir animaciones y hápticos mediante ajustes.
- No usar gestos de tres o más dedos como único mecanismo esencial.
- Respetar escalado de texto del sistema.
- Confirmaciones para operaciones destructivas o pérdida de datos, no para cada acción rutinaria.

## 11. Adaptación Android

**Teléfono:** herramientas compactas, paneles como hojas/superposiciones, confirmación al alcance del pulgar, teclado sin ocultar preview, pocos controles permanentes.

**Tableta:** viewport amplio, paneles laterales opcionales y redimensionables, barra más completa, orientación horizontal/vertical sin perder jerarquía.

**Stylus, ratón y teclado:** detectar capacidades reales; hover solo si existe; atajos configurables; rueda y pinch con escalas coherentes; Escape/Enter/flechas con comportamiento visible.

**Ciclo de vida Android:** guardar de forma segura estado de herramienta, selección y parámetros no confirmados; al reanudar, restaurar o preguntar de forma predecible; nunca confirmar automáticamente por interrupción; gestionar orientación, multitarea, memoria baja y reanudación; proteger el proyecto con guardado transaccional/autosave.

## 12. Rendimiento del viewport y arquitectura

Objetivo: interacción fluida y estable en hardware objetivo. 60 fps es referencia de evaluación en dispositivos capaces, no garantía universal.

- Separar renderizado, picking, solver y UI.
- Índice espacial para candidatos.
- Picking GPU cuando sea viable y fallback CPU determinista.
- LOD visual para escenas densas sin modificar geometría real.
- Actualizar solo overlays/regiones afectadas cuando sea posible.
- Debounce de texto y arrastres.
- Cancelar cálculos obsoletos; solo el estado vigente publica preview.
- Kernel fuera del hilo UI.
- Medir tiempo de selección, latencia de preview, recomputación, memoria y temperatura.
- Gestionar batería y throttling térmico.
- No sacrificar precisión topológica para sostener cuadros por segundo.

## 13. Integridad y prevención de errores

1. Gestos de cámara no crean historial.
2. Preseleccionar no cambia selección persistente.
3. Cancelar descarta preview.
4. Confirmar crea una transacción.
5. Toque UI no llega al viewport.
6. Gesto iniciado en viewport no cambia a UI a mitad.
7. Abrir/cerrar panel no cambia cámara/zoom.
8. Mostrar teclado no cambia geometría ni confirma operaciones.
9. Cambiar orientación conserva contexto o solicita decisión clara.
10. Selección no cambia por regeneración sin explicación.
11. Fallo de kernel restaura estado anterior.
12. Importar otro archivo no ejecuta Zoom to Fit automáticamente.

## 14. Matriz de pruebas de aceptación

Estas pruebas son requisitos propuestos de NOCTURNE; no implican que todos sean comportamientos públicamente confirmados de Shapr3D.

| ID | Prueba | Resultado esperado |
|---|---|---|
| UX19-001 | Orbitar con dos dedos en Idle | Cámara cambia; geometría intacta |
| UX19-002 | Pan con dos dedos | Cámara se desplaza sin seleccionar |
| UX19-003 | Pinch zoom | Zoom suave y punto focal estable |
| UX19-004 | Arrastre con cámara bloqueada | Cámara quieta; feedback visible |
| UX19-005 | Línea activa y toque viewport | Punto válido registrado |
| UX19-006 | Navegación temporal durante línea | Herramienta permanece activa |
| UX19-007 | Toque sobre botón UI | No llega al viewport |
| UX19-008 | Gesto cruza límite viewport/panel | Conserva destino inicial |
| UX19-009 | Cara pequeña con dedo | Picking tolerante y correcto |
| UX19-010 | Arista próxima a cara | Arista seleccionable explícitamente |
| UX19-011 | Vértices coincidentes | Selector de candidatos |
| UX19-012 | Elementos superpuestos | Alternancia de candidatos |
| UX19-013 | Cambio de filtro | Política estable y explicada |
| UX19-014 | Selección múltiple | Contador y selección primaria correctos |
| UX19-015 | Selección por ventana | Entidades según regla documentada |
| UX19-016 | Selección por lazo | Resultado repetible |
| UX19-017 | Stylus con hover | Preselección sin commit |
| UX19-018 | Dispositivo sin hover | Flujo completo mediante toque |
| UX19-019 | Longitud con unidad | Conversión y preview correctas |
| UX19-020 | Entrada de ángulo | Rango/unidad validados |
| UX19-021 | Expresión válida | Evaluada y persistida |
| UX19-022 | Expresión inválida | Error claro; no pierde otras entradas |
| UX19-023 | Separador decimal regional | Entrada interpretada correctamente |
| UX19-024 | Teclado cubre viewport | Campo y confirmación accesibles |
| UX19-025 | Confirmar operación | Una transacción de historial |
| UX19-026 | Cancelar preview | Sin cambio geométrico residual |
| UX19-027 | Fallo durante commit | Rollback completo |
| UX19-028 | Menú contextual de cara | Acciones pertinentes |
| UX19-029 | Menú contextual de cuerpo | Acciones de cuerpo correctas |
| UX19-030 | Menú cerca del borde | Reposicionado en pantalla |
| UX19-031 | Ejecutar por búsqueda | Comando correcto; contexto preservado |
| UX19-032 | Buscar sinónimo | Resultado relevante |
| UX19-033 | Favoritos | Persisten tras reinicio |
| UX19-034 | Ocultar panel derecho | Viewport se expande; cámara igual |
| UX19-035 | Mostrar panel derecho | Cámara/zoom iguales |
| UX19-036 | Abrir panel durante operación | Herramienta sigue activa |
| UX19-037 | Cerrar panel con cambios | Evita pérdida silenciosa |
| UX19-038 | Cambiar teléfono/tableta | Adaptación sin perder operación |
| UX19-039 | Rotar con sketch activo | Contexto recuperado |
| UX19-040 | Segundo plano durante Preview | No confirma automáticamente |
| UX19-041 | Reanudar interrupción | Restauración o decisión explícita |
| UX19-042 | Lector de pantalla | Controles esenciales etiquetados |
| UX19-043 | Escalar texto del sistema | UI utilizable |
| UX19-044 | Tema claro/oscuro | Selección y restricciones legibles |
| UX19-045 | Usuario zurdo | Controles reubicables |
| UX19-046 | Escena con muchos cuerpos | Picking responde adecuadamente |
| UX19-047 | Arrastre continuo de manipulador | Preview vigente |
| UX19-048 | Recompute lento | UI receptiva |
| UX19-049 | Throttling térmico | Sin corrupción; degradación controlada |
| UX19-050 | Importar segundo archivo | Cámara no cambia automáticamente |
| UX19-051 | Zoom to Fit explícito | Encuadre según alcance definido |
| UX19-052 | Undo tras operación | Revierte exactamente una |
| UX19-053 | Undo durante Preview | No revierte operación previa por error |
| UX19-054 | Cambio de herramienta | Estado anterior confirmado/cancelado según regla |
| UX19-055 | Pérdida de foco durante entrada | No confirma ni descarta silenciosamente |
| UX19-056 | Palm rejection con stylus | Reduce trazos accidentales sin bloquear UI |

## 15. Criterios de salida

La fase solo puede considerarse especificada cuando:
- Cada gesto tiene estado, destino, prioridad y cancelación definidos.
- Los filtros de selección tienen pruebas reproducibles.
- Entrada numérica respeta unidades y expresiones paramétricas.
- Los paneles no modifican cámara al abrirse/cerrarse.
- Comandos tienen preview, validación, commit y rollback.
- Matriz ejecutada en al menos un teléfono y una tableta Android de referencia.
- Se registran latencia, cuadros por segundo, memoria y errores de picking.
- Se documentan diferencias entre dedo, stylus, ratón y teclado.

## 16. Referencia frente a decisiones propias

**Referencia funcional a contrastar con Shapr3D:** flujo contextual de herramientas, selección CAD, manipulación directa, entrada de parámetros, paneles, navegación táctil, feedback y ciclo de operación.

**Requisitos propios de NOCTURNE:** Android como plataforma objetivo; panel derecho colapsable mediante icono; cámara estable al abrir/cerrar panel o importar modelos; estados transaccionales explícitos; adaptación a teléfonos/tabletas; accesibilidad Android y pruebas del ciclo de vida.

No atribuir a Shapr3D funciones, gestos, ajustes o soporte Android sin evidencia pública verificable. Clasificar observaciones como confirmado, observado, inferido o pendiente de validar.

## 17. Pendientes de investigación

- Capturar secuencias reproducibles de gestos en versión/plataforma de referencia.
- Verificar selección superpuesta, tolerancias y ciclo de candidatos.
- Comparar menús contextuales y búsqueda por tipo de selección.
- Medir objetivos táctiles en distintos tamaños.
- Validar stylus y ratón con dispositivos reales.
- Establecer umbrales de latencia para gama baja, media y alta.
- Probar accesibilidad con TalkBack y escalado de fuente.
- Registrar versión, fecha, plataforma y evidencia por observación.

**Conclusión:** la experiencia táctil no es cosmética. Determina cómo se selecciona geometría, se introducen parámetros, se confirma una operación y se protege el modelo de gestos ambiguos. NOCTURNE debe implementarla como sistema coherente de estados y transacciones, no como controles aislados.
