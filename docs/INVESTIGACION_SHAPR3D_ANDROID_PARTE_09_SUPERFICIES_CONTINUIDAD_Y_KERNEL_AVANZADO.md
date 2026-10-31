# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 09
## Superficies avanzadas, continuidad, redondeos y operaciones booleanas complejas
**Fecha:** 31 de octubre de 2026  
**Objetivo:** Android. **Referencia:** documentación pública oficial Shapr3D.

> Esta parte profundiza en operaciones de superficies y casos límite del modelado. Los comportamientos confirmados se separan de recomendaciones de ingeniería para NOCTURNE. No se ha copiado código ni implementación privada.

## 1. Novedad relevante: Fill (Beta)

La versión 26.190, publicada el 22 de octubre de 2026, incorpora Fill en beta. Es importante para el alcance de paridad: no es una simple tapa plana, sino una operación de creación de geometría suave a partir de:
- Perfiles de contorno/bordes de la abertura.
- Curvas guía (aristas de sketch, splines o curvas).
- Redes conectadas de curvas.
- Combinaciones de contornos y guías.

Se usa para transiciones suaves entre cuerpos, puentes sobre huecos irregulares, cierres de aberturas de varios lados y superficies curvas tipo domo. Los badges de continuidad permiten seleccionar G0, G1 o G2 en las conexiones disponibles. Fill está integrado en History y mantiene los pasos editables.

**Flujo documentado:** preparar límites y curvas guía que formen una red continua; Tools > Fill; seleccionar perfiles límite, guías o red; ajustar continuidad con badges; volver a abrir Fill/Parameter Card para revisar selección y estado; completar haciendo clic en área vacía.

**Requisitos NOCTURNE:**
- Resolver una red de curvas y sus conectividades antes de ejecutar el kernel.
- Diferenciar límites cerrados, límites abiertos y redes incompletas.
- Validar que cada guía conecte con los límites exigidos; explicar qué conexión falta.
- Previsualizar la superficie y la continuidad por borde.
- Registrar inputs, continuidad por borde, parámetros y resultado en historial.
- Mantener estado Beta/experimental como referencia histórica de Shapr3D, no asumir que el usuario exige que NOCTURNE marque su herramienta como beta.

## 2. Continuidad geométrica G0, G1 y G2

Definiciones confirmadas:
- **G0 (posicional):** las entidades coinciden en posición; pueden formar esquina o arista visible.
- **G1 (tangencial):** coinciden en posición y dirección tangente; desaparece la arista dura, pero la curvatura puede cambiar abruptamente.
- **G2 (curvatura):** coinciden posición, tangente y curvatura; transición de reflejos más gradual.

Cada nivel superior incluye los requisitos del inferior. G2 no es siempre deseable: G0 es apropiado para aristas intencionales; G1 para transiciones suaves de dirección; G2 para superficies exteriores donde importa la continuidad de reflejos.

Aplicaciones documentadas:
- Fill: continuidad según límites y caras vecinas.
- Loft: continuidad tangente inicial/final.
- Sweep: continuidad y cambios bruscos de la trayectoria influyen en el resultado.
- Fillet: tipo de blend y superficies vecinas.

**Implementación recomendada:** representar continuidad como condición por frontera (no una bandera global ciega). La resolución debe poder degradar o fallar con mensaje claro cuando las condiciones de entrada no permitan el nivel pedido. Nunca reportar G2 si solo se garantiza G1.

## 3. Loft avanzado: perfiles, puntos de conexión, guías y periodicidad

Loft interpola geometría entre secciones transversales:
- Mínimo dos perfiles.
- Perfiles pueden ser caras o regiones de sketch y deben ser secciones cerradas individuales.
- Perfiles deben estar en planos separados; dos secciones en el mismo plano o que se intersectan no son válidas.
- Si hay más de dos, se seleccionan en orden de conexión.
- Los puntos de conexión mapean vértices entre perfiles; moverlos puede crear o eliminar torsión.
- Si se especifican curvas guía, los puntos de conexión no están disponibles.
- Las guías deben intersectar cada sección; si no la tocan o quedan dentro de la sección, Loft falla.
- Periodic Loft permite suavizar/unir el primer y último perfil en lofts periódicos.
- Historial: Profiles, Periodic Loft, Guides, Start/End Tangent Continuity (None/G1/G2) y magnitudes de tangencia.

