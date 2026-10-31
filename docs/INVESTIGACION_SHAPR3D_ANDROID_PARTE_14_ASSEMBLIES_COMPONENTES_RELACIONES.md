# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 14
## Ensamblajes, componentes, jerarquías, relaciones y movimiento mecánico

**Estado:** investigación y especificación funcional; no implementación.  
**Plataforma objetivo:** Android táctil.  
**Fecha:** 31 de octubre de 2026.

---

## 1. Alcance y honestidad de paridad

Esta parte define la gestión de conjuntos de piezas y componentes, instancias, jerarquía, transformaciones relativas y relaciones mecánicas. Es importante distinguir capacidades nativas de Shapr3D de requisitos generales de un CAD paramétrico: la disponibilidad y profundidad de herramientas de ensamblaje pueden variar según producto, versión y plataforma. No se debe afirmar que todas las articulaciones y simulaciones descritas son funciones confirmadas de Shapr3D sin validarlas en la versión de referencia.

NOCTURNE debe diseñarse para admitir ensamblajes paramétricos robustos, pero la paridad observable con Shapr3D se documentará por separado de las capacidades adicionales de arquitectura que se decida construir.

## 2. Modelo de documento: cuerpos, componentes e instancias

Distinguir entidades:
- **Body:** geometría topológica individual.
- **Part/Part definition:** definición reutilizable de una pieza, con uno o más cuerpos y propiedades asociadas.
- **Component/Instance:** colocación de una definición de pieza dentro de un ensamblaje, con transformación propia.
- **Assembly:** raíz de una jerarquía de componentes.
- **Subassembly:** ensamblaje que puede reutilizarse como componente de otro.
- **Occurrence:** aparición concreta de una definición dentro de la jerarquía.

No confundir duplicar geometría con crear una instancia vinculada. Deben existir acciones claras:
- duplicar independiente;
- crear instancia vinculada;
- convertir instancia en independiente;
- reemplazar definición manteniendo colocación;
- editar definición de pieza;
- editar una instancia/ocurrencia sin alterar otras.

## 3. Jerarquía y administrador de componentes

El árbol debe mostrar:
- ensamblaje raíz;
- subensamblajes;
- componentes/instancias;
- cuerpos contenidos;
- geometría de construcción;
- estados de visibilidad, supresión y bloqueo.

Operaciones:
- crear ensamblaje;
- insertar pieza existente;
- importar pieza;
- crear componente desde selección;
- agrupar/desagrupar según semántica;
- mover componente en jerarquía;
- renombrar;
- duplicar;
- reemplazar;
- suprimir/activar;
- ocultar/mostrar;
- aislar;
- expandir/contraer árbol.

Reglas:
- mover un componente de padre cambia su transformación relativa sin romper la transformación mundial, salvo que el usuario elija otra opción;
- evitar ciclos jerárquicos;
- detectar referencias externas rotas;
- mantener IDs estables de definición y ocurrencia;
- cambios en una definición vinculada actualizan todas sus instancias;
- cambios locales de ocurrencia se limitan a esa ocurrencia y se marcan como override.

## 4. Transformaciones y sistemas de coordenadas

Cada ocurrencia posee transformación rígida (traslación + rotación) relativa al padre. Escala no uniforme en instancias debe tratarse con cautela porque puede invalidar supuestos CAD, normales y relaciones.

- mostrar posición XYZ y rotación;
- permitir mover/rotar con gizmo;
- introducir valores exactos;
- bloquear ejes y grados de libertad;
- alinear origen, caras, ejes o sistemas de coordenadas;
- fijar componente al espacio del ensamblaje;
- restaurar posición inicial;
- mostrar transformación local y global;
- soportar jerarquías anidadas.

Composición de transformaciones:
T_global(ocurrencia) = T_global(padre) × T_local(ocurrencia).
Cambiar el padre o reordenar árbol debe conservar T_global si se solicita preservar colocación.

## 5. Relaciones y restricciones de ensamblaje

Las relaciones deben definirse entre referencias geométricas estables: caras, ejes, puntos, planos, sistemas de coordenadas o conectores de ensamblaje.

