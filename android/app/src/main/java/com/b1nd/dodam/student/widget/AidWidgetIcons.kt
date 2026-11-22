package com.b1nd.dodam.student.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import java.net.URI
import java.net.URISyntaxException
import java.security.MessageDigest
import javax.net.ssl.HttpsURLConnection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

internal object AidWidgetIcons {
  private const val MAX_ICON_SIZE = 144
  private const val MAX_DOWNLOAD_BYTES = 2 * 1024 * 1024
  private const val TIMEOUT_MS = 4_000

  suspend fun load(context: Context, url: String): Bitmap? = withContext(Dispatchers.IO) {
    val uri = try {
      URI(url)
    } catch (_: URISyntaxException) {
      return@withContext null
    }
    if (!uri.scheme.equals("https", ignoreCase = true) || uri.host.isNullOrBlank() || uri.userInfo != null) {
      return@withContext null
    }

    val filename = MessageDigest.getInstance("SHA-256")
      .digest(url.toByteArray()).joinToString("") { "%02x".format(it) }
    val directory = File(context.cacheDir, "aid-widget-icons")
    val cached = File(directory, "$filename.png")
    if (cached.isFile) BitmapFactory.decodeFile(cached.path)?.let { return@withContext it }

    val bytes = try {
      download(uri)
    } catch (_: IOException) {
      null
    } ?: return@withContext null

    val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
    if (options.outWidth <= 0 || options.outHeight <= 0) return@withContext null
    var sampleSize = 1
    while (maxOf(options.outWidth, options.outHeight) / sampleSize > MAX_ICON_SIZE) sampleSize *= 2
    options.inJustDecodeBounds = false
    options.inSampleSize = sampleSize
    val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options) ?: return@withContext null

    try {
      directory.mkdirs()
      val temporary = File.createTempFile("aid-icon-", ".png", directory)
      try {
        val saved = temporary.outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
        if (saved) temporary.renameTo(cached)
      } finally {
        temporary.delete()
      }
    } catch (_: IOException) {
      // Display the decoded icon even if the disk cache is unavailable.
    }
    bitmap
  }

  private fun download(uri: URI): ByteArray? {
    val connection = uri.toURL().openConnection() as HttpsURLConnection
    connection.connectTimeout = TIMEOUT_MS
    connection.readTimeout = TIMEOUT_MS
    try {
      if (connection.responseCode !in 200..299 || connection.contentLengthLong > MAX_DOWNLOAD_BYTES) return null

      return connection.inputStream.use { input ->
        val output = ByteArrayOutputStream()
        val buffer = ByteArray(8192)
        while (true) {
          val count = input.read(buffer)
          if (count == -1) break
          if (output.size() + count > MAX_DOWNLOAD_BYTES) return null
          output.write(buffer, 0, count)
        }
        output.toByteArray()
      }
    } finally {
      connection.disconnect()
    }
  }
}