**Auto-Boolean reciente:** desde 26.190, Loft permite elegir Union, Subtract o Intersect mediante Boolean badge durante la operación. El resultado puede combinarse/cortarse sin un paso booleano posterior. Guardar tipo booleano como parte de la definición del Loft, además de perfiles/guías.

**Pruebas:** perfiles con distinto número de vértices; perfiles con orientaciones opuestas; guías tangentes/no tangentes; guía que no alcanza un perfil; secciones coplanares; secciones que se cruzan; periodicidad; continuidad G1/G2 imposible; auto-boolean con solapamiento, tangencia y no intersección.

## 4. Fillet avanzado

### 4.1 Tipos
- **Radius:** define radio constante y sección circular.
- **Chordal:** define distancia recta entre extremos del redondeo, no el radio.

### 4.2 Opciones geométricas
- Corner **Rolling Ball:** esquina con radio constante (predeterminado).
- Corner **Setback:** retrae los bordes donde los redondeos se encuentran; cara de transición con radio variable.
- Continuity **G1:** tangencia con caras adyacentes.
- Continuity **G2:** iguala curvatura además de tangencia; perfil transversal no circular.
- Profile slider: modifica sección del fillet, desde más plana a más afilada; valor de magnitud entre -1 y 1.
- Overflow: Auto, Cliff, Smooth o Notch.
- Curvature: valor de curvatura.
- Include Tangent Edges.
- Y-Shaped Blend.

En el historial se editan Edge, Size Type, Radius o Width, Continuity, Corner, Overflow, Curvature, Include Tangent Edges y Y-Shaped Blend.

**Chamfer:** Auto aplica retranqueos iguales; 2-distance usa dos distancias distintas. Historial permite Distance #1, Distance #2 e Include Tangent Edges.

### 4.3 Requisitos de implementación
- Resolver conjuntos de aristas conectadas, vértices de encuentro y transiciones multi-cara.
- Previsualizar radio/chord y mostrar fallos locales.
- No asumir que un radio que funciona en una arista funciona en todas las seleccionadas.
- Evitar aceptar valores que producen auto-intersección o caras degeneradas.
- Mantener parámetros semánticos; un fillet G2 no debe almacenar el número como si fuera un radio circular exacto.
- Incluir pruebas de aristas tangentes, vértices triédricos, cadenas cerradas, radios máximos, aristas cortas, caras estrechas y geometría importada.

## 5. Shell (vaciado)

Shell convierte un sólido en carcasa de espesor uniforme:
1. Seleccionar una o varias caras que se eliminarán.
2. Definir espesor mediante gizmo.
3. Confirmar.
Historial expone Target y Thickness.

**Recomendaciones para NOCTURNE:**
- Definir si el espesor va hacia dentro, fuera o centrado; no asumir sin validación del comportamiento esperado.
- Verificar espesor frente a radios locales, paredes cercanas y zonas de auto-intersección.
- Detectar colapso de paredes, caras offset que se cruzan y regiones de espesor imposible.
- Soportar múltiples caras de apertura y cuerpos con superficies curvas.
- Dar diagnóstico de cara/zona que invalida el shell, no un error genérico del kernel.
- Conservar referencias de caras eliminadas y espesor en historial.

## 6. Booleanos: semántica y casos límite

Operaciones:
- **Union:** combina cuerpos solapados en un cuerpo unido.
- **Subtract:** elimina volumen de uno o varios cuerpos objetivo mediante cuerpos herramienta.
- **Intersect:** crea cuerpo con volumen común entre objetivos y herramientas.

La interfaz distingue Target y Tool. En Subtract, las opciones Keep Originals son All, Modified Bodies, Removed Bodies y None. Union/Intersect documentan conservación de objetivos y herramientas por separado. History permite cambiar Target, Tool, Type y políticas de conservación. La última selección de Union se convierte por defecto en Target.

**Auto-Boolean:** Sweep y Loft permiten Union/Subtract/Intersect directamente mediante badge durante el comando, según changelog 26.190.

