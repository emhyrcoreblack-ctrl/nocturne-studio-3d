# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 21
## Evaluación comparativa de kernels y bibliotecas geométricas para Android

**Estado:** investigación comparativa y recomendación preliminar; no es implementación ni selección contractual definitiva.  
**Fecha de corte:** 31 de octubre de 2026.  
**Plataforma objetivo:** Android ARM64.  
**Objetivo:** identificar una base geométrica realista para sólidos CAD, superficies, operaciones booleanas, importación/exportación y futura edición paramétrica.

## 1. Resumen ejecutivo

La recomendación para el primer prototipo de NOCTURNE es **evaluar Open CASCADE Technology (OCCT) como candidato principal de kernel B-rep**, encapsulado detrás de una API propia. La razón decisiva es que su documentación oficial declara certificación actual para Android ARM64 y describe capacidades de modelado de superficies/sólidos e intercambio CAD. Esto reduce un riesgo técnico importante, pero no demuestra todavía rendimiento suficiente en teléfonos ni calidad comparable a un kernel comercial de primera línea. [1][2]

**Parasolid** merece una evaluación comercial paralela porque Siemens identifica a Shapr3D entre los productos CAD que licencian Parasolid. Es una referencia industrial relevante, pero la información pública consultada no basta para concluir que exista un SDK licenciable directamente para nuestro caso Android, ni conocer costes, condiciones o soporte concreto. Se requiere contacto comercial y una prueba de viabilidad. [3]

**CGAL** es una biblioteca de algoritmos geométricos valiosa para tareas especializadas, pero no debe tratarse como sustituto directo de un kernel CAD B-rep completo. Su licencia es por componentes: hay paquetes LGPL y GPL, además de licencias comerciales. Debe seleccionarse paquete por paquete. [4][5]

**libfive** utiliza representación funcional/implícita y es atractiva para modelado procedural, CSG y formas orgánicas, pero no sustituye por sí sola el flujo B-rep tradicional requerido para edición de caras/aristas, topología CAD y STEP. Podría ser un módulo complementario futuro. [6]

**Decisión propuesta:** no casarse todavía con ningún proveedor. Crear un adaptador de kernel y un prototipo Android ARM64 que compare OCCT con una opción comercial si se obtiene acceso. No integrar CGAL o libfive como kernel general sin casos de uso delimitados.

## 2. Requisitos de evaluación

### 2.1 Requisitos obligatorios
- Sólidos B-rep y topología consistente.
- Curvas y superficies paramétricas, incluyendo NURBS.
- Extrude, Revolve, Sweep, Loft.
- Boolean Union, Subtract e Intersect.
- Fillet, Chamfer, Shell, Offset y Split.
- Intersecciones, proyecciones, consultas de distancia y propiedades.
- Importación/exportación STEP; IGES deseable.
- Teselación controlable para viewport y exportación.
- Diagnóstico y reparación de geometría importada.
- Compilación e integración Android ARM64 mediante NDK/C++.
- Ejecución fuera del hilo UI y cancelación cuando sea viable.
- Licencia compatible con la distribución y modelo de negocio previsto.

### 2.2 Requisitos deseables
- Mapeo de topología entre versiones de una operación.
- Modelado de superficies avanzado y continuidad.
- Robustez con geometría degenerada y casi tangente.
- Soporte de ensamblajes o estructuras de instancias.
- Herramientas de inspección, depuración y validación.
- Documentación, ejemplos y soporte mantenido.
- ABI estable o política clara de compatibilidad.
- Buen comportamiento en dispositivos de memoria limitada.

### 2.3 No confundir
- **Kernel geométrico:** crea y modifica geometría exacta.
- **Biblioteca de algoritmos:** resuelve problemas geométricos concretos.
- **Motor de mallas:** procesa triángulos/polígonos.
- **Renderer:** dibuja escena y materiales.
- **Sistema paramétrico:** almacena intención, dependencias e historial.

Ninguna biblioteca individual tiene que resolver todas estas capas.

## 3. Candidato A — Open CASCADE Technology (OCCT)

