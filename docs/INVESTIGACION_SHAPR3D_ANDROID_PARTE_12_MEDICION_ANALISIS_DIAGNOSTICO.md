# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 12
## Medición, análisis geométrico y diagnóstico

**Estado:** investigación y especificación funcional; no implementación.  
**Plataforma objetivo:** Android táctil.  
**Referencia funcional:** documentación pública de Shapr3D y principios CAD geométricos.  
**Fecha:** 31 de octubre de 2026.

---

## 1. Alcance y principio de diseño

Este bloque cubre medición interactiva, propiedades de entidades, análisis de geometría y herramientas de diagnóstico. Debe distinguirse entre:
- **medición**: consulta que no modifica el modelo;
- **análisis**: cálculo derivado de geometría existente;
- **diagnóstico**: detección de problemas o condiciones geométricas;
- **edición**: operación paramétrica que sí modifica geometría y pertenece al historial.

Toda medición debe ser reproducible, mostrar unidades y precisión, y referenciar entidades CAD estables. No se debe calcular una cota a partir de píxeles de pantalla ni de una malla de render si existe geometría analítica/B-rep disponible.

## 2. Herramienta Measure

### 2.1 Entidades de entrada

Permitir seleccionar:
- punto/vértice;
- arista recta o curva;
- cara plana o curva;
- eje o plano de construcción;
- dos entidades compatibles;
- cuerpo/sólido para propiedades globales.

El panel de medición debe cambiar según selección y mostrar únicamente magnitudes válidas. Para dos entidades, presentar distancia mínima, distancia proyectada cuando proceda, ángulo y relación geométrica (paralelo, perpendicular, coincidente, tangente, intersección).

### 2.2 Mediciones de punto y arista

- Punto: coordenadas X/Y/Z en el sistema de referencia activo.
- Arista lineal: longitud, vector dirección, extremos y orientación.
- Arco/círculo: radio, diámetro, longitud de arco, ángulo barrido, centro y normal.
- Curva spline: longitud numérica aproximada con tolerancia explícita; no fingir exactitud analítica.
- Borde elíptico: semiejes, centro, orientación y longitud calculada numéricamente.
- Arista cerrada: perímetro; distinguirlo de área encerrada.

La longitud de una curva debe converger con tolerancia configurada y ser estable al cambiar nivel de detalle de render.

### 2.3 Mediciones de cara

- Cara plana: área, normal, perímetro de contorno y centroide.
- Cara cilíndrica: radio, diámetro, eje y longitud axial si está definida.
- Cara cónica: ángulo, eje y parámetros de cono.
- Cara esférica: radio y centro.
- Cara toroidal: radios mayor/menor y eje.
- Cara libre: área por integración/teselación con tolerancia y método identificados.

En caras con agujeros, el área debe restar contornos internos. Mostrar área total y, si es útil, áreas de regiones por separado.

### 2.4 Dos entidades

Casos:
- punto–punto: distancia euclídea y delta X/Y/Z;
- punto–línea: distancia perpendicular y proyección;
- punto–plano: distancia normal con signo y proyección;
- línea–línea: distancia mínima, ángulo, paralelismo, intersección o coplanaridad;
- línea–plano: ángulo e intersección;
- plano–plano: ángulo, paralelismo y distancia si son paralelos;
- cara–cara: separación mínima, ángulo entre normales locales y condición de contacto;
- círculo–círculo: radios, centros, distancia entre centros y relación geométrica.

No presentar una única “distancia” ambigua cuando hay varias definiciones posibles. Etiquetar distancia mínima, perpendicular, horizontal/vertical o proyectada.

## 3. Unidades, precisión y sistemas de coordenadas

