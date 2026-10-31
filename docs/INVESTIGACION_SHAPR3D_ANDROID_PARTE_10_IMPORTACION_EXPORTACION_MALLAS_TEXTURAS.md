# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 10
## Importación, edición de archivos importados y exportación CAD
**Fecha:** 31 de octubre de 2026  
**Objetivo:** Android. **Referencia:** documentación pública oficial de Shapr3D.

> Esta parte define una estrategia de compatibilidad para NOCTURNE. Las capacidades descritas de Shapr3D no deben confundirse con soporte universal de todos los formatos o con edición B-rep automática de cualquier malla.

## 1. Principio: importar no equivale a editar

Un archivo importado puede contener geometría de naturaleza distinta:
- Sólido/superficie CAD B-rep (por ejemplo STEP, IGES, X_T).
- Malla poligonal (STL, OBJ, 3MF según flujo).
- Escena con objetos, jerarquía, materiales y UV (OBJ/3MF y formatos de escena compatibles).
- Imagen de referencia (PNG/JPG u otros formatos admitidos).
- Datos de fabricación o impresión 3D.

NOCTURNE debe inspeccionar el contenido real del archivo después de importarlo, no deducirlo solo por la extensión. Debe conservar el original y crear una representación interna con unidades, jerarquía, materiales, transformaciones y tipo geométrico explícitos.

## 2. Importación documentada de Shapr3D

La documentación oficial describe importación de formatos CAD y malla, imágenes y proyectos nativos. Los formatos admitidos y las posibilidades dependen de plataforma, versión y licencia; se debe consultar la matriz oficial vigente antes de cerrar compatibilidad exacta.

### 2.1 Formatos CAD
- **STEP (.step, .stp):** formato neutral de intercambio de sólidos/superficies CAD. Suele transportar geometría B-rep, no necesariamente el historial paramétrico original.
- **IGES (.iges, .igs):** intercambio de curvas/superficies y, según archivo, sólidos; a menudo exige reparación o cosido.
- **Parasolid (.x_t, .x_b):** geometría exacta del kernel Parasolid; compatibilidad y versión importable/exportable dependen del software.
- **DWG/DXF:** datos 2D/planos y geometría de dibujo; no equivalen a un sólido 3D por sí mismos.
- **Formatos nativos de Shapr3D:** contienen proyecto e historial propios; no asumir que un tercero puede leerlos completamente.

### 2.2 Mallas y formatos de fabricación
- **STL:** triángulos, normalmente sin color/material/UV; puede ser ASCII o binario.
- **OBJ:** malla con índices de vértices, normales, coordenadas UV y referencias a materiales MTL; admite múltiples objetos/grupos.
- **3MF:** paquete basado en ZIP con modelo XML y recursos; puede transportar unidades, componentes, colores/materiales y datos de fabricación.
- **PLY:** malla con cabecera que declara propiedades; puede incluir color por vértice y normales.
- **GLB/ glTF:** escena con nodos, transformaciones, mallas, materiales, texturas y animaciones; no es un formato CAD B-rep.
- **USD/USDZ:** escena/representación 3D con jerarquía, materiales y recursos; soporte de importación debe definirse por versión y librerías.
- **FBX:** formato de escena/intercambio con mallas, materiales, jerarquía y animación; no debe confundirse con CAD paramétrico.

No afirmar que todos estos formatos son compatibles con Shapr3D en cada plataforma. Para NOCTURNE, la lista es una propuesta de formatos objetivo por fases.

### 2.3 Imágenes de referencia
Imágenes raster pueden insertarse como referencia para calcar/dibujar o asignarse como textura según el flujo de la aplicación. Mantener separadas estas dos funciones:
- Imagen de referencia 2D colocada en plano/espacio.
- Textura/material aplicada a superficie de una malla o modelo.

## 3. Qué puede editarse después de importar

### 3.1 B-rep CAD
Un STEP/IGES/X_T puede contener cuerpos sólidos o superficies exactas. Si se importa como B-rep:
- Seleccionar cuerpo, cara, arista y vértice.
- Aplicar operaciones compatibles: Move/Rotate, Scale, Align, Mirror, Boolean, Split, Shell, Fillet/Chamfer, Offset Face/Edge, Replace Face, etc., sujeto a validez geométrica.
- Usar caras/aristas importadas como referencias para sketches y planos.
- No se recupera automáticamente el árbol de operaciones paramétricas original del CAD de origen, salvo que el archivo/flujo contenga información específica que el importador soporte.
- Las operaciones nuevas sí deben entrar en el historial de NOCTURNE.

