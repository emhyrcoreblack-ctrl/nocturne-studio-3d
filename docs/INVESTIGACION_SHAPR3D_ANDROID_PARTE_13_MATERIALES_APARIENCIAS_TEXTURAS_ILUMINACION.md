# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 13
## Materiales, apariencias, colores, texturas, iluminación y visualización

**Estado:** investigación y especificación funcional; no implementación.  
**Plataforma objetivo:** Android táctil.  
**Fecha:** 31 de octubre de 2026.

---

## 1. Objetivo y distinciones fundamentales

El sistema visual debe separar cuatro conceptos que a menudo se confunden:

1. **Material físico/asignación CAD:** representa propiedades del material real, por ejemplo densidad o datos de fabricación. No implica necesariamente una apariencia visual.
2. **Apariencia:** define cómo se ve una cara o cuerpo en pantalla: color, reflectancia, rugosidad, metalicidad, transparencia y mapa de textura.
3. **Textura:** imagen o patrón que aporta color, relieve aparente, rugosidad u otras propiedades espaciales.
4. **Iluminación/entorno:** determina cómo la luz interactúa con la apariencia. No cambia la geometría ni las propiedades físicas asignadas.

Una apariencia visual “acero” no debe asignar automáticamente densidad de acero. Del mismo modo, cambiar el color no debe alterar el material físico ni el historial CAD.

## 2. Asignación y alcance

Permitir aplicar apariencia a:
- cuerpo completo;
- cara individual;
- conjunto de caras;
- componente/instancia;
- proyecto o escena como fondo/entorno.

Reglas:
- la apariencia de cara puede sobrescribir temporalmente la del cuerpo;
- definir precedencia clara entre apariencia heredada y override;
- al eliminar override, restaurar apariencia heredada;
- duplicar un cuerpo debe definir si hereda apariencia o crea copia independiente;
- copiar/pegar y patrones deben conservar asignaciones;
- operaciones booleanas y caras nuevas deben tener política determinista de herencia;
- una cara dividida debe heredar apariencia según la región de origen, cuando sea posible;
- operaciones de reemplazo de cara deben documentar si mantienen apariencia anterior o heredan la nueva.

La asignación visual no debe depender del identificador efímero de una malla triangulada. Usar referencias persistentes de entidad y resolverlas tras regeneración topológica; si una cara desaparece, notificar la reasignación perdida.

## 3. Parámetros de apariencia

Modelo PBR recomendado para NOCTURNE:
- Base Color (color base);
- Metallic;
- Roughness;
- Specular/IOR cuando el pipeline lo permita;
- Opacity/Transparency;
- Emissive;
- Normal map;
- Height/Bump map;
- Ambient occlusion como efecto de presentación, no como propiedad física.

Definir rangos y defaults estables:
- metallic y roughness en [0,1];
- color en espacio de trabajo documentado;
- opacidad en [0,1], con comportamiento de transparencia explícito;
- evitar que valores no válidos generen materiales negros o NaN.

La interfaz debe ofrecer controles simples (color, acabado, transparencia) y controles avanzados PBR en un panel secundario.

## 4. Biblioteca de apariencias

Categorías sugeridas:
- metales: aluminio, acero, acero inoxidable, cobre, latón, oro;
- plásticos: ABS, PLA, policarbonato, acrílico;
- madera;
- vidrio y materiales transparentes;
- cerámica;
- goma;
- piedra y hormigón;
- pinturas y acabados;
- materiales neutros de modelado.

Cada preset visual debe mostrar miniatura, nombre y parámetros editables. Los presets son apariencias, no certificaciones de material real. Evitar afirmar propiedades físicas salvo que estén vinculadas a una ficha técnica independiente.

Permitir:
- favoritos;
- búsqueda y filtros;
- duplicar preset;
- guardar apariencia personalizada;
- importar/exportar biblioteca en formato abierto propio documentado;
- restaurar valores predeterminados.

## 5. Texturas e imágenes

### 5.1 Formatos de entrada

