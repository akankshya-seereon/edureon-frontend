import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  UploadCloud,
  Link2,
  Video,
  CheckCircle2,
  AlertCircle,
  Play,
  Trash2,
  Youtube,
  Globe,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getVideoMeta = (url) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    const id = trimmed.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    return id
      ? {
          platform: "YouTube",
          embedUrl: `https://www.youtube.com/embed/${id}`,
          thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        }
      : null;
  }
  if (trimmed.includes("vimeo.com")) {
    const id = trimmed.match(/vimeo\.com\/(\d+)/)?.[1];
    return id
      ? { platform: "Vimeo", embedUrl: `https://player.vimeo.com/video/${id}`, thumbnail: null }
      : null;
  }
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { platform: "Direct", embedUrl: trimmed, thumbnail: null };
  }
  return null;
};

const TABS = [
  { id: "upload", label: "Upload File", Icon: UploadCloud },
  { id: "url",    label: "Paste URL",   Icon: Link2       },
];

// ── Video Preview ──────────────────────────────────────────────────────────────

const VideoPreview = ({ src, thumbnail, platform }) => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => { setPlaying(false); }, [src]);

  if (!src) return null;

  if (platform === "YouTube" || platform === "Vimeo") {
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
        {!playing ? (
          <div className="relative w-full h-full cursor-pointer group" onClick={() => setPlaying(true)}>
            {thumbnail ? (
              <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3">
              <span className="text-sm bg-black/60 text-white px-2 py-1 rounded font-medium">{platform}</span>
            </div>
          </div>
        ) : (
          <iframe
            src={`${src}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="video-preview"
          />
        )}
      </div>
    );
  }

  // Native video — uploaded file blob URL or direct mp4 link
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
      <video
        key={src}
        src={src}
        controls
        className="w-full h-full"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// ── Upload Progress Bar ────────────────────────────────────────────────────────

const UploadProgress = ({ fileName, fileSize, progress, status, onRemove }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
      <Video className="w-5 h-5 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <p className="text-md font-medium text-gray-800 truncate pr-2">{fileName}</p>
        <span className="text-sm text-gray-400 flex-shrink-0">{fileSize}</span>
      </div>
      {status === "uploading" && (
        <>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">{progress}% uploaded</p>
        </>
      )}
      {status === "done" && (
        <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ready to add
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-1 text-sm text-red-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          Upload failed — try again
        </div>
      )}
    </div>
    <button onClick={onRemove} className="text-gray-300 hover:text-red-500 transition flex-shrink-0">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

// ── Main Modal ─────────────────────────────────────────────────────────────────

export const VideoUploadModal = ({ open, onClose, onConfirm, moduleTitle = "Module" }) => {
  const [tab,          setTab]         = useState("upload");
  const [dragging,     setDragging]    = useState(false);

  // Upload tab
  const [uploadFile,   setUploadFile]  = useState(null);
  const [objectUrl,    setObjectUrl]   = useState(null);   // ONE stable blob URL stored in state
  const [progress,     setProgress]    = useState(0);
  const [uploadStatus, setUploadStatus]= useState(null);   // null | uploading | done | error

  // URL tab
  const [urlInput,     setUrlInput]    = useState("");
  const [urlError,     setUrlError]    = useState("");
  const [videoMeta,    setVideoMeta]   = useState(null);

  // Shared
  const [label,        setLabel]       = useState("");

  const fileInputRef = useRef(null);
  const timerRef     = useRef(null);

  // ── Process a selected File ────────────────────────────────────────────

  const processFile = (file) => {
    if (!file) return;

    const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
    const validExt   = /\.(mp4|webm|ogg|mov|avi)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !validExt) {
      alert("Please select a valid video file: MP4, WebM, OGG, MOV, or AVI.");
      return;
    }

    // Revoke any previous blob URL
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    clearInterval(timerRef.current);

    // Create ONE stable blob URL and store in state
    const blobUrl = URL.createObjectURL(file);

    setUploadFile(file);
    setObjectUrl(blobUrl);
    setUploadStatus("uploading");
    setProgress(0);
    setLabel(file.name.replace(/\.[^/.]+$/, ""));

    // Simulate upload progress
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.floor(Math.random() * 10) + 5;
      if (p >= 100) {
        clearInterval(timerRef.current);
        setProgress(100);
        setUploadStatus("done");
      } else {
        setProgress(p);
      }
    }, 150);
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []); // processFile uses setState setters which are stable

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ""; // allow re-selecting same file
  };

  const clearUpload = () => {
    clearInterval(timerRef.current);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setUploadFile(null);
    setObjectUrl(null);
    setUploadStatus(null);
    setProgress(0);
    setLabel("");
  };

  // ── URL tab ────────────────────────────────────────────────────────────

  const handleUrlCheck = () => {
    setUrlError("");
    const meta = getVideoMeta(urlInput);
    if (!meta) {
      setUrlError("Couldn't detect a valid video URL. Try a YouTube, Vimeo, or direct .mp4 link.");
      setVideoMeta(null);
      return;
    }
    setVideoMeta(meta);
    if (!label) {
      setLabel(
        meta.platform === "YouTube" ? "YouTube Video"
        : meta.platform === "Vimeo" ? "Vimeo Video"
        : "Video"
      );
    }
  };

  // ── Confirm ────────────────────────────────────────────────────────────

  const canConfirm =
    (tab === "upload" && uploadStatus === "done" && objectUrl) ||
    (tab === "url"    && videoMeta !== null);

  const handleConfirm = () => {
    if (!canConfirm) return;

    onConfirm({
      type:     "video",
      label:    label.trim() || "Untitled Video",
      url:      tab === "upload" ? objectUrl : videoMeta.embedUrl,
      fileSize: uploadFile ? formatBytes(uploadFile.size) : undefined,
      platform: tab === "upload" ? "Upload" : videoMeta.platform,
    });

    // Intentionally NOT revoking objectUrl — parent now owns it
    resetState(false);
    onClose();
  };

  const handleClose = () => {
    // Revoke since user cancelled
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    clearInterval(timerRef.current);
    resetState(true);
    onClose();
  };

  const resetState = (revokeUrl = false) => {
    clearInterval(timerRef.current);
    if (revokeUrl && objectUrl) URL.revokeObjectURL(objectUrl);
    setTab("upload");
    setDragging(false);
    setUploadFile(null);
    setObjectUrl(null);
    setProgress(0);
    setUploadStatus(null);
    setUrlInput("");
    setUrlError("");
    setVideoMeta(null);
    setLabel("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  if (!open) return null;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden text-left">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add Video</h2>
            <p className="text-sm text-gray-400 mt-0.5">to {moduleTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
          {TABS.map(({ id, label: tLabel, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-md font-medium border-b-2 -mb-px transition ${
                tab === id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tLabel}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* UPLOAD TAB */}
          {tab === "upload" && (
            <>
              {!uploadFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-12 px-6 cursor-pointer transition ${
                    dragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${dragging ? "bg-blue-100" : "bg-gray-100"}`}>
                    <UploadCloud className={`w-7 h-7 transition ${dragging ? "text-blue-600" : "text-gray-400"}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-md font-semibold text-gray-700">
                      {dragging ? "Drop to upload" : "Drag & drop your video here"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse · MP4, WebM, MOV, AVI</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,.mp4,.webm,.ogg,.mov,.avi"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              ) : (
                <>
                  <UploadProgress
                    fileName={uploadFile.name}
                    fileSize={formatBytes(uploadFile.size)}
                    progress={progress}
                    status={uploadStatus}
                    onRemove={clearUpload}
                  />
                  {/* Preview uses the STABLE objectUrl from state — never re-created */}
                  {uploadStatus === "done" && objectUrl && (
                    <VideoPreview src={objectUrl} platform="Direct" />
                  )}
                </>
              )}
            </>
          )}

          {/* URL TAB */}
          {tab === "url" && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: "YouTube", Icon: Youtube, color: "bg-red-50 text-red-600 border-red-100" },
                  { label: "Vimeo",   Icon: Play,    color: "bg-blue-50 text-blue-600 border-blue-100" },
                  { label: "Direct",  Icon: Globe,   color: "bg-gray-50 text-gray-600 border-gray-100" },
                ].map(({ label: pl, Icon, color }) => (
                  <span key={pl} className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full border ${color}`}>
                    <Icon className="w-3 h-3" />
                    {pl}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); setVideoMeta(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlCheck()}
                  placeholder="https://youtube.com/watch?v=... or direct .mp4 URL"
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-md outline-none focus:ring-2 transition ${
                    urlError
                      ? "border-red-300 bg-red-50 focus:ring-red-100"
                      : "border-gray-200 bg-gray-50 focus:ring-blue-100 focus:border-blue-400"
                  }`}
                />
                <button
                  onClick={handleUrlCheck}
                  className="px-4 py-2.5 bg-blue-600 text-white text-md font-semibold rounded-xl hover:bg-blue-700 transition flex-shrink-0"
                >
                  Preview
                </button>
              </div>

              {urlError && (
                <p className="flex items-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {urlError}
                </p>
              )}

              {videoMeta && (
                <>
                  <VideoPreview src={videoMeta.embedUrl} thumbnail={videoMeta.thumbnail} platform={videoMeta.platform} />
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {videoMeta.platform} video detected
                  </div>
                </>
              )}
            </>
          )}

          {/* Video title field */}
          {((tab === "upload" && uploadStatus === "done") || (tab === "url" && videoMeta)) && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Video Title
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Give this video a title..."
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-5 py-2 border border-gray-200 rounded-xl text-md text-gray-600 hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-6 py-2 bg-blue-600 text-white text-md font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Add Video to Module
          </button>
        </div>

      </div>
    </div>
  );
};