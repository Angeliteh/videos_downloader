package com.example.app_download_videos_flutter

import android.content.ContentValues
import android.content.Context
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.example.app_download_videos_flutter/download"

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "saveVideoToGallery" -> {
                    val sourcePath = call.argument<String>("sourcePath")
                    val fileName = call.argument<String>("fileName")
                    
                    if (sourcePath != null && fileName != null) {
                        try {
                            val savedPath = saveVideoToGallery(sourcePath, fileName)
                            if (savedPath != null) {
                                result.success(savedPath)
                            } else {
                                result.error("SAVE_FAILED", "No se pudo guardar el video en la galería", null)
                            }
                        } catch (e: Exception) {
                            result.error("SAVE_FAILED", "Error al guardar el video: ${e.message}", null)
                        }
                    } else {
                        result.error("INVALID_ARGUMENTS", "Faltan argumentos necesarios", null)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun saveVideoToGallery(sourcePath: String, fileName: String): String? {
        val sourceFile = File(sourcePath)
        
        if (!sourceFile.exists()) {
            Log.e("VideoDownloader", "El archivo de origen no existe: $sourcePath")
            return null
        }
        
        try {
            var uri: Uri? = null
            var outputStream: FileOutputStream? = null
            var videoPath: String? = null
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // En Android 10 y superior, usamos MediaStore API
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, "video/mp4")
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_MOVIES)
                    put(MediaStore.Video.Media.IS_PENDING, 1)
                }
                
                val contentResolver = context.contentResolver
                uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues)
                
                if (uri != null) {
                    outputStream = contentResolver.openOutputStream(uri) as FileOutputStream?
                    
                    if (outputStream != null) {
                        val inputStream = FileInputStream(sourceFile)
                        val buffer = ByteArray(1024)
                        var bytesRead: Int
                        
                        while (inputStream.read(buffer).also { bytesRead = it } > 0) {
                            outputStream.write(buffer, 0, bytesRead)
                        }
                        
                        inputStream.close()
                        outputStream.close()
                        
                        contentValues.clear()
                        contentValues.put(MediaStore.Video.Media.IS_PENDING, 0)
                        contentResolver.update(uri, contentValues, null, null)
                        
                        // Obtener la ruta completa del archivo para devolverla
                        videoPath = getPathFromUri(uri)
                    }
                }
            } else {
                // Para versiones anteriores a Android 10
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES)
                val destFile = File(downloadsDir, fileName)
                
                sourceFile.copyTo(destFile, true)
                
                // Notificar al escáner de medios para que actualice la galería
                MediaScannerConnection.scanFile(
                    context,
                    arrayOf(destFile.absolutePath),
                    arrayOf("video/mp4"),
                    null
                )
                
                videoPath = destFile.absolutePath
            }
            
            return videoPath
        } catch (e: IOException) {
            Log.e("VideoDownloader", "Error al guardar el video: ${e.message}")
            e.printStackTrace()
            return null
        }
    }
    
    private fun getPathFromUri(uri: Uri): String? {
        val projection = arrayOf(MediaStore.Video.Media.DATA)
        val cursor = contentResolver.query(uri, projection, null, null, null)
        
        return cursor?.use {
            val columnIndex = it.getColumnIndexOrThrow(MediaStore.Video.Media.DATA)
            it.moveToFirst()
            it.getString(columnIndex)
        }
    }
}
