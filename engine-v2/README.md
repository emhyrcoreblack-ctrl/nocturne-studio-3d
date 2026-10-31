# NOCTURNE CAD Engine v2

Esta carpeta es el núcleo nuevo del proyecto. No reutiliza la aplicación monolítica anterior ni su interfaz. La interfaz Android inspirada en Shapr3D se construirá después, consumiendo esta API.

## Principios
- Geometría y documento independientes de la interfaz.
- Unidades internas en milímetros.
- Operaciones deterministas y validación explícita.
- Historial de características con parámetros serializables.
- Diferenciar B-rep paramétrico de mallas trianguladas importadas.
- Ninguna cámara, panel, botón ni dependencia visual dentro del núcleo.

## Módulos iniciales
- `geometry.js`: vectores, planos, perfiles y extrusión poligonal básica.
- `document.js`: documento CAD, características, regeneración e historial undo/redo.

## Estado
Fundación inicial. La extrusión poligonal produce una malla triangular cerrada para prototipado y exportación; todavía no es un kernel B-rep exacto. Las operaciones exactas (booleanos, filetes, chaflanes y superficies) requieren integrar un kernel CAD apropiado en una fase posterior.