Priorizar formatos de imagen comunes y compatibles con Android:
- PNG;
- JPEG;
- WebP;
- TIFF si la librería de imagen elegida lo soporta;
- imágenes HDR/EXR solo si el pipeline y memoria del dispositivo lo justifican.

La importación debe validar MIME real, dimensiones, tamaño, canales y decodificación. No confiar únicamente en la extensión. Limitar dimensiones/memoria y mostrar error comprensible ante archivos dañados.

### 5.2 Canales de textura

- Base color/albedo;
- roughness;
- metallic;
- normal;
- height/bump;
- ambient occlusion;
- opacity/alpha;
- emissive.

Cada canal debe indicar el espacio de color esperado: mapas de color en sRGB; mapas de datos (roughness, normal, metallic, AO) en espacio lineal/no color, según pipeline. No aplicar corrección gamma dos veces.

### 5.3 UV y mapeado

Opciones:
- planar;
- box/triplanar si el renderer lo soporta;
- cilíndrico;
- esférico;
- UV existente/importado;
- escala, rotación y desplazamiento UV;
- repetición/tiling;
- ajuste a cara o cuerpo;
- orientación y continuidad entre caras.

Para CAD, ofrecer una proyección rápida sobre caras y permitir ajuste numérico. El mapeado no debe deformar la geometría. En cuerpos con topología cambiante, conservar coordenadas UV cuando sea posible y advertir si la regeneración rompe la correspondencia.

### 5.4 Transformación de textura

Controles:
- escala U/V;
- rotación;
- offset U/V;
- repetición;
- inversión horizontal/vertical;
- intensidad de bump/normal;
- mezcla con color base;
- vista previa en tiempo real;
- restablecer valores.

La UI debe distinguir “escala de textura” de escala geométrica del objeto.

## 6. Materiales importados

### 6.1 OBJ/MTL

- cargar geometría OBJ y referencias MTL;
- resolver rutas relativas con sandbox seguro;
- importar mapas diffuse, opacity, bump y otros campos reconocidos;
- informar mapas ausentes;
- mantener asignación por grupos/materiales cuando el archivo los contenga;
- permitir reemplazar rutas rotas mediante selector de archivos.

### 6.2 glTF/GLB

- importar materiales PBR, texturas, UV, nodos y transformaciones compatibles;
- respetar baseColorFactor/baseColorTexture, metallicRoughness, normal, occlusion y emissive;
- soportar alpha mode OPAQUE, MASK y BLEND según renderer;
- preservar jerarquía de nodos/instancias cuando el modelo de documento lo permita;
- documentar extensiones no soportadas y degradación controlada.

### 6.3 FBX, USD y 3MF

La compatibilidad depende de bibliotecas y variantes del formato:
- FBX: materiales y texturas pueden variar por versión/exportador; informar pérdidas.
- USD: conservar materiales/Shader networks compatibles cuando el parser lo permita; no prometer compatibilidad total con todos los shaders.
- 3MF: importar materiales/color por triángulo o componente cuando estén presentes y soportados.
- STEP/IGES: normalmente priorizar geometría y atributos disponibles; no asumir que contienen texturas PBR equivalentes a glTF.

Nunca descartar silenciosamente mapas o materiales. Mostrar un informe de importación: importado, convertido, omitido y motivo.

## 7. Entorno e iluminación

### 7.1 Iluminación de viewport

- iluminación basada en imagen (IBL) con entorno HDRI;
- luz ambiente/difusa;
- luces de apoyo o estudio;
- sombras suaves opcionales;
- oclusión ambiental de presentación;
- reflejos coherentes con roughness/metallic;
- exposición y balance visual ajustables.

Los entornos deben mejorar lectura de forma sin ocultar detalles. Ofrecer entornos neutros, estudio, exterior suave y alto contraste. El usuario puede ocultar el fondo HDRI y conservar su iluminación.

### 7.2 Separación de iluminación y fondo

Controlar independientemente:
- entorno de iluminación;
- fondo visible;
- suelo/plano de apoyo;
- sombras proyectadas;
- rejilla CAD;
- ejes y planos.