Relaciones típicas a especificar para NOCTURNE:
- **Fixed/Rigid:** bloquea todos los grados de libertad relativos.
- **Fastened:** une rígidamente dos conectores.
- **Slider/Prismatic:** permite traslación en un eje.
- **Revolute/Hinge:** permite rotación alrededor de un eje.
- **Cylindrical:** permite traslación y rotación coaxiales.
- **Pin-slot:** movimiento de un punto/conector dentro de una ranura.
- **Planar:** permite movimiento dentro de un plano y rotación normal, según definición.
- **Ball/Spherical:** permite rotación alrededor de un centro.
- **Parallel:** mantiene ejes o planos paralelos.
- **Perpendicular:** mantiene ángulo recto.
- **Concentric/Coaxial:** alinea ejes.
- **Distance/Angle:** mantiene valor dimensional entre referencias.

Cada relación debe indicar:
- referencias seleccionadas;
- ejes y conectores usados;
- grados de libertad eliminados y restantes;
- offset/ángulo;
- estado resuelto, redundante, conflictivo o suprimido;
- prioridad y posibilidad de invertir orientación.

No permitir que una relación se aplique ambiguamente sin mostrar qué referencias se usarán.

## 6. Grados de libertad y solver

Un componente rígido libre en 3D tiene seis grados de libertad: tres traslacionales y tres rotacionales. Las relaciones eliminan o acoplan grados de libertad. El sistema debe:
- mostrar DOF restantes por componente y ensamblaje;
- identificar componentes totalmente restringidos;
- permitir fijar temporalmente un componente base;
- detectar redundancia;
- detectar conflictos;
- evitar resolver mediante saltos arbitrarios;
- mantener la solución previa cuando una nueva relación falla;
- ofrecer supresión temporal de relación;
- mostrar diagnóstico de relaciones implicadas.

El solver debe ser incremental y estable. Si el usuario crea una relación incompatible, no mover piezas de manera inesperada ni descartar restricciones anteriores silenciosamente.

## 7. Conectores de ensamblaje

Un conector representa un sistema local de coordenadas en una pieza:
- origen;
- eje principal;
- orientación secundaria;
- normal;
- referencias geométricas que lo definen.

Permitir crear conector desde:
- centro/eje de cilindro;
- centro de esfera;
- centroide de cara plana;
- vértice;
- sistema de coordenadas explícito;
- punto y dirección seleccionados.

Los conectores facilitan relaciones robustas incluso si cambia la teselación. Si la topología cambia y una referencia se pierde, marcar conector como inválido y pedir reparación; no engancharlo a otra cara por proximidad sin confirmación.

## 8. Movimiento y manipulación de ensamblajes

Modos:
- mover componente libre;
- arrastrar con relaciones activas;
- arrastre de prueba (sin cambiar posición guardada);
- conducir articulación mediante parámetro;
- animar movimiento;
- explotar/retraer conjunto.

El arrastre debe respetar relaciones. Para una articulación revoluta, arrastrar genera rotación alrededor del eje; para slider, traslación axial. Componentes fijos no deben moverse accidentalmente.

Añadir límites:
- mínimo/máximo angular;
- mínimo/máximo lineal;
- topes;
- posición de referencia;
- valor actual y unidades.

## 9. Detección de colisiones e interferencias

En ensamblajes:
- detectar colisión entre pares seleccionados o todo el conjunto;
- distinguir contacto, separación e intersección;
- mostrar volumen de interferencia cuando sea calculable;
- excluir pares deliberadamente en contacto mediante configuración;
- actualizar detección durante arrastre o simulación con frecuencia controlada;
- ofrecer modo preciso bajo demanda y modo aproximado en tiempo real.

No resolver colisiones moviendo piezas automáticamente salvo que exista una función explícita de análisis/solver. El resultado no modifica geometría ni relaciones.

## 10. Exploded View y documentación del conjunto

Exploded View:
- separar componentes por vectores y distancias;
- crear pasos de explosión;
- ordenar secuencia;
- guardar varias vistas;
- animar explosión/reensamblaje;
- conservar posición original del ensamblaje;
- líneas de trayectoria opcionales.