### Capacidades y encaje
OCCT es una plataforma de desarrollo para modelado de superficies y sólidos 3D, intercambio de datos CAD y visualización. La documentación oficial actual incluye Android ARM64 entre las plataformas certificadas y menciona Android NDK con Clang. [1][2]

Encaje esperado:
- Kernel B-rep generalista.
- Curvas y superficies.
- Operaciones de modelado y topología.
- Intercambio de formatos CAD.
- Teselación y utilidades de visualización.
- C++ nativo adecuado para integración mediante JNI/NDK.

### Ventajas
1. Android ARM64 aparece explícitamente en la matriz oficial de plataformas certificadas.
2. Código fuente disponible y ecosistema conocido en aplicaciones CAD/CAM/CAE.
3. Amplio conjunto de módulos geométricos y de intercambio.
4. Permite construir una capa de dominio propia sin depender de una API comercial cerrada.
5. Puede prototiparse y auditarse técnicamente antes de comprometer el producto.

### Riesgos y límites
1. La certificación de plataforma no equivale a rendimiento validado en los teléfonos objetivo.
2. Robustez de fillet, shell y booleanos debe medirse con corpus propio; no asumir que todos los casos difíciles funcionarán.
3. La arquitectura, API y curva de aprendizaje pueden ser complejas.
4. El tamaño binario, dependencias y consumo de memoria deben medirse en Android.
5. Persistencia paramétrica de la aplicación no viene resuelta por usar OCCT: NOCTURNE debe implementar historial y dependencias.
6. Las referencias topológicas estables tras cambios de diseño requieren estrategia propia y pruebas.

### Licencia
La documentación oficial indica LGPL 2.1 con excepción especial y también ofrece una licencia comercial. Para aplicaciones propietarias distribuidas en tiendas, la propia documentación advierte obligaciones de LGPL, incluyendo avisos, disponibilidad de fuentes correspondientes y posibilidad efectiva de sustituir la biblioteca por una versión modificada. Debe hacerse una revisión legal de la forma concreta de enlazado, empaquetado y distribución Android antes de publicar. [2]

### Veredicto
**Candidato principal para prototipo.** No declarar seleccionado para producción hasta superar pruebas funcionales, de rendimiento, compatibilidad y licencia.

## 4. Candidato B — Parasolid (Siemens)

### Evidencia y encaje
Siemens presenta Parasolid como tecnología de modelado geométrico 3D utilizada en CAD y nombra a Shapr3D entre los productos CAD que lo licencian. También describe uso en aplicaciones cloud y capacidades de modelado avanzado. [3]

Esto lo convierte en una referencia comercial importante para evaluar calidad y capacidades de un kernel industrial.

### Ventajas potenciales
- Kernel industrial ampliamente adoptado.
- Relevancia directa como referencia tecnológica del mercado CAD.
- Posibilidad de reducir desarrollo de algoritmos geométricos si se obtiene licencia y soporte adecuados.
- Potencial para operaciones B-rep avanzadas y flujos profesionales.

### Incógnitas que bloquean decisión
La página pública consultada no resuelve:
- Disponibilidad y términos del SDK para una aplicación Android ARM64 independiente.
- Precio, mínimos, royalties o condiciones de distribución.
- Restricciones de uso offline/móvil.
- Compatibilidad exacta con NDK/toolchain Android.
- Acceso a ejemplos, soporte y depuración.
- Derechos de redistribución y gestión de licencias en app distribuida.

No inferir que porque Shapr3D use Parasolid, NOCTURNE puede obtener las mismas condiciones ni que la integración sea equivalente.

### Veredicto
**Candidato comercial de comparación**, condicionado a conversación con Siemens y documentación contractual. Si Android y coste/licencia no encajan, se descarta sin bloquear el proyecto.

## 5. Candidato C — CGAL

### Naturaleza
CGAL es una biblioteca de algoritmos de geometría computacional. Su catálogo incluye kernels geométricos, triangulaciones, estructuras espaciales, operaciones booleanas sobre polígonos y poliedros, procesamiento de nubes de puntos, generación de mallas y algoritmos relacionados. [4]

### Ventajas
- Algoritmos geométricos robustos para problemas específicos.
- Útil para procesamiento de mallas, consultas espaciales, triangulación y geometría computacional.
- Puede complementar un kernel B-rep.
- Catálogo amplio y documentación por paquete.