Cambiar fondo no debe cambiar iluminación salvo que el usuario seleccione explícitamente un preset combinado. La rejilla CAD debe seguir legible sobre distintos fondos.

### 7.3 Rendimiento Android

- limitar resolución de mapas según memoria GPU;
- mipmaps para reducir aliasing;
- compresión GPU cuando haya soporte;
- streaming/carga diferida de texturas;
- liberar recursos al cerrar documento;
- cachear materiales equivalentes;
- evitar duplicar texturas idénticas;
- permitir calidad visual adaptativa en equipos modestos;
- no bloquear UI durante decodificación/importación.

La degradación adaptativa debe preservar selección, silueta y legibilidad CAD antes que efectos decorativos.

## 8. Transparencia y selección

La transparencia complica profundidad y selección:
- ordenar objetos transparentes cuando el renderer lo permita;
- evitar que transparencia visual haga imposible seleccionar caras;
- ofrecer modo de selección independiente de alpha;
- permitir “mostrar como alámbrico” o transparencia temporal para inspección;
- indicar si una cara es seleccionable aunque se vea parcialmente transparente;
- evitar z-fighting en superficies coincidentes;
- no confundir transparencia de apariencia con ocultar cuerpo.

## 9. Vista de materiales y modos de visualización

Modos de viewport a considerar:
- sombreado neutro;
- sombreado con aristas;
- apariencia/materiales;
- alámbrico;
- líneas ocultas;
- transparente;
- visualización de análisis (curvatura, draft, espesor);
- vista de sección.

Cambiar modo de visualización no debe alterar asignaciones. La visualización de análisis debe tener prioridad visual y restaurar apariencias al salir.

## 10. Persistencia y archivos

Guardar en documento:
- referencias a imágenes y recursos;
- parámetros de apariencia;
- asignaciones cuerpo/cara/componente;
- UV y transformaciones;
- entorno seleccionado;
- modo de visualización;
- ajustes de transparencia.

Estrategia de empaquetado:
- recurso embebido para documento autocontenido, cuando tamaño lo permita;
- recurso externo gestionado con ruta relativa y copia en carpeta del proyecto;
- hashes para deduplicación;
- advertencia si se rompe un enlace externo;
- exportación con dependencias empaquetadas cuando el formato lo admita.

No guardar rutas absolutas del dispositivo como única referencia. Al compartir un proyecto, incluir recursos requeridos o producir un informe de dependencias faltantes.

## 11. Arquitectura propuesta

1. **AppearanceLibrary:** presets y favoritos.
2. **AppearanceAssignment:** asignación por cuerpo/cara/componente.
3. **PBRMaterial:** parámetros normalizados y validados.
4. **TextureAssetManager:** importación, validación, cache y liberación.
5. **UVMappingService:** proyección y transformación UV.
6. **MaterialImportAdapter:** adaptadores OBJ/MTL, glTF/GLB, FBX, USD y 3MF.
7. **EnvironmentLighting:** HDRI, luces y exposición.
8. **ViewportRenderModes:** shaded, edges, wireframe, transparent y analysis.
9. **ResourcePackager:** recursos embebidos/externos y dependencias.
10. **AppearanceTopologyResolver:** mantener/reasignar overrides tras operaciones CAD.
11. **RenderQualityController:** presupuesto GPU/memoria y degradación adaptativa.

El kernel CAD no debe depender del renderer ni de texturas. Las apariencias referencian entidades del modelo, pero no alteran topología. La capa de importación traduce materiales a un modelo interno explícito y registra pérdidas.

## 12. Matriz de pruebas

