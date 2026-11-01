# NOCTURNE STUDIO 3D — Android

Proyecto Android nativo independiente de la vista web.

## Abrir y compilar
1. Abrir la carpeta `android/` con Android Studio (Hedgehog o posterior).
2. Usar JDK 17 y Android SDK Platform 35.
3. Sincronizar Gradle y ejecutar la configuración `app` en un dispositivo Android o emulador.

También se añadirá una compilación automatizada para generar el APK de depuración.

## Estado real de esta base
- Aplicación Android Kotlin + Jetpack Compose.
- Visor 3D nativo con OpenGL ES 2.0, sólido de caja/cilindro, rejilla, órbita táctil y zoom multitáctil.
- Interfaz táctil inicial y panel de propiedades plegable.

Todavía no es un CAD equivalente a Shapr3D: croquis geométricos, restricciones paramétricas, kernel B-rep, booleanos, edición STL y persistencia de proyectos deben implementarse y probarse por etapas. No presentar esas funciones como disponibles.