La topología importada requiere identificadores estables internos. Los IDs de cara/arista pueden cambiar si una operación anterior reconstruye el sólido; implementar referencias persistentes y detección de referencias perdidas.

### 3.2 Malla STL/OBJ/PLY/3MF
Una malla no contiene superficies analíticas B-rep. Se puede:
- Mover, rotar, escalar, alinear, duplicar y reflejar.
- Agrupar/ocultar/renombrar.
- Cambiar materiales/texturas si el formato y UV lo permiten.
- Reparar aspectos de malla: normales, triángulos degenerados, componentes desconectados, agujeros y no-manifold (con límites).
- Seccionar/recortar o dividir triángulos mediante herramientas específicas de malla.
- Medir dimensiones, área y volumen aproximado (si es cerrada y orientable).

No prometer que seleccionar una cara triangular de STL habilita automáticamente Fillet CAD, Shell B-rep, Replace Face o Offset Face exactos. Para esas herramientas hace falta conversión/reconstrucción a B-rep o una operación de malla equivalente claramente identificada.

### 3.3 Conversión malla → B-rep
La conversión de malla a superficies exactas no es una operación mágica:
- Una conversión faceteada crea una cara B-rep por triángulo, a menudo demasiado pesada y poco editable.
- La reconstrucción analítica/NURBS necesita detectar planos, cilindros, conos, radios y superficies libres; es costosa y puede alterar tolerancias.
- Debe ser explícita, ofrecer estimación de complejidad, tolerancia y advertencia de pérdida/approximation.
- Conservar la malla original como respaldo y permitir comparar antes/después.
- No etiquetar como “sólido editable” un conjunto de triángulos convertido sin explicar su naturaleza.

## 4. Unidades, escala y coordenadas

Importación debe resolver:
- Unidad declarada en archivo.
- Unidad de proyecto.
- Factor de conversión.
- Ejes/up-axis y handedness.
- Origen y transformaciones de nodos.
- Precisión/tolerancia del archivo.
- Bounding box y dimensiones resultantes.

Si unidad está ausente o ambigua, preguntar o mostrar una elección explícita (mm, cm, m, in, ft), con vista previa de dimensiones. No asumir milímetros silenciosamente. Conservar la transformación de importación como metadato editable y registrar la conversión en historial.

## 5. Materiales, UV y texturas

### 5.1 OBJ + MTL
- Malla y objetos/grupos.
- Coordenadas UV por vértice/cara.
- Normales.
- Materiales nombrados en MTL.
- Mapas de textura referenciados mediante rutas externas.

El importador debe resolver rutas relativas, nombres con espacios, archivos ausentes y rutas no confiables. Empaquetar recursos al proyecto para que no se rompan al moverlo.

### 5.2 3MF
Puede incluir colores, materiales y componentes; leer el paquete con validación ZIP/XML y rutas internas seguras. Preservar unidades y transformaciones de componentes.

### 5.3 glTF/GLB
Materiales PBR, texturas, sampler, UV, nodos, instancias y transformaciones de escena. Si se incorpora soporte, conservar baseColor, metallic, roughness, normal, occlusion y emissive cuando estén disponibles; documentar extensiones no soportadas.

### 5.4 Texturas en NOCTURNE
La opción “subir texturas” debe permitir:
- Importar PNG/JPG/WebP y, según soporte, mapas HDR/EXR.
- Crear material nuevo o reemplazar mapa de material existente.
- Asignar por objeto o por cara cuando el modelo soporte materiales por grupo/cara.
- Ajustar escala, rotación, offset UV, repetición y orientación.
- Seleccionar canal (base color, roughness, metallic, normal, opacity, emissive).
- Vista previa, revertir y guardar recursos dentro del proyecto.
- Gestionar color space: sRGB para color base/emissive y lineal para datos como roughness/normal/metallic.
- Advertir cuando la malla no tenga UVs y ofrecer proyección planar/box/triplanar si se implementa.

No tratar una imagen de referencia de sketch como textura de material.

## 6. Exportación

### 6.1 STEP
Preferido para intercambiar sólidos/superficies CAD exactas con otros CAD. Exportar B-rep, no triangulación, cuando exista. Definir AP schema y tolerancias soportadas; conservar nombres de cuerpos si el traductor lo permite.