- Unidades lineales: mm, cm, m, in, ft.
- Área: mm², cm², m², in², ft².
- Volumen: mm³, cm³, m³, in³, ft³.
- Ángulos: grados y, opcionalmente, radianes.
- Mostrar unidades del documento y permitir conversión de presentación sin cambiar valores internos.
- Guardar valores internos en unidades coherentes (por ejemplo, metros o milímetros) con tolerancia geométrica separada.
- Formatear precisión configurable; no confundir dígitos mostrados con exactitud del kernel.
- Mostrar coordenadas en sistema global o local de entidad/transformación.
- Indicar el sistema de referencia utilizado.
- Las expresiones y variables deben poder copiarse cuando sea pertinente.

## 4. Propiedades de cuerpo y sólido

Para un sólido cerrado válido:
- volumen;
- área superficial;
- centro de masa/centroide geométrico;
- caja envolvente alineada a ejes globales;
- dimensiones X/Y/Z;
- número de sólidos/cuerpos componentes;
- estado de validez/topología;
- densidad y masa solo si el usuario asigna material con densidad.

Diferenciar centroide geométrico de centro de masa. Sin densidad/material, no llamar “masa” al volumen ni asumir densidad. Para cuerpos compuestos, mostrar total y desglose por componente.

Para superficies abiertas o mallas no-manifold, indicar que volumen/masa no están definidos o son aproximaciones, no producir un número engañoso.

## 5. Análisis de geometría y relaciones

### 5.1 Análisis de continuidad

Cuando se comparan superficies o curvas:
- G0: posición coincidente;
- G1: continuidad tangencial;
- G2: continuidad de curvatura;
- informar tolerancia y zona evaluada;
- diferenciar continuidad matemática exacta de continuidad aproximada dentro de tolerancia.

### 5.2 Curvatura y radios

- inspección de radio local en aristas curvas;
- análisis de curvatura de superficies;
- mapa de curvatura con escala/leyenda;
- detectar radios inferiores a tolerancia o a restricciones de fabricación;
- evitar mapas dependientes de teselación de pantalla.

### 5.3 Draft / ángulo de desmoldeo

Analizar caras respecto de una dirección de extracción:
- seleccionar eje/dirección;
- definir ángulo mínimo;
- clasificar caras positivas, negativas y por debajo del mínimo;
- mostrar mapa de colores y leyenda;
- permitir invertir dirección;
- ignorar o clasificar aparte caras paralelas a dirección de extracción.

El análisis no debe alterar geometría. Resultado debe poder actualizarse al editar el modelo.

### 5.4 Thickness / espesor

Analizar espesor entre superficies opuestas:
- valor mínimo, máximo y mapa de distribución;
- detectar zonas demasiado delgadas;
- tolerancia y resolución configurables;
- diferenciar espesor real de distancia aproximada por muestreo;
- advertir en zonas con geometría compleja o ambigüedad de correspondencia.

### 5.5 Interferencias y separación

Comprobar:
- colisión/intersección entre cuerpos;
- contacto tangente;
- separación mínima;
- penetración y volumen de interferencia cuando sea calculable;
- pares de cuerpos involucrados.

Distinguir contacto exacto, intersección volumétrica y proximidad dentro de tolerancia. El test de interferencia no debe unir ni sustraer cuerpos.

## 6. Diagnóstico de topología y geometría

Para B-rep:
- sólido cerrado (watertight);
- shells abiertos/cerrados;
- caras y aristas degeneradas;
- aristas no-manifold;
- vértices no-manifold;
- auto-intersecciones;
- normales inconsistentes;
- gaps entre caras;
- tolerancias fuera de rango;
- superficies pequeñas o sliver faces;
- geometría inválida o no orientable.

Para mallas:
- agujeros;
- bordes abiertos;
- caras duplicadas;
- vértices duplicados;
- normales invertidas/inconsistentes;
- triángulos degenerados;
- auto-intersecciones (si el algoritmo lo soporta);
- componentes desconectados;
- non-manifold edges;
- volumen firmado y orientación.

Cada incidencia debe ofrecer:
- severidad;
- entidad o región afectada;
- descripción legible;
- causa probable cuando sea conocida;
- sugerencia segura de reparación;
- opción de aislar/resaltar el problema.