**Casos que el kernel debe diferenciar:**
- Solapamiento volumétrico real.
- Contacto tangencial de caras.
- Contacto solo por arista o vértice.
- Cuerpos separados sin intersección.
- Coincidencia coplanar parcial/total.
- Herramienta contenida completamente en objetivo.
- Múltiples objetivos y herramientas.
- Cuerpos no-manifold o sólidos importados inválidos.

**Regla de diseño:** no confundir contacto tangencial con intersección de volumen. Resultado vacío, múltiples sólidos, operación ambigua y geometría inválida deben ser estados diferenciados. La operación debe ser transaccional: si falla, no borrar ni alterar originales.

## 7. Split Body y superficies de corte

Split Body puede cortar sólidos usando planos de construcción o grid, perfiles de sketch, caras/aristas de otro cuerpo, imágenes importadas o incluso una cara del propio cuerpo. La herramienta de corte se proyecta a través del cuerpo, por lo que no necesita tocarlo físicamente. Pueden seleccionarse varias herramientas de corte en una operación.

Perfiles de sketch conectados en el mismo plano se combinan en una superficie de corte; perfiles desconectados producen cortes simultáneos separados. Keep Originals Off deja resultados y elimina original; On crea resultados nuevos y conserva original.

**Pruebas necesarias:** herramienta que no toca el cuerpo pero atraviesa su extensión; varios planos; sketches conectados/desconectados; cara propia; cuerpo con varios sólidos; corte tangente o coincidente; herramienta que no atraviesa el cuerpo.

## 8. Modelo de datos y robustez del kernel

Para Fill, Loft, Fillet, Shell y Boolean:
- Guardar referencias persistentes de topología, no índices temporales.
- Registrar el tipo de operación y versión del esquema.
- Parámetros dimensionales con unidades explícitas.
- Dependencias en grafo acíclico de historial.
- Resultado B-rep validado (closed/manifold/orientable según operación).
- Diagnóstico estructurado: entrada inválida, referencia rota, degeneración, auto-intersección, fallo de solver, resultado vacío.
- Preview separado del estado confirmado.
- Commit atómico; rollback íntegro si falla.
- Recalcular pasos posteriores al editar uno anterior.
- No usar malla triangulada como sustituto silencioso de geometría exacta.

Para superficies libres, mantener curvas guía, límites y condiciones de continuidad como datos editables; no convertir la superficie en malla irreversible tras cada edición.

## 9. Matriz de pruebas Parte 09

