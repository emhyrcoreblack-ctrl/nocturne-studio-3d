# Investigación Shapr3D para Android — Parte 07: modificación de caras, proyección, división y envoltura

**Proyecto:** NOCTURNE STUDIO 3D  
**Estado:** especificación funcional basada en documentación pública; no es implementación.  
**Fecha de consulta:** 31-10-2026.  
**Criterio:** describir comportamiento observable, distinguir hechos documentados de aspectos pendientes de prueba y diseñar una implementación independiente.

---

## 1. Alcance

Esta entrega estudia:

1. Offset Face.
2. Offset Edge (3D).
3. Replace Face.
4. Split Body.
5. Project (Edges y Sketches).
6. Wrap & Emboss.
7. Visualize como espacio/herramienta complementaria, sin confundirlo con modelado geométrico.

Las herramientas no son intercambiables: unas modifican topología B-rep, otras crean referencias/proyecciones, otras separan cuerpos y Wrap & Emboss mapea perfiles sobre superficies desarrollables de tipo cilíndrico o cónico.

## 2. Offset Face

### Propósito
Desplaza una o varias caras de un cuerpo, extendiendo o recortando las caras adyacentes para actualizar el sólido. Las caras tangentes se incluyen automáticamente. Puede modificar espesores, diámetros/radios de caras circulares y rasgos locales sin crear un cuerpo nuevo.

### Flujo de interacción
1. Tools > Offset Face.
2. Seleccionar una o varias caras.
3. Usar gizmo o introducir distancia.
4. Cuando se selecciona una sola cara plana, se puede elegir Distance Type.
5. Done.

Al invocarla desde el menú adaptativo, se finaliza seleccionando un área vacía de la cuadrícula.

### Tipos de distancia
- **Offset:** desplaza la cara desde su posición original. Es el único tipo disponible cuando se seleccionan varias caras.
- **Total:** establece el espesor total entre la cara seleccionada y su cara opuesta; expone Total Distance y Opposite Face.
- **Radius/Diameter:** para caras circulares completas ajusta diámetro simétricamente respecto al centro; para caras circulares parciales ajusta el radio.
- Al cambiar de Radius/Diameter a Offset, el valor puede interpretarse como distancia de offset; la interfaz debe evitar sorpresas mostrando unidad y modo.

### History
- Una cara: Face, Distance Type y los campos asociados al tipo elegido.
- Varias caras: Face(s), Distance.
- Total permite cambiar la cara opuesta.

### Pruebas
- Cara plana, cilíndrica, cónica y superficie no plana.
- Cara aislada y conjunto de caras adyacentes/tangentes.
- Offset positivo, negativo y cero.
- Total con cara opuesta identificable y con geometría irregular.
- Radius/Diameter en círculo completo y cara circular parcial.
- Selección múltiple: comprobar que solo se ofrece Offset.
- Desplazamiento que colisiona, autointersecta o elimina una cara.
- Cambiar cara, tipo y magnitud en History.
- Verificar continuidad y cierre del sólido tras cada edición.

## 3. Offset Edge (3D)

### Propósito
Crea nuevos elementos de sketch desplazados respecto a aristas de un cuerpo 3D. No es una operación de offset de caras ni un desplazamiento topológico del sólido: genera geometría de sketch referenciada a la geometría 3D.

### Flujo
1. Tools > Offset Edge.
2. Elegir Type.
3. Seleccionar Single o Chain.
4. Seleccionar arista.
5. Ajustar dirección y distancia con gizmo.
6. Done.

- **Single:** desplaza una arista individual.
- **Chain:** desplaza una cadena conectada de aristas.
- La herramienta también existe en el contexto de Sketch, pero allí opera sobre elementos 2D.

