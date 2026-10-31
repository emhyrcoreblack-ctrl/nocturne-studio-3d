# Plan de implementación del motor

## Implementado en la fundación
- [x] Núcleo separado de la interfaz anterior.
- [x] Vectores y planos XY/XZ/YZ.
- [x] Validación de perfiles poligonales simples.
- [x] Extrusión inicial a malla triangular (solo perfiles convexos).
- [x] Documento CAD serializable, características y cursor de historial.
- [x] Undo/redo del documento.
- [x] Entidades de boceto: línea, rectángulo, círculo y arco.
- [x] Restricciones básicas: horizontal, vertical, coincidencia, distancia, radio e igualdad (validación, no solver).
- [x] Cotas anotativas y serialización de bocetos.
- [x] Primer conjunto de pruebas con Node test runner.

## Próximos hitos
1. Ejecutar la suite en CI y corregir cualquier fallo.
2. Solucionador paramétrico de restricciones y cotas.
3. Perfiles cóncavos y agujeros con triangulación robusta.
4. Adaptador de kernel B-rep exacto para sólidos y booleanos.
5. Revolución, barrido, loft, vaciado, filete y chaflán.
6. Edición topológica de mallas importadas (STL).
7. Transformaciones, patrones, espejos y ensamblajes.
8. Importación/exportación y persistencia.
9. Pruebas geométricas y de regresión más amplias.
10. Interfaz Android inspirada en Shapr3D, después de validar el motor.

## Límites actuales
El solver aplica automáticamente un conjunto limitado de restricciones; todavía no es un solucionador general no lineal y puede no converger en sistemas incompatibles o complejos. La extrusión crea malla, no B-rep exacto, y solo acepta perfiles convexos sin agujeros. No anunciar como implementadas las operaciones que aún no existen.