### Limitaciones para NOCTURNE
- No debe asumirse que proporciona una experiencia CAD paramétrica completa.
- Booleanos de polígonos/poliedros no equivalen automáticamente a booleanos B-rep de sólidos con superficies NURBS.
- No sustituye por sí sola historial de features, sketch solver, persistencia o intercambio CAD completo.
- La licencia cambia por paquete.

### Licencias
La documentación CGAL explica un esquema dual con paquetes bajo GPL, LGPL y opciones comerciales; la página de licencia y la ficha de cada paquete deben revisarse antes de integrar cualquier módulo. Algunos paquetes GPL pueden imponer obligaciones incompatibles con una app propietaria si se distribuyen sin licencia comercial. [4][5]

### Veredicto
**Biblioteca complementaria**, no kernel principal. Seleccionar únicamente paquetes que resuelvan una necesidad medida y cuya licencia esté aprobada.

## 6. Candidato D — libfive

### Naturaleza
libfive es un kernel de modelado basado en representaciones funcionales/implícitas, con CSG y formas definidas mediante funciones. El proyecto lo presenta como infraestructura para modelado procedural y diseño generativo; distingue el kernel/core de la aplicación Studio. [6]

### Ventajas potenciales
- CSG y composición de formas implícitas.
- Modelado procedural y generativo.
- Operaciones de deformación/blending que pueden ser atractivas para formas orgánicas.
- Capa de kernel desacoplada de su aplicación de escritorio.
- Núcleo bajo MPL según la información del proyecto.

### Limitaciones
- No es sustituto directo de un kernel B-rep tradicional.
- Edición semántica de caras y aristas CAD no es su modelo natural.
- Flujo STEP/NURBS e interoperabilidad de sólidos B-rep no deben darse por supuestos.
- Convertir resultados implícitos a malla puede perder la semántica CAD exacta.

### Veredicto
**Posible módulo futuro de modelado implícito/procedural**, fuera del alcance del primer kernel de sólidos paramétricos.

## 7. Comparación cualitativa

| Criterio | OCCT | Parasolid | CGAL | libfive |
|---|---|---|---|---|
| Kernel B-rep CAD general | Sí, candidato directo | Sí, tecnología comercial de modelado | No como solución integral | No, representación implícita |
| Android ARM64 documentado oficialmente | Sí, documentación actual | Pendiente de confirmación contractual/técnica | Requiere validación por paquetes/toolchain | Requiere prototipo de compilación |
| STEP/IGES como flujo CAD | Capacidad de intercambio integrada; probar alcance | Validar módulos/licencia | No es su función integral | No es flujo B-rep principal |
| Booleanos | B-rep; probar robustez | B-rep comercial; evaluar acceso | Polígonos/poliedros según paquete | CSG implícito |
| Fillet/Shell CAD | Evaluar implementación y casos límite | Candidato de comparación | No asumir equivalencia | No equivalente a fillet B-rep |
| Mallas y geometría computacional | Soporte de teselación/geom. | Depende de módulos | Muy fuerte en algoritmos específicos | Conversión/representación implícita |
| Historial paramétrico de app | NOCTURNE lo construye | NOCTURNE lo construye | NOCTURNE lo construye | NOCTURNE lo construye |
| Licencia | LGPL con excepción o comercial | Comercial propietaria | Por paquete: LGPL/GPL/comercial | MPL para kernel/core; GPL para Studio |
| Papel recomendado | Prototipo principal | Evaluación comercial | Complemento | Complemento especializado |

La tabla es una preselección arquitectónica, no un benchmark ni certificación de equivalencia funcional.

## 8. Recomendación de arquitectura para NOCTURNE

### 8.1 Kernel Adapter obligatorio
Diseñar una API interna neutral que evite que el resto de la aplicación dependa directamente de clases OCCT o de otro proveedor.

Responsabilidades:
- Crear y destruir cuerpos.
- Ejecutar operaciones feature.
- Consultar geometría y topología.
- Validar sólidos.
- Tessellar.
- Importar/exportar.
- Traducir errores a diagnósticos de dominio.
- Administrar snapshots y cancelación donde el proveedor lo permita.