Nunca reparar silenciosamente. Una reparación debe ser una acción explícita, previsualizable, reversible y registrada en historial cuando cambie geometría.

## 7. Diagnóstico de Sketch

- perfiles abiertos donde se requiere contorno cerrado;
- segmentos duplicados o superpuestos;
- extremos casi coincidentes;
- auto-intersecciones;
- bucles múltiples;
- restricciones contradictorias o redundantes;
- grados de libertad restantes;
- entidades fuera del plano;
- contornos pequeños o degenerados;
- región no seleccionable por perfil inválido.

El sistema debe señalar la entidad exacta y evitar un mensaje genérico como “Sketch inválido”. Cuando el solver tenga conflicto, presentar restricciones implicadas sin eliminar ninguna automáticamente.

## 8. Análisis de fabricación

Herramientas de revisión, si el alcance de referencia/plataforma las incluye:
- ángulo de desmoldeo;
- espesor mínimo;
- radios internos;
- interferencias;
- accesibilidad visual de regiones;
- comprobación de geometría para impresión 3D (malla cerrada, normales, componentes);
- orientación y caja envolvente para preparación de fabricación.

No afirmar que una pieza es fabricable en general. Mostrar reglas concretas y parámetros elegidos; la fabricabilidad depende del proceso y material.

## 9. Resultados y UI

- Panel de resultados contextual y plegable.
- Valores con unidad, precisión y sistema de referencia.
- Copiar valor y copiar tabla.
- Resaltar entidad al tocar un resultado.
- Mantener el resultado asociado a referencias estables del modelo.
- Si una edición invalida una referencia, marcar resultado obsoleto y recalcular o pedir nueva selección.
- Leyenda para mapas de colores, escala numérica y rangos.
- No depender exclusivamente del color para comunicar severidad.
- En Android, permitir panel bajo demanda y objetivos táctiles amplios; el viewport debe conservar el máximo espacio posible.

## 10. Arquitectura propuesta

1. **MeasurementService:** cálculos de distancia, longitud, ángulo, área y volumen.
2. **UnitFormatter:** unidades, precisión y formato.
3. **ReferenceFrameService:** transformaciones global/local.
4. **GeometryProperties:** propiedades de caras, curvas, cuerpos y mallas.
5. **TopologyValidator:** diagnóstico B-rep y malla.
6. **SketchValidator:** perfiles, bucles y autointersecciones.
7. **ContinuityAnalyzer:** G0/G1/G2.
8. **CurvatureAnalyzer:** curvatura y radios.
9. **DraftAnalyzer:** análisis de desmoldeo.
10. **ThicknessAnalyzer:** espesor.
11. **InterferenceAnalyzer:** colisión, contacto y separación.
12. **AnalysisResultStore:** resultados vinculados a versión del modelo.
13. **IssueHighlighter:** selección/aislamiento de problemas.
14. **RepairPreview:** propuestas de reparación no destructivas hasta confirmar.

El kernel geométrico debe proporcionar consultas exactas cuando sea posible. Algoritmos de malla son fallback y deben marcar resultados aproximados. Las operaciones de análisis se ejecutan fuera del hilo de UI, con cancelación y progreso para modelos grandes.

## 11. Matriz de pruebas de aceptación

