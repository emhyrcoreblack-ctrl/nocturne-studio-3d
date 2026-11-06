package com.nocturne.studio

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView

private val Ink = Color(0xFF0B1018)
private val Panel = Color(0xFF151E2B)
private val Stroke = Color(0xFF2B394B)
private val Accent = Color(0xFF8DB8FF)
private val Muted = Color(0xFF9AAAC0)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(11,16,24)
        window.navigationBarColor = android.graphics.Color.rgb(11,16,24)
        setContent { NocturneApp() }
    }
}

@Composable
private fun NocturneApp() {
    var showCreateDialog by remember { mutableStateOf(false) }
    var projectCreated by remember { mutableStateOf(false) }
    var projectName by remember { mutableStateOf("Mi primer proyecto") }
    var projectUnits by remember { mutableStateOf("Milímetros") }
    var activeTool by remember { mutableStateOf("Seleccionar") }
    var panel by remember { mutableStateOf("Ninguno") }
    var showInspector by remember { mutableStateOf(false) }
    var surface by remember { mutableStateOf<CadSurfaceView?>(null) }
    var extrusionHeight by remember { mutableFloatStateOf(1.0f) }
    var selectedFace by remember { mutableIntStateOf(-1) }
    val context = androidx.compose.ui.platform.LocalContext.current
    val stlPicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            try {
                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                if (bytes != null) surface?.importStl(bytes) { ok -> Toast.makeText(context, if (ok) "STL importado" else "Archivo STL no válido", Toast.LENGTH_LONG).show() }
                else Toast.makeText(context, "No se pudo leer el archivo", Toast.LENGTH_LONG).show()
            } catch (_: Exception) { Toast.makeText(context, "Error al importar STL", Toast.LENGTH_LONG).show() }
        }
    }
    val stlSaver = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("model/stl")) { uri ->
        if (uri != null) surface?.exportStl { bytes ->
            try {
                if (bytes == null) Toast.makeText(context, "Importa primero un modelo STL", Toast.LENGTH_LONG).show()
                else context.contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
                if (bytes != null) Toast.makeText(context, "STL exportado", Toast.LENGTH_LONG).show()
            } catch (_: Exception) { Toast.makeText(context, "No se pudo guardar el STL", Toast.LENGTH_LONG).show() }
        }
    }

    MaterialTheme(colorScheme = darkColorScheme(
        background = Ink, surface = Panel, primary = Accent,
        onBackground = Color.White, onSurface = Color.White
    )) {
        Box(Modifier.fillMaxSize().background(Ink)) {
            if (!projectCreated) {
                NewProjectHome(onCreate = { showCreateDialog = true })
            } else {
            AndroidView(
                factory = { context -> CadSurfaceView(context).also { view -> surface = view; view.onSelectionChanged = { selectedFace = it } } },
                modifier = Modifier.fillMaxSize()
            )
            Column(Modifier.fillMaxSize()) {
                Row(
                    Modifier.fillMaxWidth().background(Color(0xEE0B1018)).padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("NOCTURNE", color = Color.White, fontSize = 15.sp)
                        Text("STUDIO 3D  ·  ANDROID", color = Accent, fontSize = 9.sp, letterSpacing = 2.sp)
                    }
                    SmallAction("↶") { surface?.undo() }
                    Spacer(Modifier.width(6.dp))
                    SmallAction("↷") { surface?.redo() }
                    Spacer(Modifier.width(6.dp))
                    SmallAction("▤") { showInspector = !showInspector }
                }
                Spacer(Modifier.weight(1f))
                Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                        listOf("Seleccionar", "Croquis", "Sólido", "Transformar").forEach { tool ->
                            ToolChip(tool, activeTool == tool) {
                                activeTool = tool
                                panel = tool
                                if (tool != "Croquis") surface?.setSketchMode(false)
                                surface?.setSelectionMode(tool=="Seleccionar")
                            }
                        }
                    }
                    if (showInspector) {
                        Column(
                            Modifier.width(174.dp).background(Panel.copy(alpha=.97f), RoundedCornerShape(14.dp))
                                .border(1.dp, Stroke, RoundedCornerShape(14.dp)).padding(12.dp)
                        ) {
                            Text("PROPIEDADES", color = Accent, fontSize = 10.sp)
                            Spacer(Modifier.height(8.dp))
                            Text("Objeto", color = Muted, fontSize = 11.sp)
                            Text(if(selectedFace >= 0) "Cara seleccionada" else "Sin geometría", fontSize = 13.sp)
                            Text(if(selectedFace >= 0) listOf("Frontal","Posterior","Superior","Inferior","Derecha","Izquierda").getOrElse(selectedFace) { "Cara" } else "Empieza creando un croquis sobre el plano", color=Muted, fontSize=10.sp)
                            Spacer(Modifier.height(12.dp))
                            Text("Vista", color = Muted, fontSize = 11.sp)
                            Text("Perspectiva", fontSize = 13.sp)
                        }
                    }
                    if (activeTool=="Sólido" && panel=="Extruir") {
                        Spacer(Modifier.height(8.dp))
                        Text("Altura: " + "%.1f".format(extrusionHeight), color=Muted, fontSize=11.sp)
                        Slider(value=extrusionHeight, onValueChange={ extrusionHeight=it; surface?.setExtrusionHeight(it) }, valueRange=0.1f..8f)
                        SmallAction("Aplicar extrusión") { surface?.extrudeSketch() }
                    }
                }
                Spacer(Modifier.height(10.dp))
                Column(Modifier.fillMaxWidth().background(Color(0xF20E1622)).padding(horizontal=12.dp, vertical=10.dp)) {
                    Text(panel.uppercase(), color = Accent, fontSize = 9.sp, letterSpacing = 1.6.sp)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier=Modifier.fillMaxWidth()) {
                        when (activeTool) {
                            "Croquis" -> listOf("Línea", "Rectángulo", "Círculo").forEach { ToolChip(it, panel==it) {
                                panel=it
                                surface?.setSketchType(it)
                            } }
                            "Sólido" -> (listOf("Caja", "Cilindro", "Extruir", "Importar STL", "Exportar STL")).forEach { ToolChip(it, panel==it) {
                                panel=it
                                when (it) {
                                    "Caja" -> surface?.setPrimitive(0)
                                    "Cilindro" -> surface?.setPrimitive(1)
                                    "Extruir" -> surface?.extrudeSketch()
                                    "Importar STL" -> stlPicker.launch(arrayOf("model/stl", "application/sla", "application/octet-stream"))
                                    "Exportar STL" -> stlSaver.launch("nocturne-modelo.stl")
                                }
                            } }
                            "Transformar" -> listOf("Mover X", "Mover Z", "Rotar", "Escalar +", "Escalar -", "Duplicar", "Restablecer").forEach { ToolChip(it, panel==it) {
                                panel=it
                                surface?.transform(it)
                            } }
                            else -> listOf("Isométrica", "Superior", "Frontal", "Posterior", "Derecha", "Izquierda", "Ajustar vista").forEach { ToolChip(it, panel==it) {
                                panel=it
                                if (it=="Ajustar vista") surface?.resetView() else surface?.setView(it)
                            } }
                        }
                    }
                }
            }
            Text("Plano de trabajo vacío · Crea tu geometría con Croquis · Arrastra para orbitar · Pellizca para zoom", Modifier.align(Alignment.TopCenter).padding(top=74.dp)
                .background(Color(0x990B1018), RoundedCornerShape(20.dp)).padding(horizontal=12.dp, vertical=6.dp),
                color=Muted, fontSize=10.sp)
            }
            if (showCreateDialog) {
                AlertDialog(
                    onDismissRequest = { showCreateDialog = false },
                    title = { Text("Crear proyecto", color = Color.White) },
                    text = {
                        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                            OutlinedTextField(
                                value = projectName,
                                onValueChange = { projectName = it },
                                singleLine = true,
                                label = { Text("Nombre del proyecto") },
                                modifier = Modifier.fillMaxWidth()
                            )
                            Text("Unidades de diseño", color = Muted, fontSize = 12.sp)
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                listOf("Milímetros", "Centímetros", "Pulgadas").forEach { unit ->
                                    FilterChip(
                                        selected = projectUnits == unit,
                                        onClick = { projectUnits = unit },
                                        label = { Text(unit, fontSize = 11.sp) }
                                    )
                                }
                            }
                            Text("Se abrirá un espacio de trabajo vacío.", color = Muted, fontSize = 11.sp)
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = {
                            if (projectName.isNotBlank()) {
                                showCreateDialog = false
                                projectCreated = true
                            }
                        }) { Text("Crear proyecto") }
                    },
                    dismissButton = {
                        TextButton(onClick = { showCreateDialog = false }) { Text("Cancelar") }
                    },
                    containerColor = Panel,
                    titleContentColor = Color.White,
                    textContentColor = Muted
                )
            }
        }
    }
}


