package com.nocturne.studio

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import kotlin.math.cos
import kotlin.math.sin

class CadRenderer : GLSurfaceView.Renderer {
    @Volatile private var yaw = 0.72f
    @Volatile private var pitch = 0.48f
    @Volatile private var distance = 5.2f
    @Volatile private var primitive = 0
    private var program = 0
    private var position = 0
    private var color = 0
    private var mvpHandle = 0
    private val projection = FloatArray(16)
    private val view = FloatArray(16)
    private val model = FloatArray(16)
    private val vp = FloatArray(16)
    private val mvp = FloatArray(16)
    private lateinit var cube: FloatBuffer
    private lateinit var grid: FloatBuffer
    private var cubeCount = 0
    private var gridCount = 0
    private var viewportWidth = 1
    private var viewportHeight = 1
    private var sketchStart: FloatArray? = null
    private var sketchEnd: FloatArray? = null
    private var sketchDragging = false
    private var extruded = false

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES20.glClearColor(0.035f,0.052f,0.078f,1f)
        GLES20.glEnable(GLES20.GL_DEPTH_TEST)
        GLES20.glEnable(GLES20.GL_CULL_FACE)
        val vertex = "attribute vec3 aPosition; attribute vec4 aColor; uniform mat4 uMvp; varying vec4 vColor; void main(){ gl_Position=uMvp*vec4(aPosition,1.0); vColor=aColor; }"
        val fragment = "precision mediump float; varying vec4 vColor; void main(){ gl_FragColor=vColor; }"
        program = link(vertex,fragment)
        position=GLES20.glGetAttribLocation(program,"aPosition")
        color=GLES20.glGetAttribLocation(program,"aColor")
        mvpHandle=GLES20.glGetUniformLocation(program,"uMvp")
        cube=buffer(cubeVertices()); cubeCount=cubeVertices().size/7
        grid=buffer(gridVertices()); gridCount=gridVertices().size/7
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        viewportWidth = width.coerceAtLeast(1); viewportHeight = height.coerceAtLeast(1)
        GLES20.glViewport(0,0,width,height)
        Matrix.perspectiveM(projection,0,42f,width.toFloat()/height.coerceAtLeast(1),.1f,100f)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)
        val cx=(distance*cos(pitch)*sin(yaw))
        val cy=(distance*sin(pitch))
        val cz=(distance*cos(pitch)*cos(yaw))
        Matrix.setLookAtM(view,0,cx,cy,cz,0f,0f,0f,0f,1f,0f)
        Matrix.setIdentityM(model,0)
        Matrix.multiplyMM(vp,0,projection,0,view,0)
        Matrix.multiplyMM(mvp,0,vp,0,model,0)
        GLES20.glUseProgram(program)
        GLES20.glUniformMatrix4fv(mvpHandle,1,false,mvp,0)
        draw(grid,gridCount,GLES20.GL_LINES)
        if (extruded && sketchStart != null && sketchEnd != null) {
            val mesh = buffer(extrusionVertices(sketchStart!!, sketchEnd!!, 1.0f))
            GLES20.glDisable(GLES20.GL_CULL_FACE); draw(mesh, mesh.limit()/7, GLES20.GL_TRIANGLES); GLES20.glEnable(GLES20.GL_CULL_FACE)
        } else if (primitive==0) draw(cube,cubeCount,GLES20.GL_TRIANGLES)
        else { val mesh = cylinder(); draw(mesh,mesh.limit()/7,GLES20.GL_TRIANGLES) }
        if (sketchStart != null && sketchEnd != null && !extruded) {
            val outline = buffer(rectangleLines(sketchStart!!, sketchEnd!!))
            GLES20.glLineWidth(3f); draw(outline, outline.limit()/7, GLES20.GL_LINES)
        }
    }

    private fun draw(data: FloatBuffer,count:Int,mode:Int) {
        data.position(0)
        GLES20.glEnableVertexAttribArray(position); GLES20.glEnableVertexAttribArray(color)
        GLES20.glVertexAttribPointer(position,3,GLES20.GL_FLOAT,false,28,data)
        data.position(3)
        GLES20.glVertexAttribPointer(color,4,GLES20.GL_FLOAT,false,28,data)
        GLES20.glDrawArrays(mode,0,count)
        GLES20.glDisableVertexAttribArray(position); GLES20.glDisableVertexAttribArray(color)
    }

    fun orbit(dx:Float,dy:Float) { yaw-=dx*.008f; pitch=(pitch+dy*.008f).coerceIn(-1.35f,1.35f) }
    fun zoom(factor:Float) { distance=(distance*factor).coerceIn(2.0f,18f) }
    fun resetView() { yaw=.72f; pitch=.48f; distance=5.2f; primitive=0 }
    fun setPrimitive(type:Int) { primitive=type.coerceIn(0,1); extruded=false; sketchStart=null; sketchEnd=null }
    fun sketchTouch(x:Float,y:Float,down:Boolean,finish:Boolean) {
        val p = screenToGround(x,y) ?: return
        if (down) { sketchStart=p; sketchEnd=p; sketchDragging=true; extruded=false }
        else if (sketchDragging) { sketchEnd=p; if (finish) sketchDragging=false }
    }
    fun extrudeSketch() { if (sketchStart != null && sketchEnd != null) { extruded=true; primitive=2 } }
    private fun screenToGround(x:Float,y:Float):FloatArray? {
        val inv=FloatArray(16); if (!Matrix.invertM(inv,0,vp,0)) return null
        val nx=2f*x/viewportWidth-1f; val ny=1f-2f*y/viewportHeight
        val near=FloatArray(4); val far=FloatArray(4)
        Matrix.multiplyMV(near,0,inv,0,floatArrayOf(nx,ny,-1f,1f),0)
        Matrix.multiplyMV(far,0,inv,0,floatArrayOf(nx,ny,1f,1f),0)
        if (near[3]==0f || far[3]==0f) return null
        for(i in 0..2) { near[i]/=near[3]; far[i]/=far[3] }
        val dy=far[1]-near[1]; if (kotlin.math.abs(dy)<0.0001f) return null
        val t=-near[1]/dy; if (t<0f) return null
        return floatArrayOf(near[0]+t*(far[0]-near[0]),0f,near[2]+t*(far[2]-near[2]))
    }
    private fun rectangleLines(a:FloatArray,b:FloatArray):FloatArray {
        val x0=a[0]; val z0=a[2]; val x1=b[0]; val z1=b[2]
        val c=floatArrayOf(.35f,.78f,1f,1f); val o=ArrayList<Float>()
        val p=arrayOf(floatArrayOf(x0,0f,z0),floatArrayOf(x1,0f,z0),floatArrayOf(x1,0f,z1),floatArrayOf(x0,0f,z1))
        for(i in 0..3) { val q=p[i]; val r=p[(i+1)%4]; add(o,q[0],q[1],q[2],c); add(o,r[0],r[1],r[2],c) }
        return o.toFloatArray()
    }
    private fun extrusionVertices(a:FloatArray,b:FloatArray,h:Float):FloatArray {
        val x0=minOf(a[0],b[0]); val x1=maxOf(a[0],b[0]); val z0=minOf(a[2],b[2]); val z1=maxOf(a[2],b[2])
        val p=arrayOf(floatArrayOf(x0,0f,z0),floatArrayOf(x1,0f,z0),floatArrayOf(x1,0f,z1),floatArrayOf(x0,0f,z1),
            floatArrayOf(x0,h,z0),floatArrayOf(x1,h,z0),floatArrayOf(x1,h,z1),floatArrayOf(x0,h,z1))
        val faces=arrayOf(intArrayOf(0,1,5,0,5,4),intArrayOf(1,2,6,1,6,5),intArrayOf(2,3,7,2,7,6),intArrayOf(3,0,4,3,4,7),intArrayOf(4,5,6,4,6,7),intArrayOf(0,2,1,0,3,2))
        val o=ArrayList<Float>(); val c=floatArrayOf(.25f,.57f,.88f,1f)
        for(face in faces) for(i in face) { val v=p[i]; add(o,v[0],v[1],v[2],c) }
        return o.toFloatArray()
    }

    private fun buffer(values:FloatArray):FloatBuffer = ByteBuffer.allocateDirect(values.size*4).order(ByteOrder.nativeOrder()).asFloatBuffer().apply { put(values); position(0) }
    private fun link(v:String,f:String):Int {
        fun shader(type:Int,src:String):Int { val s=GLES20.glCreateShader(type); GLES20.glShaderSource(s,src); GLES20.glCompileShader(s); return s }
        val vs=shader(GLES20.GL_VERTEX_SHADER,v); val fs=shader(GLES20.GL_FRAGMENT_SHADER,f)
        return GLES20.glCreateProgram().also { GLES20.glAttachShader(it,vs); GLES20.glAttachShader(it,fs); GLES20.glLinkProgram(it) }
    }

    private fun gridVertices():FloatArray {
        val out=ArrayList<Float>()
        for(i in -10..10) {
            val c=if(i==0) floatArrayOf(.30f,.48f,.68f,.8f) else floatArrayOf(.18f,.25f,.34f,.55f)
            add(out,-10f,0f,i.toFloat(),c); add(out,10f,0f,i.toFloat(),c)
            add(out,i.toFloat(),0f,-10f,c); add(out,i.toFloat(),0f,10f,c)
        }
        return out.toFloatArray()
    }
    private fun cubeVertices():FloatArray {
        val out=ArrayList<Float>()
        val faces=listOf(
            Triple(floatArrayOf(0f,0f,1f,.95f), arrayOf(floatArrayOf(-1f,-1f,1f),floatArrayOf(1f,-1f,1f),floatArrayOf(1f,1f,1f),floatArrayOf(-1f,1f,1f)),0),
            Triple(floatArrayOf(.45f,.68f,.95f,.95f), arrayOf(floatArrayOf(1f,-1f,-1f),floatArrayOf(-1f,-1f,-1f),floatArrayOf(-1f,1f,-1f),floatArrayOf(1f,1f,-1f)),0),
            Triple(floatArrayOf(.25f,.48f,.78f,.95f), arrayOf(floatArrayOf(-1f,1f,1f),floatArrayOf(1f,1f,1f),floatArrayOf(1f,1f,-1f),floatArrayOf(-1f,1f,-1f)),0),
            Triple(floatArrayOf(.16f,.34f,.58f,.95f), arrayOf(floatArrayOf(-1f,-1f,-1f),floatArrayOf(1f,-1f,-1f),floatArrayOf(1f,-1f,1f),floatArrayOf(-1f,-1f,1f)),0),
            Triple(floatArrayOf(.35f,.57f,.86f,.95f), arrayOf(floatArrayOf(1f,-1f,1f),floatArrayOf(1f,-1f,-1f),floatArrayOf(1f,1f,-1f),floatArrayOf(1f,1f,1f)),0),
            Triple(floatArrayOf(.22f,.42f,.70f,.95f), arrayOf(floatArrayOf(-1f,-1f,-1f),floatArrayOf(-1f,-1f,1f),floatArrayOf(-1f,1f,1f),floatArrayOf(-1f,1f,-1f)),0)
        )
        for((c,p,_) in faces) { val ids=intArrayOf(0,1,2,0,2,3); for(i in ids) add(out,p[i][0],p[i][1],p[i][2],c) }
        return out.toFloatArray()
    }
    private fun cylinder():FloatBuffer {
        val out=ArrayList<Float>(); val n=48
        for(i in 0 until n) {
            val a=i*2*Math.PI/n; val b=(i+1)*2*Math.PI/n
            val p0=floatArrayOf(kotlin.math.cos(a).toFloat(),-1f,kotlin.math.sin(a).toFloat())
            val p1=floatArrayOf(kotlin.math.cos(b).toFloat(),-1f,kotlin.math.sin(b).toFloat())
            val p2=floatArrayOf(p1[0],1f,p1[2]); val p3=floatArrayOf(p0[0],1f,p0[2])
            val c=floatArrayOf(.25f,.58f,.82f,1f)
            for(p in listOf(p0,p1,p2,p0,p2,p3)) add(out,p[0],p[1],p[2],c)
        }
        return buffer(out.toFloatArray())
    }
    private fun add(out:MutableList<Float>,x:Float,y:Float,z:Float,c:FloatArray) { out.add(x);out.add(y);out.add(z);out.addAll(c.toList()) }
}
