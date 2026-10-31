# Investigación Shapr3D para NOCTURNE STUDIO 3D — Parte 16
## Documentos, proyectos, archivos, sincronización y colaboración

**Estado:** investigación y especificación funcional. No constituye implementación ni certificación de paridad.  
**Plataforma objetivo:** Android.  
**Referencia:** capacidades públicas y comportamiento observable de Shapr3D; las decisiones de arquitectura se identifican como propuestas para NOCTURNE.

## 1. Objetivo

Especificar el ciclo de vida del trabajo: abrir la aplicación, crear/abrir documentos, organizarlos en proyectos, guardar, recuperar, duplicar, compartir, exportar y colaborar. El diseño debe proteger el trabajo del usuario, hacer explícito el estado de sincronización y evitar pérdidas o sobrescrituras silenciosas.

Separar tres conceptos:
- **Documento CAD:** modelo, historial, geometría, materiales, ensamblaje y configuración de vista.
- **Proyecto/espacio de trabajo:** agrupación organizativa de documentos y recursos.
- **Archivo de intercambio/entrega:** representación exportada para otro CAD, visor, fabricación o presentación.

No asumir que un archivo exportado conserva el historial paramétrico.

## 2. Ciclo de vida y pantalla de inicio

La experiencia inicial debe permitir:
- Crear documento nuevo.
- Abrir recientes.
- Explorar documentos y proyectos.
- Importar archivo.
- Recuperar documento o sesión si hubo cierre inesperado.
- Acceder a plantillas, ejemplos y ayuda, si se implementan.
- Ver estado de cuenta/sincronización cuando aplique.

Cada tarjeta de documento debería mostrar nombre, miniatura, fecha de modificación, ubicación, estado local/nube y advertencias relevantes. Las acciones contextuales incluyen abrir, renombrar, duplicar, mover, compartir, exportar y eliminar, sujetas a permisos.

En Android, respetar navegación del sistema, tamaños táctiles, orientación y reanudación de actividad. Una interrupción por llamada, cambio de aplicación o cierre del proceso no debe perder una transacción confirmada.

## 3. Modelo de archivos y almacenamiento

Arquitectura recomendada para NOCTURNE:
- Documento nativo con esquema versionado.
- Recursos vinculados o empaquetados: texturas, imágenes de referencia, componentes externos y miniaturas.
- Índice local para búsqueda y recientes.
- Metadatos de proyecto y permisos.
- Exportaciones independientes del documento fuente.
- Registro de cambios y checkpoints de recuperación.

El documento debe tener ID estable, nombre editable, versión de esquema, versión del kernel/serializador, fechas de creación/modificación y huella de contenido. No usar el nombre o ruta como identidad.

### 3.1 Ubicación y acceso Android

Usar mecanismos compatibles con Android para selección y acceso a documentos, incluyendo Storage Access Framework cuando corresponda. No asumir acceso irrestricto al sistema de archivos. Gestionar permisos persistentes de URI cuando el usuario lo autorice y manejar archivos movidos, borrados o proveedores externos no disponibles.

### 3.2 Paquete nativo

El formato nativo debe preservar:
- Historial paramétrico y grafo de dependencias.
- B-rep y mallas.
- Componentes e instancias.
- Materiales, texturas y referencias UV.
- Planos, ejes, sketches y cotas.
- Cámara, unidades y preferencias del documento.
- Metadatos y miniatura.
- Recursos empaquetados o vínculos con estado explícito.

Debe incluir manifest, versión de esquema, checksums y política de migración. Evitar depender de rutas absolutas del dispositivo.

## 4. Guardado y autosave

Diferenciar:
- **Guardar:** confirma el estado actual del documento.
- **Guardar como:** crea una copia independiente o nuevo documento.
- **Autosave:** checkpoint de recuperación; no necesariamente crea una nueva versión visible.
- **Sincronizar:** transmite cambios a almacenamiento remoto.
- **Exportar:** genera una representación de entrega; no reemplaza el archivo nativo.