Las transformaciones de explosión son una representación documental, no cambios en restricciones ni colocación nominal. Permitir exportar imágenes/vistas y, si se implementa, instrucciones de montaje.

## 11. BOM y propiedades

Lista de materiales:
- número de ítem;
- nombre/número de pieza;
- cantidad;
- material asignado;
- masa si densidad/material está definido;
- revisión;
- proveedor/código opcional;
- referencia de componente.

Agrupar instancias de la misma definición, con opción de separar por configuración o revisión. No calcular masa si falta densidad. Los overrides de instancia deben aparecer de forma explícita.

## 12. Importación y exportación de ensamblajes

Investigar/soportar por adaptadores y pruebas:
- STEP AP214/AP242 con estructura y nombres cuando existan;
- IGES principalmente geometría, con limitaciones de ensamblaje;
- Parasolid X_T/X_B según SDK disponible;
- glTF/GLB para jerarquía visual, mallas, materiales y animación, no equivalencia completa de restricciones CAD;
- 3MF para piezas/mallas y atributos compatibles;
- formatos nativos de proyecto con jerarquía, IDs, constraints, instancias y referencias.

Al importar:
- preservar jerarquía, nombres, transformaciones y colores cuando el formato los contenga;
- detectar instancias repetidas y evitar duplicar definiciones innecesariamente;
- presentar informe de pérdidas;
- no convertir una estructura de ensamblaje en una sola malla sin consentimiento.

Al exportar:
- permitir exportar ensamblaje completo o componentes elegidos;
- conservar jerarquía y transformaciones en formatos que lo soporten;
- explicar que GLB no preserva necesariamente restricciones CAD paramétricas;
- incluir dependencias y unidades.

## 13. Persistencia, versiones y referencias

Guardar:
- definiciones de piezas;
- ocurrencias e IDs;
- jerarquía;
- transformaciones locales;
- relaciones y conectores;
- parámetros de articulación;
- límites;
- estados de supresión;
- configuraciones;
- vistas explotadas;
- BOM;
- referencias externas y versión de origen.

Una actualización de definición debe mostrar qué ocurrencias cambiarán. Permitir congelar o desvincular una referencia. Evitar referencias circulares entre archivos.

## 14. Arquitectura propuesta

1. **AssemblyDocument:** raíz, configuración y jerarquía.
2. **PartDefinition:** geometría y propiedades compartidas.
3. **ComponentOccurrence:** instancia, transformación y overrides.
4. **AssemblyTreeService:** operaciones jerárquicas.
5. **ConnectorService:** sistemas de coordenadas locales.
6. **MateDefinition:** relaciones y parámetros.
7. **AssemblySolver:** grados de libertad, solución y diagnóstico.
8. **JointDriver:** conducción de articulaciones.
9. **CollisionAnalyzer:** broad phase/narrow phase.
10. **ExplodedViewService:** pasos y trayectorias de explosión.
11. **BOMGenerator:** cantidades y propiedades.
12. **AssemblyImportExport:** adaptadores de formato.
13. **ReferenceResolver:** vínculos y referencias topológicas.
14. **AssemblyUndoRedo:** historial transaccional de operaciones del conjunto.

Separar definición de pieza de ocurrencia. El kernel B-rep resuelve geometría; el solver de ensamblaje resuelve transformaciones/restricciones. El renderer solo presenta estados. Las operaciones de ensamblaje deben ser transaccionales y reversibles.

## 15. Matriz de pruebas de aceptación