| ID | Prueba | Resultado esperado |
|---|---|---|
| MAT-01 | Asignar color a cuerpo | Todo el cuerpo adopta apariencia |
| MAT-02 | Asignar apariencia a cara | Solo la cara cambia |
| MAT-03 | Quitar override de cara | Hereda apariencia del cuerpo |
| MAT-04 | Duplicar cuerpo | Política de herencia coherente |
| MAT-05 | Booleano crea caras nuevas | Apariencia heredada según regla documentada |
| MAT-06 | Fillet modifica topología | Overrides válidos se conservan o notifican |
| MAT-07 | Cambiar apariencia | No altera geometría ni historial |
| MAT-08 | Metallic/roughness extremos | Render estable sin artefactos |
| MAT-09 | Transparencia | Selección sigue siendo posible |
| TEX-01 | Importar PNG/JPEG/WebP | Decodifica y muestra miniatura |
| TEX-02 | Imagen corrupta | Error comprensible, sin caída |
| TEX-03 | Imagen enorme | Límite de memoria y aviso |
| TEX-04 | Mapa normal | Interpretación correcta de canal |
| TEX-05 | Mapa roughness | Se trata como dato lineal |
| TEX-06 | Ajustar UV escala/rotación | Textura cambia, geometría no |
| TEX-07 | Proyección planar | Orientación y escala coherentes |
| TEX-08 | Cambiar textura | Recurso anterior se libera |
| IMP-01 | OBJ con MTL | Materiales y mapas se resuelven |
| IMP-02 | MTL con ruta rota | Informa y permite relocalizar |
| IMP-03 | GLB PBR | Canales compatibles se preservan |
| IMP-04 | GLB alpha MASK/BLEND | Transparencia coherente |
| IMP-05 | 3MF con colores | Colores soportados se conservan |
| IMP-06 | STEP sin texturas | No inventa materiales PBR |
| IMP-07 | Exportar GLB | Apariencias y UV compatibles se incluyen |
| IMP-08 | Exportar OBJ/MTL | Archivos de material y mapas enlazados |
| LGT-01 | Cambiar HDRI | Cambia iluminación, no geometría |
| LGT-02 | Cambiar fondo solamente | Iluminación se conserva |
| LGT-03 | Desactivar sombras | Mejora rendimiento sin cambiar material |
| LGT-04 | Entorno de alto contraste | Silueta y selección legibles |
| LGT-05 | Equipo Android con poca memoria | Calidad adaptativa sin bloqueo |
| DOC-01 | Guardar y reabrir documento | Apariencias y recursos persisten |
| DOC-02 | Mover carpeta de proyecto | Recursos relativos se resuelven |
| DOC-03 | Falta recurso externo | Aviso claro y relocalización |
| DOC-04 | Compartir proyecto | Dependencias incluidas o listadas |
| DOC-05 | Cerrar documento | Recursos GPU liberados |

## 13. Criterios de terminado

- Material físico y apariencia visual están separados.
- Apariencia por cuerpo y cara tiene precedencia y herencia definidas.
- Importación de texturas valida contenido, tamaño y memoria.
- UV permite escala, rotación y desplazamiento.
- Importadores informan compatibilidad y pérdidas.
- Iluminación, fondo, rejilla y suelo se controlan por separado.
- Los modos de visualización no alteran asignaciones.
- Recursos persisten y viajan con el documento.
- El pipeline funciona en Android con memoria limitada.
- Pruebas cubren topología cambiante, importación y exportación.

## 14. Fuentes públicas y certeza

- Shapr3D Help Center: https://support.shapr3d.com/hc/en-us
- Shapr3D: materiales y apariencias (búsqueda del centro de ayuda): https://support.shapr3d.com/hc/en-us/search?query=materials%20appearances
- Shapr3D: importar imágenes/texturas (búsqueda): https://support.shapr3d.com/hc/en-us/search?query=texture%20image
- Shapr3D: importar/exportar formatos (búsqueda): https://support.shapr3d.com/hc/en-us/search?query=import%20export%20formats
- Khronos glTF 2.0 specification: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

**Certeza:** el modelo PBR, gestión UV, recursos y estrategia de rendimiento son recomendaciones de ingeniería para NOCTURNE. Las capacidades concretas de apariencias/materiales de Shapr3D pueden variar por versión, plataforma y formato. No se afirma paridad de cada canal o shader sin validación en la versión de referencia. La compatibilidad de formatos debe probarse con archivos reales y registrar pérdidas.
