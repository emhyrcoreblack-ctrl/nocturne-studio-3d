# NOCTURNE CAD Engine v2

Núcleo nuevo, independiente de la aplicación monolítica anterior. La futura interfaz Android inspirada en Shapr3D consumirá esta API; no hay componentes visuales en este motor.

## Principios
- Geometría/documento desacoplados de la interfaz.
- Unidades internas en milímetros.
- Validación explícita y datos serializables.
- Historial paramétrico por características.
- Separación entre sólidos B-rep y mallas trianguladas.

## Módulos
- `geometry.js`: vectores 3D, planos de trabajo, validación de perfiles y extrusión poligonal inicial.
- `sketch.js`: líneas, rectángulos, círculos, arcos, restricciones básicas, cotas y serialización de bocetos.
- `document.js`: documento CAD, características, regeneración y undo/redo.
- `tests/`: pruebas automatizadas con Node.js.

## Ejecutar pruebas
Requiere Node.js 20 o superior:
```sh
cd engine-v2
npm test
```

## Limitaciones conocidas
La extrusión actual produce una malla triangular y solo admite perfiles convexos simples. No es todavía un kernel B-rep exacto. Las restricciones actuales se validan; todavía no existe un solucionador paramétrico que mueva geometría para satisfacerlas. Booleanos, filetes, chaflanes, barridos, lofts y edición topológica de STL siguen pendientes.