### History y relaciones
La documentación del flujo 3D indica que el paso automático de Offset Edge permite editar el plano/cara en que se crea el sketch (Plane). La documentación de Offset Edge en Sketch describe Single/Chain y flechas para elegir el loop cuando la arista pertenece a múltiples loops. El changelog confirma que Offset Edge recibió restricciones de offset para mantener los nuevos elementos vinculados a la geometría original, con soporte de variables/expresiones; la implementación debe verificar en pruebas la cobertura exacta de estas relaciones en el flujo 3D.

### Pruebas
- Arista recta, curva y cadena conectada.
- Cadena abierta y cerrada.
- Arista compartida por múltiples loops: elección de dirección/loop.
- Distancia positiva y negativa.
- Plano de sketch asociado y cambio de plano en History.
- Actualizar la geometría de origen y comprobar que el offset asociado se recalcula.
- Eliminar o suprimir la arista de origen y verificar error/referencia perdida controlada.
- Confirmar que los elementos creados son sketch entities y no alteran el sólido de origen.

## 4. Replace Face

### Propósito
Extiende o recorta una o varias caras seleccionadas hasta hacerlas coincidir con una cara objetivo. Útil para modificar caras planas producidas por extrusiones y para hacer coincidir superficies de cuerpos conectados.

### Flujo y roles
1. Tools > Replace Face.
2. Seleccionar las caras que se van a reemplazar: azul, badge Replace Face.
3. Seleccionar la cara sustituta/objetivo: púrpura, badge Target.
4. Los badges permiten redefinir si una selección es cara a reemplazar o cara objetivo.
5. Done.

### History
- Faces to Replace.
- Replacing Face.
- Flip Alignment: extiende el reemplazo hacia el otro lado de la cara sustituta.

### Requisitos y pruebas
- Selección de una cara y varias caras a reemplazar.
- Cara objetivo plana y no plana (verificar límites admitidos por el kernel).
- Cara objetivo perteneciente al mismo cuerpo y a otro cuerpo.
- Extensión y recorte.
- Flip Alignment activado/desactivado.
- Caras que no se intersectan o no admiten extensión; mensajes de fallo.
- Reasignar roles mediante badges.
- Cambiar caras y Flip Alignment en History.
- Verificar que la cara resultante coincide geométricamente con la cara objetivo y que el cuerpo permanece válido.

La documentación explica el flujo, pero no publica el algoritmo de extensión/intersección ni todos los límites de continuidad; estos deben caracterizarse con pruebas de referencia.

## 5. Split Body

### Propósito
Divide un cuerpo sólido en múltiples cuerpos sin eliminar material. La herramienta de corte se proyecta a través de los cuerpos seleccionados; por tanto, no necesita tocar físicamente el cuerpo.

### Flujo
1. Tools > Split Body.
2. Seleccionar los cuerpos a dividir (azul, badge Split Body).
3. Seleccionar herramienta(s) de división.
4. Opcional: Keep Originals.
5. Done.

Los badges permiten redefinir o alternar selecciones.

### Herramientas de división admitidas
- Planos de construcción.
- Planos de cuadrícula.
- Perfiles de sketch.
- Caras de cuerpos.
- Aristas coplanares de otro cuerpo.
- Una cara del propio cuerpo.

Se pueden seleccionar varias herramientas de división en una misma operación.
- Sketches conectados en el mismo plano se combinan en una superficie de corte.
- Sketches no conectados no se combinan; producen cortes simultáneos separados.

### Keep Originals
- Off (predeterminado): quedan solo los cuerpos resultantes y se elimina el original.
- On: los resultados se crean como cuerpos nuevos y se conserva el original.

### History
- Bodies to Split.
- Split With.
- Keep Originals.

### Pruebas
- Corte por plano ortogonal y oblicuo.
- Plano que atraviesa, queda tangente o no intersecta el sólido.
- Perfil cerrado y abierto (determinar validez por caso).
- Varias herramientas de corte en una operación.
- Sketches conectados y desconectados en el mismo plano.
- Cara/arista de otro cuerpo y cara propia.
- Keep Originals On/Off.
- Cuerpo que produce dos o más fragmentos.
- Reasignar Bodies to Split y Split With en History.
- Verificar conservación exacta del volumen total (dentro de tolerancia numérica) y validez de cada fragmento.

