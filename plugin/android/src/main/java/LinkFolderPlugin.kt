// Android side of the link-folder plugin: the shared Campaign Link folder,
// chosen once with the system folder picker (Storage Access Framework).
// Android keeps each app's own files private, but two apps that were each
// given the same folder can both read and write everything inside it.

package app.campaignlink.folder

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.result.ActivityResult
import androidx.documentfile.provider.DocumentFile
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import java.util.concurrent.Executors

@InvokeArg
class PathArgs {
  lateinit var path: String
}

@InvokeArg
class WriteArgs {
  lateinit var path: String
  lateinit var text: String
}

/** Where the chosen folder is remembered between runs. */
private const val PREFS = "campaign-link-folder"
private const val KEY_FOLDER = "folder"

/** Read and write access, kept across restarts. */
private const val ACCESS = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION

@TauriPlugin
class LinkFolderPlugin(private val activity: Activity) : Plugin(activity) {
  /** File work happens here, one task at a time: off the UI thread, and writes never overlap. */
  private val io = Executors.newSingleThreadExecutor()

  private val prefs get() = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
  private val resolver get() = activity.contentResolver

  /** Shows the system folder picker. */
  @Command
  fun pickFolder(invoke: Invoke) {
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).addFlags(ACCESS or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
    startActivityForResult(invoke, intent, "folderPicked")
  }

  @ActivityCallback
  fun folderPicked(invoke: Invoke, result: ActivityResult) {
    val uri = result.data?.data
    if (result.resultCode != Activity.RESULT_OK || uri == null) {
      invoke.resolve(JSObject()) // cancelled: no folder
      return
    }
    try {
      resolver.takePersistableUriPermission(uri, ACCESS)
      // Let go of a folder chosen before, so access doesn't pile up.
      savedUri()?.takeIf { it != uri }?.let { old ->
        try { resolver.releasePersistableUriPermission(old, ACCESS) } catch (_: Exception) {}
      }
      prefs.edit().putString(KEY_FOLDER, uri.toString()).apply()
      invoke.resolve(JSObject().put("folder", describe(uri)))
    } catch (e: Exception) {
      invoke.reject("Couldn't keep access to that folder: ${e.message}")
    }
  }

  /** The folder chosen before, while the app still has access to it. */
  @Command
  fun getFolder(invoke: Invoke) {
    val uri = accessibleFolder()
    invoke.resolve(if (uri == null) JSObject() else JSObject().put("folder", describe(uri)))
  }

  /** A file's text by its path inside the folder; no text when it doesn't exist. */
  @Command
  fun readText(invoke: Invoke) {
    val args = invoke.parseArgs(PathArgs::class.java)
    io.execute {
      try {
        val root = root() ?: return@execute invoke.reject("No shared folder chosen")
        val file = find(root, segments(args.path))
        if (file == null || !file.isFile) {
          invoke.resolve(JSObject())
        } else {
          val text = resolver.openInputStream(file.uri)?.use { it.readBytes().toString(Charsets.UTF_8) }
          invoke.resolve(if (text == null) JSObject() else JSObject().put("text", text))
        }
      } catch (e: Exception) {
        invoke.reject("Couldn't read ${args.path}: ${e.message}")
      }
    }
  }

  /** Writes a file by its path inside the folder, creating sub-folders as needed. */
  @Command
  fun writeText(invoke: Invoke) {
    val args = invoke.parseArgs(WriteArgs::class.java)
    io.execute {
      try {
        val root = root() ?: return@execute invoke.reject("No shared folder chosen")
        val parts = segments(args.path)
        var dir = root
        for (name in parts.dropLast(1)) {
          dir = dir.findFile(name)?.takeIf { it.isDirectory }
            ?: dir.createDirectory(name)
            ?: throw IllegalStateException("couldn't create the folder $name")
        }
        val name = parts.last()
        val file = dir.findFile(name)?.takeIf { it.isFile }
          ?: dir.createFile("application/json", name)
          ?: throw IllegalStateException("couldn't create $name")
        // "wt": replace the whole file. The other app's readers cope with a file caught mid-write.
        resolver.openOutputStream(file.uri, "wt")?.use { it.write(args.text.toByteArray(Charsets.UTF_8)) }
          ?: throw IllegalStateException("couldn't open $name")
        invoke.resolve(JSObject())
      } catch (e: Exception) {
        invoke.reject("Couldn't write ${args.path}: ${e.message}")
      }
    }
  }

  private fun savedUri(): Uri? = prefs.getString(KEY_FOLDER, null)?.let(Uri::parse)

  /** The saved folder, if Android still lets this app read and write it (access can be revoked in Settings). */
  private fun accessibleFolder(): Uri? {
    val uri = savedUri() ?: return null
    val held = resolver.persistedUriPermissions.any { it.uri == uri && it.isReadPermission && it.isWritePermission }
    return if (held) uri else null
  }

  private fun root(): DocumentFile? = accessibleFolder()?.let { DocumentFile.fromTreeUri(activity, it) }

  private fun describe(uri: Uri): JSObject =
    JSObject().put("uri", uri.toString()).put("name", DocumentFile.fromTreeUri(activity, uri)?.name ?: "Shared folder")

  /** "a/b.json" → ["a", "b.json"]; refuses anything that could step outside the folder. */
  private fun segments(path: String): List<String> {
    val parts = path.split('/').filter { it.isNotEmpty() }
    require(parts.isNotEmpty() && parts.none { it == "." || it == ".." || it.contains('\\') }) { "not a usable path: $path" }
    return parts
  }

  private fun find(root: DocumentFile, parts: List<String>): DocumentFile? {
    var current: DocumentFile = root
    for (name in parts) current = current.findFile(name) ?: return null
    return current
  }
}