### 6.2 IGES
Útil para curvas/superficies; puede no preservar sólido robusto ni atributos. Validar superficies abiertas/cosido.

### 6.3 Parasolid X_T/X_B
Intercambio exacto con ecosistema Parasolid. Debe utilizarse un traductor/kernel con licencia y compatibilidad de versión adecuada; no escribir un exportador casero que afirme compatibilidad completa.

### 6.4 STL
Exportación de malla triangulada para fabricación. Configurar tolerancia de desviación angular/lineal, resolución, unidad y binario/ASCII. Verificar watertightness cuando se solicite impresión 3D.

### 6.5 OBJ
Exportar geometría, normales, UV y MTL/texturas, manteniendo objetos/grupos y materiales. Resolver rutas de textura y empaquetar todos los archivos necesarios.

### 6.6 3MF
Preferible a STL cuando se necesita unidad, color, materiales y componentes para fabricación aditiva. Validar el paquete y recursos.

### 6.7 glTF/GLB
Para visualización/render/AR y escenas con materiales PBR, no para intercambio de historial CAD.

### 6.8 Política de exportación
Antes de exportar, mostrar qué se preserva y qué se pierde: sólidos exactos, mallas, colores, materiales, texturas, nombres, jerarquía, unidades, construcción, historial y metadatos. No prometer que STEP/IGES/Parasolid conservan historial de features de NOCTURNE.

## 7. Gestión del proyecto y archivos importados

- Proyecto nativo debe almacenar geometría fuente, transformaciones, materiales, texturas y operaciones añadidas.
- Guardar el archivo importado original como asset inmutable, con hash y metadatos.
- Cada entidad derivada referencia al asset y a su transformación/conversión.
- Evitar modificar el archivo fuente al editar.
- Recursos externos se copian al paquete del proyecto, con opción de relink.
- Árbol de objetos distingue CAD Body, Mesh, Image Reference, Construction Geometry y Material.
- Propiedades de importación accesibles para revisar unidad, eje, escala y calidad.

## 8. Flujo UX Android recomendado

1. Importar desde almacenamiento/selector del sistema.
2. Analizar archivo y mostrar nombre, formato detectado, tipo de geometría, unidad y dimensiones.
3. Si falta unidad, preguntar antes de insertar.
4. Mostrar preview y opciones de importación (unir/separar objetos, preservar jerarquía, materiales).
5. Importar sin bloquear UI; progreso y cancelación.
6. Insertar en árbol y viewport; encuadrar selección solo si el usuario lo acepta o la vista está vacía.
7. Mantener cámara y zoom actuales cuando se importa un elemento adicional.
8. Mostrar inspector de objeto con tipo (B-rep/malla/imagen), unidad, polígonos/caras y materiales.
9. Habilitar comandos según capacidades reales del tipo geométrico.
10. Exportar con selector de formato y panel de opciones contextual.

**Importante para el problema de zoom del proyecto:** importar o seleccionar un objeto no debe provocar zoom automático inesperado. El encuadre debe ser una acción explícita “Zoom to Fit/Encuadrar”, con opción de encuadrar selección, todo el modelo o geometría visible. Al importar adicionalmente, preservar cámara por defecto.

## 9. Matriz de pruebas Parte 10

