package com.classai.app.ui.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.Image
import com.classai.app.di.AppContainer
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream

private sealed interface PdfLoadState {
    data object Loading : PdfLoadState
    data class Ready(val file: File, val pageCount: Int, val page: Bitmap) : PdfLoadState
    data class Error(val message: String) : PdfLoadState
}

private fun resolvedUrl(url: String): String =
    if (url.startsWith("http://") || url.startsWith("https://")) url
    else BuildConfig.CLASSAI_API_BASE_URL.trimEnd('/') + "/" + url.trimStart('/')

private suspend fun downloadPdf(context: Context, url: String): File = withContext(Dispatchers.IO) {
    val requestBuilder = Request.Builder().url(resolvedUrl(url))
    AppContainer.authToken()?.let { requestBuilder.header("Authorization", "Bearer $it") }
    OkHttpClient().newCall(requestBuilder.build()).execute().use { response ->
        if (!response.isSuccessful) error("Could not load lecture PDF (${response.code})")
        val body = response.body ?: error("The PDF response was empty")
        val file = File(context.cacheDir, "classai-${url.hashCode()}.pdf")
        body.byteStream().use { input -> FileOutputStream(file).use { input.copyTo(it) } }
        file
    }
}

private suspend fun renderPdfPage(file: File, requestedPage: Int): Triple<Int, Int, Bitmap> = withContext(Dispatchers.IO) {
    ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY).use { descriptor ->
        PdfRenderer(descriptor).use { renderer ->
            val pageIndex = requestedPage.coerceIn(0, (renderer.pageCount - 1).coerceAtLeast(0))
            renderer.openPage(pageIndex).use { page ->
                val scale = 2
                val bitmap = Bitmap.createBitmap(page.width * scale, page.height * scale, Bitmap.Config.ARGB_8888)
                bitmap.eraseColor(android.graphics.Color.WHITE)
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                Triple(pageIndex, renderer.pageCount, bitmap)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfViewerScreen(title: String, url: String, onNavigateBack: () -> Unit) {
    val context = LocalContext.current
    var requestedPage by remember(url) { mutableIntStateOf(0) }
    var state by remember(url) { mutableStateOf<PdfLoadState>(PdfLoadState.Loading) }
    var cachedFile by remember(url) { mutableStateOf<File?>(null) }

    LaunchedEffect(url) {
        state = PdfLoadState.Loading
        cachedFile = runCatching { downloadPdf(context, url) }
            .onFailure { state = PdfLoadState.Error(it.message ?: "Could not download the PDF") }
            .getOrNull()
    }
    LaunchedEffect(cachedFile, requestedPage) {
        val file = cachedFile ?: return@LaunchedEffect
        state = runCatching {
            val (page, pageCount, bitmap) = renderPdfPage(file, requestedPage)
            requestedPage = page
            PdfLoadState.Ready(file, pageCount, bitmap)
        }.getOrElse { PdfLoadState.Error(it.message ?: "Could not render the PDF") }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title, maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).padding(padding).padding(12.dp).testTag("pdf_viewer_screen"),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                when (val current = state) {
                    PdfLoadState.Loading -> CircularProgressIndicator()
                    is PdfLoadState.Error -> Text(current.message, color = MaterialTheme.colorScheme.error)
                    is PdfLoadState.Ready -> Image(
                        bitmap = current.page.asImageBitmap(),
                        contentDescription = "PDF page ${requestedPage + 1}",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit
                    )
                }
            }
            if (state is PdfLoadState.Ready) {
                val current = state as PdfLoadState.Ready
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    OutlinedButton(onClick = { requestedPage-- }, enabled = requestedPage > 0) { Text("Previous") }
                    Text("Page ${requestedPage + 1} / ${current.pageCount}")
                    Button(onClick = { requestedPage++ }, enabled = requestedPage < current.pageCount - 1) { Text("Next") }
                }
            }
        }
    }
}
