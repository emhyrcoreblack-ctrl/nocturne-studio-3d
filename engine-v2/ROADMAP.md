# Plan de implementación del motor

## Base creada
- [x] Separación del motor respecto a la interfaz antigua.
- [x] Tipos vectoriales y planos de trabajo XY/XZ/YZ.
- [x] Validación de perfiles poligonales simples.
- [x] Extrusión inicial a malla triangular para perfiles convexos.
- [x] Documento CAD serializable y lista de características.
- [x] Cursor de historial, undo y redo del documento.

## Siguientes hitos
1. Pruebas automatizadas de geometría, orientación y regeneración.
2. Triangulación robusta de perfiles cóncavos y agujeros.
3. Adaptador de kernel B-rep exacto para sólidos y operaciones booleanas.
4. Bocetos con entidades (línea, arco, círculo, rectángulo) y restricciones/cotas.
5. Revolución, barrido, loft, vaciado, filete y chaflán.
6. Edición de mallas importadas: selección de vértices/aristas/caras y operaciones topológicas.
7. Transformaciones, patrones, espejos y ensamblajes.
8. Importadores/exportadores y persistencia de documentos.
9. Suite de pruebas geométricas y de regresión.
10. Interfaz Android inspirada en Shapr3D, solo después de validar el motor.

## Limitaciones explícitas actuales
Este primer extrusor no es un kernel CAD industrial: genera malla triangular, no geometría B-rep exacta; acepta perfiles convexos sin agujeros. No afirmar que booleanos, filetes, superficies o edición STL estén implementados hasta que existan y pasen pruebas.