| ID | Prueba | Resultado esperado |
|---|---|---|
| MEA-01 | Medir distancia punto-punto | Distancia y delta XYZ correctos |
| MEA-02 | Medir punto-línea | Distancia perpendicular y proyección |
| MEA-03 | Medir punto-plano | Distancia con signo y pie de proyección |
| MEA-04 | Medir arista recta | Longitud exacta dentro de tolerancia |
| MEA-05 | Medir arco | Radio, centro, ángulo y longitud |
| MEA-06 | Medir spline | Longitud convergente con tolerancia declarada |
| MEA-07 | Medir cara plana con agujero | Área neta correcta |
| MEA-08 | Medir cara cilíndrica | Radio/eje correctos |
| MEA-09 | Medir dos líneas paralelas | Distancia y paralelismo |
| MEA-10 | Medir líneas que se cruzan | Intersección y ángulo |
| MEA-11 | Medir planos paralelos | Distancia normal |
| MEA-12 | Cambiar mm a pulgadas | Conversión de presentación correcta |
| MEA-13 | Cambiar precisión visual | No altera valor interno |
| MEA-14 | Leer coordenadas locales | Transformación correcta |
| MEA-15 | Propiedades de sólido | Volumen, área y centroide correctos |
| MEA-16 | Sólido sin material | No muestra masa ficticia |
| MEA-17 | Superficie abierta | No presenta volumen como válido |
| ANA-01 | Continuidad G0 | Detecta coincidencia posicional |
| ANA-02 | Continuidad G1 | Detecta tangencia |
| ANA-03 | Continuidad G2 | Evalúa continuidad de curvatura |
| ANA-04 | Mapa de curvatura | Leyenda y valores coherentes |
| ANA-05 | Draft con dirección invertida | Clasificación se invierte correctamente |
| ANA-06 | Espesor uniforme | Rango estable |
| ANA-07 | Espesor variable | Detecta mínimo local |
| ANA-08 | Dos cuerpos separados | No reporta interferencia |
| ANA-09 | Dos cuerpos en contacto | Clasifica contacto |
| ANA-10 | Dos cuerpos solapados | Detecta intersección |
| DIA-01 | B-rep cerrado | Valida sólido |
| DIA-02 | Shell abierto | Reporta apertura |
| DIA-03 | Arista no-manifold | Señala entidad |
| DIA-04 | Cara degenerada | Reporta problema |
| DIA-05 | Malla con agujero | Detecta borde abierto |
| DIA-06 | Malla con normales invertidas | Identifica orientación |
| DIA-07 | Malla con triángulos degenerados | Reporta elementos |
| DIA-08 | Malla con componentes desconectados | Lista componentes |
| DIA-09 | Sketch abierto | Señala extremos |
| DIA-10 | Sketch auto-intersectado | Señala región/intersección |
| DIA-11 | Restricciones conflictivas | Identifica conjunto implicado |
| DIA-12 | Reparación propuesta | No modifica hasta confirmar |
| DIA-13 | Editar modelo tras análisis | Resultados obsoletos/recalculados |
| DIA-14 | Cancelar análisis pesado | Cancela sin bloquear UI |
| DIA-15 | Modelo grande | Progreso y UI responsiva |

## 12. Criterios de terminado

La investigación de medición/análisis se considera suficientemente especificada cuando:
- cada tipo de entidad tiene magnitudes definidas;
- unidades, precisión y marcos de referencia están claros;
- se distingue valor exacto de aproximación;
- diagnóstico de Sketch, B-rep y malla tiene cobertura;
- análisis de continuidad, curvatura, draft, espesor e interferencia está descrito;
- las incidencias son localizables y no se reparan silenciosamente;
- resultados se invalidan correctamente cuando cambia la geometría;
- la matriz de regresión se puede automatizar.

## 13. Fuentes y certeza

Fuentes públicas de referencia:
- Shapr3D Help Center: https://support.shapr3d.com/hc/en-us
- Measure tool (búsqueda del centro de ayuda): https://support.shapr3d.com/hc/en-us/search?query=Measure
- Sketch diagnostics / constraints (búsqueda): https://support.shapr3d.com/hc/en-us/search?query=sketch%20constraints
- Analysis tools (búsqueda): https://support.shapr3d.com/hc/en-us/search?query=analysis%20tools

**Certeza y alcance:** las magnitudes geométricas y los diagnósticos descritos son especificaciones CAD para NOCTURNE. La disponibilidad exacta de análisis avanzados puede variar por versión, licencia y plataforma de Shapr3D; no se presenta cada análisis avanzado como una función confirmada de Shapr3D. Debe verificarse contra la versión de referencia antes de declarar paridad 1:1.