Requisitos:
1. Guardado atómico o equivalente.
2. Indicador visible: guardado, cambios pendientes, guardando, error.
3. Autosave con intervalos adaptativos y tras acciones de alto valor.
4. No bloquear el viewport durante escritura.
5. Reintentar ante interrupciones sin duplicar archivos.
6. No marcar guardado si solo se escribió una parte.
7. Permitir recuperación después de crash o cierre del proceso.
8. Mantener el documento anterior si falla la escritura de una nueva versión.
9. Mostrar espacio insuficiente y errores de permisos con acciones comprensibles.

El autosave debe ser independiente de la sincronización de nube: un documento puede estar guardado localmente y pendiente de subir.

## 5. Sincronización y estado local/nube

Si NOCTURNE ofrece nube:
- Identificar documento y revisión remotamente.
- Sincronizar solo después de persistir localmente.
- Reanudar cargas interrumpidas.
- Verificar integridad por checksum.
- Mostrar progreso, pausa, reintento y último éxito.
- Mantener acceso offline a documentos descargados.
- No borrar el original local por un error remoto.
- Definir qué recursos se almacenan localmente y cuáles se descargan bajo demanda.

Estados recomendados: LocalOnly, Synced, PendingUpload, Downloading, Uploading, Conflict, Offline, PermissionDenied y SyncFailed.

No usar un único icono ambiguo para “guardado”: guardar localmente y sincronizar son estados distintos.

## 6. Versiones, revisiones y conflictos

Distinguir:
- Historial de undo/redo de la sesión.
- Checkpoints automáticos.
- Revisiones persistentes del documento.
- Versiones compartidas/publicadas.

Cada revisión debe incluir ID, autor cuando aplique, fecha, mensaje opcional, parent revision y huella de contenido.

### 6.1 Conflictos

Dos dispositivos pueden editar offline la misma revisión. NOCTURNE no debe aplicar “última escritura gana” silenciosamente sobre un modelo CAD complejo.

Política recomendada:
1. Detectar divergencia de parent revision.
2. Conservar ambas ramas.
3. Crear una copia de conflicto o rama alternativa.
4. Comparar metadatos y cambios cuando sea posible.
5. Permitir al usuario elegir revisión o copiar objetos manualmente.
6. No prometer merge geométrico automático de historiales paramétricos sin un algoritmo robusto y probado.

Un merge de documentos CAD puede ser más complejo que combinar archivos de texto: las features pueden depender de caras y aristas modificadas por la otra rama.

### 6.2 Restauración

Restaurar revisión debe crear una nueva revisión derivada, no destruir el historial posterior. Mostrar claramente cuál será la versión activa antes de confirmar.

## 7. Organización de proyectos

Funciones recomendadas:
- Crear/renombrar proyectos.
- Mover documentos entre proyectos.
- Favoritos y recientes.
- Ordenar por nombre, fecha o tipo.
- Buscar por nombre y metadatos.
- Filtrar por estado de sincronización o tipo.
- Duplicar documentos.
- Archivar o eliminar con confirmación.
- Recuperar desde papelera si existe política de retención.

Los proyectos son agrupaciones organizativas; no deben alterar IDs internos ni referencias geométricas al mover documentos.

## 8. Compartir y colaboración

Distinguir compartir una copia, compartir enlace de solo lectura y colaboración con edición.

Modelo de permisos propuesto:
- Owner: control total y administración.
- Editor: modifica documento.
- Commenter/Reviewer: comenta o revisa sin cambiar geometría.
- Viewer: solo lectura.
- Export recipient: recibe un archivo de entrega, sin acceso al documento vivo.

La interfaz debe mostrar quién tiene acceso, rol, fecha de invitación y estado. Revocar acceso debe invalidar permisos futuros; definir comportamiento para copias descargadas previamente.

