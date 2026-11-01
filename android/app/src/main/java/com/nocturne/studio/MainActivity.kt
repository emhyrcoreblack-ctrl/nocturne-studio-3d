package com.nocturne.studio

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
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
    var activeTool by remember { mutableStateOf("Seleccionar") }
    var panel by remember { mutableStateOf("Ninguno") }
    var showInspector by remember { mutableStateOf(false) }
    var surface by remember { mutableStateOf<CadSurfaceView?>(null) }
    var extrusionHeight by remember { mutableFloatStateOf(1.0f) }
    var selectedFace by remember { mutableIntStateOf(-1) }

    MaterialTheme(colorScheme = darkColorScheme(
        background = Ink, surface = Panel, primary = Accent,
        onBackground = Color.White, onSurface = Color.White
    )) {
        Box(Modifier.fillMaxSize().background(Ink)) {
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
                            "Sólido" -> listOf("Extruir").forEach { ToolChip(it, panel==it) {
                                panel=it
                                if (it=="Extruir") surface?.extrudeSketch()
                            } }
                            "Transformar" -> listOf("Mover X", "Mover Z", "Rotar", "Escalar +", "Escalar -", "Restablecer").forEach { ToolChip(it, panel==it) {
                                panel=it
                                surface?.transform(it)
                            } }
                            else -> listOf("Ajustar vista").forEach { ToolChip(it, panel==it) {
                                panel=it
                                if (it=="Ajustar vista") surface?.resetView()
                            } }
                        }
                    }
                }
            }
            Text("Plano de trabajo vacío · Crea tu geometría con Croquis · Arrastra para orbitar · Pellizca para zoom", Modifier.align(Alignment.TopCenter).padding(top=74.dp)
                .background(Color(0x990B1018), RoundedCornerShape(20.dp)).padding(horizontal=12.dp, vertical=6.dp),
                color=Muted, fontSize=10.sp)
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
