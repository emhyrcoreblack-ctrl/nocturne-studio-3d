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
        if (primitive==0) draw(cube,cubeCount,GLES20.GL_TRIANGLES)
        else draw(cylinder(),cylinder().size/7,GLES20.GL_TRIANGLES)
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
    fun setPrimitive(type:Int) { primitive=type.coerceIn(0,1) }

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