@Composable
private fun NewProjectHome(onCreate: () -> Unit) {
    Box(
        Modifier.fillMaxSize().background(Color(0xFF151719)).padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                "NOCTURNE",
                color = Color(0xFFF2F4F7),
                fontSize = 22.sp,
                letterSpacing = 3.sp
            )
            Text(
                "STUDIO 3D",
                color = Color(0xFF8DB8FF),
                fontSize = 10.sp,
                letterSpacing = 4.sp
            )
            Spacer(Modifier.height(42.dp))
            Surface(
                modifier = Modifier.fillMaxWidth().height(190.dp).clickable(onClick = onCreate),
                shape = RoundedCornerShape(22.dp),
                color = Color(0xFF252B32),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF39434E))
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        Modifier.size(58.dp).background(Color(0xFF378FC5), RoundedCornerShape(18.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("+", color = Color.White, fontSize = 38.sp, lineHeight = 40.sp)
                    }
                    Spacer(Modifier.height(16.dp))
                    Text("Nuevo Proyecto", color = Color.White, fontSize = 20.sp)
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Comienza un nuevo diseño 3D desde cero",
                        color = Color(0xFFAEB7C0),
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun SmallAction(label: String, onClick: () -> Unit) {
    Box(Modifier.size(38.dp).background(Panel, RoundedCornerShape(10.dp)).border(1.dp,Stroke,RoundedCornerShape(10.dp))
        .clickable(onClick=onClick), contentAlignment=Alignment.Center) {
        Text(label, color=Color.White, fontSize=18.sp)
    }
}

@Composable
private fun ToolChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Box(Modifier.background(if(selected) Color(0xFF263D5B) else Panel, RoundedCornerShape(10.dp))
        .border(1.dp, if(selected) Accent else Stroke, RoundedCornerShape(10.dp))
        .clickable(onClick=onClick).padding(horizontal=11.dp, vertical=9.dp)) {
        Text(label, color=if(selected) Color.White else Muted, fontSize=11.sp)
    }
}