### 8.1 Edición simultánea

La edición multiusuario en tiempo real exige coordinación de operaciones, bloqueos/leases o un modelo de concurrencia explícito. Para una primera versión segura:
- Empezar con compartir y revisión de solo lectura.
- Añadir comentarios/anotaciones.
- Después habilitar edición colaborativa con control de concurrencia.
- Evitar dos usuarios editando la misma feature simultáneamente hasta contar con resolución probada.
- Mostrar presencia y autoría de cambios si se incorpora colaboración en vivo.

No afirmar compatibilidad con colaboración simultánea de Shapr3D sin verificar versión, plan y plataforma actuales.

## 9. Exportación y entrega

La exportación debe ser un flujo separado del guardado nativo.

Formatos a evaluar por caso de uso:
- STEP: intercambio CAD B-rep.
- IGES: intercambio de superficies/curvas heredado.
- Parasolid X_T/X_B: intercambio de geometría Parasolid cuando el kernel/licencia lo permita.
- STL: fabricación/impresión 3D; controlar unidades, tolerancia y teselación.
- 3MF: impresión 3D con metadatos compatibles.
- OBJ/MTL: mallas y materiales.
- GLB/glTF: visualización 3D y materiales.
- USD: escenas y composición cuando la cadena de herramientas lo requiera.
- PDF/imagen: planos, capturas o documentación, si se implementan.

El diálogo debe permitir seleccionar cuerpos/componentes, unidades, resolución/tolerancia, incluir/excluir materiales, orientación y destino. Mostrar advertencias de pérdida de información. El archivo exportado debe tener nombre y ubicación elegidos, y confirmación de éxito verificable.

## 10. Importación y vinculación de recursos

Importar no equivale a abrir el documento nativo. El flujo debe permitir:
- Abrir documento nativo.
- Importar geometría a documento existente.
- Adjuntar imagen/textura de referencia.
- Vincular o empaquetar recursos.
- Sustituir un recurso perdido.
- Resolver unidades y orientación.
- Previsualizar antes de confirmar.

Para recursos externos, indicar si están incrustados, vinculados, ausentes o desactualizados. Ofrecer empaquetar recursos para compartir o archivar.

## 11. Seguridad, privacidad y permisos

- Solicitar permisos mínimos y en el momento de uso.
- Cifrar tráfico de sincronización.
- Proteger credenciales y tokens en almacenamiento seguro del sistema.
- Controlar acceso por documento y rol en servidor.
- No registrar contenido sensible del modelo en telemetría por defecto.
- Permitir revocar sesiones y accesos remotos.
- Informar qué se comparte antes de crear un enlace público.
- Enlaces compartidos deben poder expirar o revocarse.
- No incluir rutas privadas del dispositivo en metadatos exportados.

## 12. Rendimiento y resiliencia Android

- Abrir primero metadatos/miniatura y cargar geometría progresivamente.
- Mantener una copia local recuperable.
- Ejecutar compresión, checksums y sincronización fuera del hilo UI.
- Reanudar transferencias interrumpidas.
- Gestionar límites de memoria y almacenamiento.
- Evitar duplicar buffers de archivos grandes.
- Mostrar progreso y permitir cancelar operaciones seguras.
- Manejar rotación, suspensión y terminación del proceso.
- Verificar integridad al descargar/abrir.
- No eliminar archivos temporales hasta confirmar persistencia.

## 13. Matriz de pruebas

### Inicio y documentos
1. Crear documento vacío.
2. Abrir reciente.
3. Buscar por nombre.
4. Renombrar sin cambiar ID.
5. Duplicar y comprobar independencia.
6. Mover entre proyectos sin romper referencias.
7. Eliminar con confirmación.
8. Recuperar desde papelera si está soportada.
9. Abrir archivo nativo incompatible y mostrar diagnóstico.
10. Reanudar tras cambio de aplicación.