| ID | Caso | Resultado esperado |
|---|---|---|
| T10-01 | STEP sólido único | B-rep válido y unidad correcta |
| T10-02 | STEP varios cuerpos | Jerarquía/nombres conservados cuando existan |
| T10-03 | STEP superficies abiertas | Importación clasifica superficie, no sólido |
| T10-04 | IGES curvas y superficies | Tipos reconocidos y diagnóstico |
| T10-05 | X_T de versión compatible | B-rep válido |
| T10-06 | STL binario | Malla correcta |
| T10-07 | STL ASCII | Malla correcta |
| T10-08 | STL sin unidad | Elección explícita y preview dimensional |
| T10-09 | OBJ + MTL + texturas | Materiales y UV enlazados |
| T10-10 | OBJ con varios grupos | Objetos separados/jerarquía |
| T10-11 | 3MF con colores y componentes | Recursos preservados |
| T10-12 | GLB con PBR | Nodos, materiales y texturas |
| T10-13 | Archivo corrupto/truncado | Error seguro, no crash |
| T10-14 | Archivo enorme | Progreso, cancelación y memoria controlada |
| T10-15 | Rutas MTL ausentes | Aviso y relink |
| T10-16 | Textura con espacio en nombre | Ruta resuelta correctamente |
| T10-17 | UV ausente | Aviso y opción de proyección |
| T10-18 | Malla con normales invertidas | Diagnóstico/reparación opcional |
| T10-19 | Malla no-manifold | Clasificación y límites claros |
| T10-20 | Malla con componentes desconectados | Separación/agrupación configurable |
| T10-21 | Mover/rotar/escalar STL | Transformación preserva malla |
| T10-22 | Boolean CAD sobre STEP | Solo si B-rep válido |
| T10-23 | Fillet CAD sobre STL | No ofrecer como B-rep nativo |
| T10-24 | Conversión faceteada mesh→B-rep | Aviso de número de caras/limitación |
| T10-25 | Importar segundo archivo | Cámara/zoom actual preservados |
| T10-26 | Zoom to Fit explícito | Encuadre solicitado, no automático |
| T10-27 | Exportar STEP | Geometría exacta, sin prometer historial |
| T10-28 | Exportar STL | Unidad y tolerancia correctas |
| T10-29 | Exportar OBJ + MTL | Texturas/UV empaquetadas |
| T10-30 | Exportar 3MF | Unidades/materiales/componentes |
| T10-31 | Exportar GLB | Escena y PBR |
| T10-32 | Reabrir proyecto con texturas | Recursos sin enlaces rotos |
| T10-33 | Relink de textura | Material se actualiza |
| T10-34 | Guardar proyecto tras editar importado | Asset original intacto |
| T10-35 | Undo importación | Elementos importados retirados sin perder fuente |
| T10-36 | Importar imagen de referencia | No se confunde con material |
| T10-37 | Conversión unidades mm/in | Dimensiones equivalentes |
| T10-38 | Eje Z/Y arriba | Orientación explícita y corregible |

## 10. Fases recomendadas de compatibilidad

**Fase A — esencial CAD:** STEP, STL; importación B-rep y malla diferenciadas; unidades; Move/Rotate/Scale; export STL/STEP según kernel.

**Fase B — intercambio amplio:** IGES, X_T/X_B, OBJ/MTL, 3MF; jerarquía, UV y materiales básicos.

**Fase C — visualización:** GLB/glTF, PBR, texturas, mapas normal/roughness/metallic, recursos empaquetados.

**Fase D — reparación/conversión:** diagnóstico de mallas, reparación, separación de componentes y reconstrucción explícita malla→B-rep.

La prioridad exacta de X_T depende de kernel/licencia; STEP debe ser el primer formato CAD neutral.

## 11. Decisiones de producto que quedan fijadas para NOCTURNE

1. Los archivos importados deben poder seleccionarse, moverse, rotarse, escalarse, duplicarse y ocultarse.
2. STL no será tratado como sólido B-rep automáticamente.
3. Las herramientas disponibles dependen del tipo de geometría y se explicará por qué una operación no está disponible.
4. Texturas serán recursos del proyecto, no referencias externas frágiles.
5. Importar un archivo adicional no cambiará el zoom/cámara automáticamente.
6. Zoom to Fit será comando explícito.
7. El archivo original importado se conserva sin alteraciones.
8. STEP es prioridad de intercambio CAD; STL prioridad de fabricación; OBJ/3MF y GLB se incorporan por fases.

## 12. Fuentes oficiales y estándares
- Shapr3D — Import: https://support.shapr3d.com/hc/en-us/sections/7874348753436-Import
- Shapr3D — Export: https://support.shapr3d.com/hc/en-us/sections/7874352316316-Export
- Shapr3D — Supported file formats: https://support.shapr3d.com/hc/en-us/articles/7874367520412-Supported-file-formats
- Shapr3D — Importing files: https://support.shapr3d.com/hc/en-us/articles/7874367503004-Importing-files
- Shapr3D — Exporting files: https://support.shapr3d.com/hc/en-us/articles/7874367577244-Exporting-files
- Library of Congress — STEP: https://www.loc.gov/preservation/digital/formats/fdd/fdd000448.shtml
- Library of Congress — STL: https://www.loc.gov/preservation/digital/formats/fdd/fdd000504.shtml
- Library of Congress — OBJ: https://www.loc.gov/preservation/digital/formats/fdd/fdd000507.shtml
- 3MF Consortium: https://3mf.io/
- Khronos glTF: https://www.khronos.org/gltf/

---
**Estado:** Parte 10 documentada. Investigación y especificación; no se modificó código ni se generó APK/build.