## 6. Project

### Propósito
Proyecta sketches, aristas o caras sobre otra cara o sketch. Puede proyectar sobre superficies complejas/no planas, crear sketches sobre caras a partir de geometría 3D y generar referencias para operaciones posteriores.

### Tipos de proyección
- **Edges:** genera aristas geométricas en la superficie del cuerpo. Las aristas proyectadas dividen la superficie en regiones; permanecen visibles con el cuerpo aunque se oculten sketches y siguen cambios de la geometría de origen.
- **Sketches:** genera nuevos sketches. Puede activar **Linked Sketch** para conservar una relación con el elemento proyectado.
- También existe Project - Sketches desde el menú Sketch.

### Flujo
1. Tools > Project.
2. Elegir Projection Type: Edges o Sketches.
3. Para Sketches, activar/desactivar Linked Sketch.
4. Seleccionar Items to Project (badge azul).
5. Seleccionar Projection surface (superficie púrpura).
6. Revisar preview y Done.

### History
- Projection Type.
- Linked Sketch (cuando corresponda).
- Items to Project.
- Projection surface.

### Diferencia entre proyección de aristas y sketch
La proyección de aristas es una propiedad geométrica de la cara del cuerpo, capaz de dividirla en regiones y seguir la geometría fuente. La proyección de sketches crea elementos de sketch, opcionalmente vinculados. No deben representarse como la misma clase de entidad en el modelo interno.

### Pruebas
- Proyectar aristas, sketch y caras.
- Superficie plana, cilíndrica y libre/no plana.
- Elemento origen sobre el mismo plano y fuera de él.
- Edges vs Sketches.
- Linked Sketch ON/OFF.
- Proyección que cruza límites de cara y produce varias regiones.
- Actualizar el origen y comprobar propagación.
- Ocultar sketch fuente y comprobar visibilidad de edge projection.
- Cambiar Items to Project y Projection surface en History.
- Casos sin intersección, proyección ambigua o resultado autointersectado.

La documentación consultada no detalla exhaustivamente la dirección/vector de proyección para todos los tipos de geometría y superficies; debe medirse en pruebas.

## 7. Wrap & Emboss

### Propósito
Mapea perfiles 2D de sketch sobre una cara cilíndrica o cónica. Conserva las dimensiones de área del sketch y adapta la geometría a la curvatura, evitando la distorsión de una proyección lineal convencional.

Aplicaciones: texto y logotipos sobre envases, grabados, relieves, ranuras, texturas de agarre y patrones sobre ruedas o mandos.

### Flujo
1. Tools > Wrap & Emboss.
2. Seleccionar perfiles/regiones de sketch.
3. Seleccionar una única cara cilíndrica o cónica como objetivo.
4. Ajustar posición y profundidad con gizmo o History.
5. Done.

### Diferencia frente a Project
- Wrap & Emboss: mapeo sobre curvatura que conserva dimensiones del sketch.
- Project: proyección lineal sobre una cara; en superficies curvas la geometría puede estirarse según el ángulo de incidencia.

### Pruebas
- Cara cilíndrica y cónica.
- Perfil simple, texto, múltiples regiones y patrones.
- Cara objetivo única; selección de múltiples caras debe rechazarse si no está admitida.
- Posición alrededor del eje y desplazamiento axial.
- Profundidad de emboss/deboss y cambio de signo.
- Perfiles que cruzan la costura de una superficie periódica.
- Sketch demasiado grande para la cara, límites de la cara y zonas de alta curvatura.
- Reemplazar sketch y cara objetivo desde History.
- Medir dimensiones de área del sketch frente al resultado mapeado.
- Comparar resultado con Project para confirmar que no se aplica el mismo algoritmo.