### Guardado y recuperación
11. Guardar documento pequeño.
12. Guardar documento grande sin bloquear UI.
13. Interrumpir guardado y conservar versión anterior.
14. Simular almacenamiento lleno.
15. Revocar permiso de URI.
16. Recuperar tras cierre forzado.
17. Verificar autosave de transacción confirmada.
18. Evitar autosave de estado parcial.
19. Cerrar con cambios pendientes y ofrecer guardar.
20. Restaurar checkpoint sin perder historial.

### Sincronización
21. Subir documento y verificar checksum.
22. Interrumpir y reanudar subida.
23. Abrir offline documento descargado.
24. Mostrar PendingUpload sin confundirlo con no guardado.
25. Recuperar permiso remoto.
26. Detectar versión remota más nueva.
27. Conservar copia local ante fallo de nube.
28. Detectar conflicto entre dos ediciones offline.
29. Conservar ambas ramas.
30. Restaurar revisión creando nueva revisión.

### Proyectos y colaboración
31. Crear y renombrar proyecto.
32. Ordenar y filtrar documentos.
33. Compartir solo lectura.
34. Revocar enlace.
35. Comprobar roles editor/viewer.
36. Intentar edición sin permiso.
37. Verificar que mover proyecto no altera geometría.
38. Abrir enlace vencido y explicar estado.

### Exportación e importación
39. Exportar STEP y reabrir en otro CAD.
40. Exportar STL con unidades correctas.
41. Exportar GLB conservando materiales compatibles.
42. Mostrar advertencia de pérdida paramétrica.
43. Cancelar exportación sin dejar archivo incompleto.
44. Importar a documento existente sin alterar cámara/zoom.
45. Adjuntar textura y empaquetar recurso.
46. Detectar recurso vinculado ausente.
47. Reemplazar recurso sin romper el documento.

### Seguridad y Android
48. Verificar permisos mínimos.
49. Revocar acceso compartido.
50. Verificar transferencia cifrada.
51. Rotar dispositivo durante guardado.
52. Suspender app durante transferencia.
53. Terminar proceso y recuperar.
54. Abrir proyecto grande con carga progresiva.
55. Verificar integridad tras descarga.

## 14. Criterios de aceptación

- Documento nativo y exportación son conceptos distintos.
- Guardado local, autosave y sincronización tienen estados independientes.
- Crash recovery restaura la última transacción consistente.
- Versiones y conflictos no sobrescriben silenciosamente trabajo.
- Organización de proyectos no rompe IDs ni referencias.
- Compartir aplica permisos explícitos y revocables.
- Exportación declara límites y pérdida de datos.
- Recursos externos tienen estado verificable.
- La app respeta permisos y ciclo de vida Android.
- Los flujos críticos tienen pruebas automatizadas y de dispositivo.

## 15. Separación de certeza

**A verificar en Shapr3D según documentación/versión/plataforma:** pantalla de inicio, gestión de proyectos/documentos, guardado y sincronización, compartir, permisos, historial de versiones, colaboración, formatos de importación/exportación y límites por plan.

**Arquitectura general propuesta para NOCTURNE, no atribuida a Shapr3D:** estados de sincronización detallados, ramas de conflicto CAD, modelo de permisos, revisión persistente, autosave transaccional, paquete nativo versionado, leases/concurrencia y recuperación distribuida.

**Pendiente de verificación empírica:** capacidades exactas de colaboración, roles, historial de versiones, límites de almacenamiento, formatos disponibles por plataforma y plan, y políticas actuales de nube. Deben comprobarse en fuentes oficiales vigentes antes de presentarlas como paridad.

## 16. Próximo bloque

Parte 17: documentación técnica, planos 2D, dibujos, vistas, secciones, cotas, anotaciones, tolerancias, exportación de planos y flujo de fabricación. Diferenciar capacidades confirmadas de Shapr3D de requisitos CAD generales de NOCTURNE.
