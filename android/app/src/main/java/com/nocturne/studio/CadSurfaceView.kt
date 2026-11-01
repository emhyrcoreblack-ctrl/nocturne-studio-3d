package com.nocturne.studio

import android.content.Context
import android.opengl.GLSurfaceView
import android.view.MotionEvent
import kotlin.math.abs

class CadSurfaceView(context: Context) : GLSurfaceView(context) {
    private val cadRenderer = CadRenderer()
    private var lastX = 0f
    private var lastY = 0f
    private var lastSpan = 0f
    @Volatile private var sketchMode = false

    init {
        setEGLContextClientVersion(2)
        setRenderer(cadRenderer)
        renderMode = RENDERMODE_CONTINUOUSLY
        set背景()
    }

    private fun set背景() { setZOrderOnTop(false) }

    fun resetView() { queueEvent { cadRenderer.resetView() } }
    fun setPrimitive(type: Int) { sketchMode=false; queueEvent { cadRenderer.setPrimitive(type) } }
    fun setSketchMode(enabled: Boolean) { sketchMode=enabled }
    fun extrudeSketch() { sketchMode=false; queueEvent { cadRenderer.extrudeSketch() } }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                lastX = event.x; lastY = event.y
                if (sketchMode) queueEvent { cadRenderer.sketchTouch(event.x,event.y,true,false) }
                return true
            }
            MotionEvent.ACTION_POINTER_DOWN -> {
                lastSpan = span(event); return true
            }
            MotionEvent.ACTION_MOVE -> {
                if (sketchMode && event.pointerCount == 1) {
                    queueEvent { cadRenderer.sketchTouch(event.x,event.y,false,false) }
                } else if (event.pointerCount >= 2) {
                    val now = span(event)
                    if (lastSpan > 0f) {
                        val factor = (lastSpan / now.coerceAtLeast(1f)).coerceIn(.88f,1.12f)
                        queueEvent { cadRenderer.zoom(factor) }
                    }
                    lastSpan = now
                } else {
                    val dx = event.x-lastX; val dy=event.y-lastY
                    if (abs(dx)+abs(dy)>1f) queueEvent { cadRenderer.orbit(dx,dy) }
                }
                lastX=event.x; lastY=event.y
                return true
            }
            MotionEvent.ACTION_POINTER_UP -> { lastSpan=0f; return true }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> { if (sketchMode) queueEvent { cadRenderer.sketchTouch(event.x,event.y,false,true) }; lastSpan=0f; return true }
        }
        return true
    }

    private fun span(e: MotionEvent): Float {
        if (e.pointerCount<2) return 0f
        val dx=e.getX(0)-e.getX(1); val dy=e.getY(0)-e.getY(1)
        return kotlin.math.sqrt(dx*dx+dy*dy)
    }
}