La documentación consultada no publica todos los parámetros internos, reglas de profundidad ni tratamiento de costuras; estos puntos quedan como pendientes de observación y no deben darse por garantizados.

## 8. Visualize: separar modelado y presentación

Visualize es un espacio para renders en tiempo real, no una operación de modelado B-rep. La documentación describe más de 100 materiales, opciones de entorno y ajustes de cámara/profundidad de campo. Se accede desde Project Sidebar o Tools > Visualize. La barra lateral de propiedades permite trabajar con pestañas Material, Environment y Camera.

### Alcance a estudiar en una parte posterior
- Biblioteca y aplicación de materiales.
- Materiales personalizados/importados.
- Entornos e iluminación.
- Cámara, profundidad de campo y encuadre.
- Render y captura/exportación.
- Persistencia de ajustes de visualización y relación con el modelo.
- Diferencias de disponibilidad y rendimiento Android.

No mezclar estos materiales de render con texturas/atributos de fabricación ni con las propiedades geométricas del sólido.

## 9. Contrato de datos y arquitectura sugerida

Cada operación debe tener:
- ID estable de operación.
- Tipo y versión de esquema.
- Referencias estables a cuerpos, caras, aristas, sketches y planos.
- Roles semánticos (target, tool, source, destination, split tool).
- Parámetros con unidades.
- Estado de preview/confirmación.
- Dependencias explícitas dentro del grafo de History.
- Resultado geométrico y diagnóstico del kernel.
- Política de conservación de originales cuando aplique.

Las referencias topológicas deben tolerar cambios de malla y, en lo posible, cambios de topología. No basar referencias persistentes en índices de triángulos de render. Las operaciones que fallen deben conservar el último estado válido y marcar dependencias afectadas.

## 10. Matriz general de regresión

1. Crear sólido base y ejecutar cada herramienta.
2. Confirmar, cancelar y deshacer.
3. Editar cada parámetro desde History.
4. Cambiar selección fuente/objetivo.
5. Suprimir y reactivar la operación.
6. Editar una operación anterior y comprobar propagación.
7. Guardar, cerrar y reabrir el proyecto.
8. Verificar que las referencias sobreviven a serialización.
9. Comprobar volumen, área, continuidad, regiones y validez B-rep.
10. Probar con selección táctil, zoom/pan/orbit y pantalla de tamaño reducido.
11. Probar geometría importada y geometría creada nativamente por separado.
12. Registrar errores reproducibles y no esconder fallos con reparación silenciosa.

## 11. Fuentes oficiales consultadas

- Offset Face: https://support.shapr3d.com/hc/en-us/articles/7874400678428-Offset-Face
- Offset Edge (3D): https://support.shapr3d.com/hc/en-us/articles/7874464169244-Offset-Edge-3D
- Replace Face: https://support.shapr3d.com/hc/en-us/articles/7874457242268-Replace-Face
- Split Body: https://support.shapr3d.com/hc/en-us/articles/7874462683036-Split-Body
- Project: https://support.shapr3d.com/hc/en-us/articles/7874464667676-Project
- Wrap & Emboss: https://support.shapr3d.com/hc/en-us/articles/25620612815260-Wrap-Emboss
- Visualize: https://support.shapr3d.com/hc/en-us/articles/7874458664732-Visualize
- Tools menu: https://support.shapr3d.com/hc/en-us/sections/7768348416028-Tools-menu
- Changelog: https://support.shapr3d.com/hc/en-us/articles/7536511116188-Changelog

---

## Conclusión

Estas herramientas requieren distinguir con rigor entre modificación de caras, generación de sketch referenciado, sustitución de superficies, división de cuerpos y mapeo de perfiles. Para lograr paridad funcional, NOCTURNE debe preservar las relaciones paramétricas y el historial editable, no limitarse a producir una malla visual parecida.