| ID | Caso | Resultado esperado |
|---|---|---|
| T09-01 | Fill con contorno cerrado simple | Superficie/cuerpo válido |
| T09-02 | Fill con hueco multi-lado irregular | Cierre continuo conforme a límites |
| T09-03 | Fill con curvas guía conectadas | Guías controlan forma |
| T09-04 | Fill con guía que no alcanza límite | Mensaje de conexión inválida |
| T09-05 | Fill con red desconectada | Error explicativo |
| T09-06 | Fill G0 | Coincidencia posicional |
| T09-07 | Fill G1 | Tangencia validada |
| T09-08 | Fill G2 | Curvatura validada o rechazo |
| T09-09 | Loft con 2 perfiles | Interpolación correcta |
| T09-10 | Loft con perfiles múltiples ordenados | Secciones conectadas en orden |
| T09-11 | Loft perfiles coplanares | Rechazo claro |
| T09-12 | Loft perfiles intersectados | Rechazo claro |
| T09-13 | Loft connection points modificados | Torsión cambia de forma predecible |
| T09-14 | Loft con guías válidas | Forma sigue guías |
| T09-15 | Loft guía no intersecta perfil | Error localizado |
| T09-16 | Periodic Loft | Transición de extremos suavizada |
| T09-17 | Loft Start/End G1/G2 | Continuidad comprobable |
| T09-18 | Loft auto-boolean Union | Un solo cuerpo unido cuando hay solapamiento |
| T09-19 | Loft auto-boolean Subtract | Volumen objetivo recortado |
| T09-20 | Loft auto-boolean Intersect | Volumen común |
| T09-21 | Fillet Radius | Radio correcto |
| T09-22 | Fillet Chordal | Ancho de cuerda correcto |
| T09-23 | Fillet Rolling Ball/Setback | Esquina conforme a modo |
| T09-24 | Fillet G1/G2 | Tangencia/curvatura verificables |
| T09-25 | Fillet Overflow Auto/Cliff/Smooth/Notch | Variantes coherentes |
| T09-26 | Fillet Y-shaped blend | Encuentro de tres ramas estable |
| T09-27 | Fillet radio excesivo | Rechazo sin corromper sólido |
| T09-28 | Chamfer Auto | Distancias iguales |
| T09-29 | Chamfer 2-distance | Distancias distintas exactas |
| T09-30 | Shell cara abierta | Carcasa y espesor válidos |
| T09-31 | Shell múltiples aperturas | Todas las caras seleccionadas retiradas |
| T09-32 | Shell espesor imposible | Diagnóstico de colapso/intersección |
| T09-33 | Boolean Union solapado | Cuerpo unido |
| T09-34 | Boolean Subtract All/Modified/Removed/None | Conservación correcta |
| T09-35 | Boolean Intersect sin volumen común | Resultado vacío identificado |
| T09-36 | Boolean contacto tangencial | No clasificar como solapamiento volumétrico |
| T09-37 | Boolean coplanar | Resultado estable o rechazo explicado |
| T09-38 | Boolean múltiples targets/tools | Resultado determinista |
| T09-39 | Split con plano sin contacto inicial | Corte proyectado correcto |
| T09-40 | Split con perfiles conectados/desconectados | Cortes combinados/separados según regla |
| T09-41 | Editar parámetro anterior | Regeneración de pasos posteriores |
| T09-42 | Fallo durante preview/commit | Rollback íntegro |
| T09-43 | Operación sobre B-rep importado válido | Resultado exacto o limitación explícita |
| T09-44 | Operación sobre STL/malla | No fingir resultado B-rep |

## 10. Prioridades para NOCTURNE

1. Robustez del kernel B-rep y diagnóstico de fallos.
2. Booleanos y Split Body con conservación de originales.
3. Fillet/Chamfer con parámetros completos y control de esquinas.
4. Shell con validación de espesor.
5. Loft con perfiles, guías, puntos de conexión y continuidad.
6. Fill como capacidad de superficies avanzadas; requiere mayor complejidad y debe entrar después de estabilizar curvas, referencias y kernel.
7. Auto-Boolean integrado en Sweep/Loft como mejora de flujo, sin duplicar lógica booleana.

No se debe prometer paridad visual de superficies libres hasta que el kernel soporte continuidad y regeneración de manera estable.

## 11. Fuentes oficiales
- Fill (Beta): https://support.shapr3d.com/hc/en-us/articles/30905483214364-Fill-Beta
- 26.190 — Fill y Auto-Boolean: https://support.shapr3d.com/hc/en-us/articles/27741981525148-26-190-Introducing-Fill-Tool-Beta
- Curve and surface continuity: https://support.shapr3d.com/hc/en-us/articles/31002288828060-Understanding-curve-and-surface-continuity
- Loft: https://support.shapr3d.com/hc/en-us/articles/7874427572508-Loft
- Chamfer/Fillet: https://support.shapr3d.com/hc/en-us/articles/7874402399900-Chamfer-Fillet
- Shell: https://support.shapr3d.com/hc/en-us/articles/7874427098268-Shell
- Union: https://support.shapr3d.com/hc/en-us/articles/7874427955996-Union
- Subtract: https://support.shapr3d.com/hc/en-us/articles/7874461913884-Subtract
- Intersect: https://support.shapr3d.com/hc/en-us/articles/7874455776668-Intersect
- Split Body: https://support.shapr3d.com/hc/en-us/articles/7874462683036-Split-Body
- Boolean operations: https://support.shapr3d.com/hc/en-us/articles/10565066254108-Boolean-operations
- History: https://support.shapr3d.com/hc/en-us/articles/11567903089180-History

---
**Estado:** Parte 09 documentada. Investigación y especificación; no se modificó código ni se generó APK/build.