| ID | Prueba | Resultado esperado |
|---|---|---|
| ASM-01 | Crear ensamblaje raíz | Árbol válido |
| ASM-02 | Insertar pieza existente | Crea ocurrencia referenciada |
| ASM-03 | Insertar dos instancias de misma pieza | Comparten definición, transformaciones separadas |
| ASM-04 | Editar definición vinculada | Actualiza instancias vinculadas |
| ASM-05 | Desvincular una instancia | Ediciones posteriores son independientes |
| ASM-06 | Reordenar componente de padre | Conserva posición global si se solicita |
| ASM-07 | Intentar ciclo jerárquico | Rechaza operación y explica |
| ASM-08 | Ocultar/mostrar componente | No cambia relaciones |
| ASM-09 | Suprimir/activar componente | Relaciones se conservan o diagnostican |
| ASM-10 | Guardar y reabrir conjunto | Jerarquía e IDs persisten |
| TRN-01 | Transformación local/global | Composición correcta |
| TRN-02 | Fijar componente base | Seis DOF eliminados |
| MAT-01 | Crear relación fija | Sin movimiento relativo |
| MAT-02 | Crear revoluta | Un DOF rotacional |
| MAT-03 | Crear slider | Un DOF traslacional |
| MAT-04 | Crear cilíndrica | DOF axial esperados |
| MAT-05 | Relación coaxial | Ejes coincidentes |
| MAT-06 | Relación distancia/ángulo | Parámetro exacto |
| MAT-07 | Relación contradictoria | Diagnóstico; conserva solución previa |
| MAT-08 | Relación redundante | Identifica redundancia |
| MAT-09 | Suprimir relación | DOF se actualizan |
| MAT-10 | Cambiar offset | Solver mantiene continuidad |
| MAT-11 | Referencia topológica perdida | Marca mate inválido, no reasigna silenciosamente |
| JNT-01 | Conducir revoluta | Rotación alrededor del eje |
| JNT-02 | Conducir slider | Traslación axial |
| JNT-03 | Superar límite | Respeta topes |
| JNT-04 | Arrastrar pieza fija | No se mueve |
| COL-01 | Componentes separados | Sin interferencia |
| COL-02 | Componentes solapados | Detecta colisión |
| COL-03 | Componentes en contacto | Clasifica contacto |
| COL-04 | Análisis durante arrastre | Actualización estable |
| EXP-01 | Crear paso de explosión | Posición nominal se conserva |
| EXP-02 | Reproducir explosión | Secuencia reversible |
| BOM-01 | Instancias repetidas | Cantidad agrupada correcta |
| BOM-02 | Material/densidad ausente | Masa no inventada |
| IO-01 | Importar STEP ensamblado | Conserva jerarquía disponible |
| IO-02 | Importar GLB | Conserva nodos y transformaciones compatibles |
| IO-03 | Exportar GLB | No promete mates CAD |
| IO-04 | Exportar formato nativo | Conserva restricciones y referencias |
| IO-05 | Archivo con referencias rotas | Informe y reparación explícita |

## 16. Criterios de terminado

- Definición de pieza e instancia están separadas.
- Jerarquía anidada evita ciclos y conserva transformaciones.
- Relaciones declaran DOF y referencias.
- Solver diagnostica conflicto y redundancia sin saltos.
- Conectores usan referencias estables.
- Arrastre respeta articulaciones y componentes fijos.
- Colisiones se analizan sin alterar conjunto.
- Exploded View no modifica posición nominal.
- BOM no inventa masa ni propiedades.
- Importación/exportación documenta pérdidas y preserva jerarquía disponible.
- El conjunto puede guardarse, reabrirse y editarse sin perder IDs.

## 17. Fuentes y certeza

- Shapr3D Help Center: https://support.shapr3d.com/hc/en-us
- Shapr3D assemblies (búsqueda en centro de ayuda): https://support.shapr3d.com/hc/en-us/search?query=assemblies
- Shapr3D components (búsqueda): https://support.shapr3d.com/hc/en-us/search?query=components
- Shapr3D STEP import/export (búsqueda): https://support.shapr3d.com/hc/en-us/search?query=STEP%20assembly
- Documentación de formatos y estándares debe contrastarse con la especificación oficial de cada formato antes de implementar.

**Nota de certeza:** el modelo de componentes, mates, articulaciones, solver, BOM y explosiones es una especificación CAD general para NOCTURNE. No se afirma que todos estos comandos estén disponibles en Shapr3D. Antes de usar esta parte como checklist de paridad, cada función debe clasificarse como confirmada, parcial, ausente o no verificable en la versión concreta de Shapr3D. La prioridad sigue siendo reproducir fielmente lo que sea observable en el producto de referencia, sin atribuirle capacidades no verificadas.