### 8.2 No filtrar tipos del proveedor
Los módulos paramétrico, UI, selección, persistencia y render no deben guardar objetos propietarios del kernel como modelo persistente. Mantener handles de ejecución dentro del adaptador y usar IDs de dominio fuera de él.

### 8.3 Modelo híbrido
- B-rep como representación de sólidos CAD nativos.
- Sketch solver independiente.
- Mallas como representación de archivos poligonales y caché de render derivada.
- CGAL solo para algoritmos concretos aprobados.
- libfive solo si se decide añadir modelado implícito/procedural.
- Renderer independiente del proveedor de kernel.

## 9. Protocolo de benchmark Android ARM64

No elegir por demos visuales. Usar un conjunto fijo de pruebas y publicar resultados.

### Dispositivos
- Un teléfono Android de gama media.
- Un teléfono Android de gama alta.
- Una tableta Android.
- Registrar SoC, RAM, versión Android, ABI, NDK y temperatura ambiente.

### Modelos de prueba
1. Prisma simple.
2. Cilindro con agujero.
3. Cuerpo con múltiples cavidades.
4. Fillets pequeños y grandes.
5. Caras tangentes/casi tangentes.
6. Loft con perfiles múltiples.
7. Sweep con trayectoria curva.
8. Sólido STEP importado de tamaño medio.
9. Ensamblaje con múltiples cuerpos/instancias.
10. Malla STL densa como caso de render y conversión.

### Operaciones cronometradas
- Import STEP.
- Extrude.
- Revolve.
- Boolean Union/Subtract/Intersect.
- Fillet.
- Chamfer.
- Shell.
- Split.
- Tessellation en tres calidades.
- Export STEP y STL.
- Validación B-rep.
- Cancelación de operación larga.

### Métricas
- Tiempo mediano y percentil 95.
- Pico de memoria residente.
- Tamaño de librerías empaquetadas.
- Tiempo de inicio/carga.
- Latencia de preview.
- Tasa de fallos y resultados inválidos.
- Determinismo entre ejecuciones.
- Consumo térmico/energético cuando sea medible.
- Recuperación tras cancelación o interrupción.

No establecer umbrales de rendimiento sin medir primero hardware objetivo y complejidad de modelos realistas.

## 10. Prueba de concepto por etapas

**POC-1: integración nativa**
- Crear módulo C++ Android ARM64.
- Compilar el candidato.
- Invocarlo desde Kotlin/Java mediante JNI.
- Confirmar que la UI permanece independiente.

**POC-2: geometría mínima**
- Crear caja, cilindro y sketch sencillo.
- Extruir y revolucionar.
- Consultar volumen, área y bounding box.
- Tessellar y mostrar en viewport.

**POC-3: operaciones críticas**
- Booleanos.
- Fillet y chamfer.
- Shell y offset.
- Sweep y loft.
- Registrar fallos y reproducibilidad.

**POC-4: intercambio**
- Importar STEP.
- Exportar STEP.
- Importar STL.
- Exportar STL.
- Comprobar unidades, sólidos y desviación de teselación.

**POC-5: robustez**
- Geometría degenerada.
- Escalas extremas.
- Operaciones canceladas.
- Memoria baja y recreación de contexto gráfico.
- Regresión de resultados.

**POC-6: licencia y distribución**
- Inventario de dependencias transitivas.
- Licencias de cada módulo.
- Obligaciones de avisos y fuentes.
- Forma de enlazado y sustitución de librería.
- Revisión legal antes de distribuir APK.

## 11. Matriz de pruebas de aceptación

| ID | Prueba | Resultado esperado |
|---|---|---|
| KER21-001 | Compilar OCCT para Android ARM64 | Biblioteca y dependencias construyen |
| KER21-002 | Invocar kernel desde JNI | Sin bloqueo del hilo UI |
| KER21-003 | Crear caja | Sólido válido |
| KER21-004 | Extruir perfil cerrado | Sólido válido |
| KER21-005 | Revolucionar perfil | Sólido válido |
| KER21-006 | Boolean Union | Topología válida |
| KER21-007 | Boolean Subtract | Volumen coherente |
| KER21-008 | Boolean Intersect sin intersección | Resultado vacío/controlado |
| KER21-009 | Fillet | Éxito o error recuperable |
| KER21-010 | Chamfer | Resultado válido o error recuperable |
| KER21-011 | Shell | Espesor válido o diagnóstico |
| KER21-012 | Sweep | Resultado y orientación correctos |
| KER21-013 | Loft | Resultado válido y correspondencia definida |
| KER21-014 | Import STEP | Unidades y cuerpos identificados |
| KER21-015 | Export STEP | Reapertura geométricamente equivalente |
| KER21-016 | Import STL | Malla preservada sin fingir B-rep |
| KER21-017 | Tessellation adaptativa | Error dentro de tolerancia |
| KER21-018 | Booleanos casi tangentes | Validez comprobada o fallo controlado |
| KER21-019 | Modelo a escala extrema | Sin corrupción por tolerancias |
| KER21-020 | Cancelar operación larga | No publica resultado parcial |
| KER21-021 | Ejecutar kernel en background | UI permanece receptiva |
| KER21-022 | Pérdida de contexto GPU | Recursos visuales reconstruibles |
| KER21-023 | Memoria baja | Fallo controlado y documento íntegro |
| KER21-024 | Repetir operación | Resultado reproducible dentro de tolerancia |
| KER21-025 | Inspección de licencias | Inventario completo aprobado |
| KER21-026 | Empaquetar APK de prueba | ABI y dependencias correctas |
| KER21-027 | Comparar kernel alternativo | Benchmark reproducible |
| KER21-028 | Sustituir backend de kernel | Dominio/UI no requieren reescritura |

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Kernel compila pero es lento en móvil | Benchmark temprano en ARM64 real |
| Booleanos/fillets fallan en casos límite | Corpus de regresión y política de error |
| Licencia incompatible con distribución | Revisión jurídica antes de integrar |
| API del proveedor invade la app | Kernel Adapter y tipos de dominio propios |
| Topological naming inestable | Referencias semánticas y resolución con ambigüedad explícita |
| Memoria excesiva | Medición, liberación de cachés y límites de escena |
| Pérdida de UI por cálculo síncrono | Jobs asíncronos y snapshots |
| Importación no conserva semántica | Informe de importación y pruebas STEP |
| Dependencia abandonada | Evaluar mantenimiento y plan de salida |

## 13. Decisión provisional

1. **OCCT:** avanzar a POC Android ARM64 como candidato principal.
2. **Parasolid:** solicitar información técnica/comercial para comparativa; no depender de su disponibilidad.
3. **CGAL:** reservar para algoritmos geométricos concretos con revisión de licencia por paquete.
4. **libfive:** reservar para un posible módulo implícito/procedural, no para el núcleo B-rep inicial.

Esta decisión no autoriza todavía a integrar el kernel en la aplicación principal. La aprobación requiere resultados del benchmark, compatibilidad Android, revisión de licencia y pruebas de operaciones CAD críticas.

## 14. Fuentes consultadas

[1] Open CASCADE Technology, documentación oficial de introducción y requisitos de plataforma: https://www.occt3d.com/dev/doc/overview/html/index.html  
[2] Open CASCADE Technology, README y licencia oficial: https://github.com/Open-Cascade-SAS/OCCT  
[3] Siemens, Parasolid 3D Geometric Modeling: https://www.siemens.com/en-us/products/plm-components/parasolid/  
[4] CGAL, sitio oficial y capacidades: https://www.cgal.org/  
[5] CGAL, manual oficial de licencias: https://doc.cgal.org/latest/Manual/license.html  
[6] libfive, descripción del kernel y licencias: https://libfive.com/

Las fuentes describen productos y licencias en términos generales. Antes de tomar una decisión de distribución, revisar la versión exacta, archivos LICENSE incluidos, dependencias transitivas y condiciones vigentes con los titulares.

---

**Conclusión:** OCCT es el punto de partida técnicamente más verificable para un prototipo Android ARM64, no una garantía de éxito final. Parasolid es la comparación comercial prioritaria; CGAL y libfive tienen papeles complementarios. La decisión se cerrará con pruebas en dispositivos reales y revisión de licencias, no por marketing ni por semejanza con otra aplicación.
