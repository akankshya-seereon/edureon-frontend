import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FileText,
  Video,
  Link2,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  BookOpen,
  Clock,
  GraduationCap,
} from "lucide-react";

// ── Sample Data ────────────────────────────────────────────────────────────────

const SAMPLE_COURSE = {
  courseTitle: "Advanced Mathematics",
  subject: "Mathematics",
  class: "Grade 10-A",
  academicYear: "2025-2026",
  modulesData: [
    {
      id: 1,
      title: "Introduction & Foundations",
      contents: [
        {
          id: 11,
          type: "video",
          label: "Welcome to the Course",
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
          duration: "3:24",
          completed: true,
        },
        {
          id: 12,
          type: "video",
          label: "Core Concepts Overview",
          url: "https://www.w3schools.com/html/movie.mp4",
          duration: "5:10",
          completed: true,
        },
        {
          id: 13,
          type: "document",
          label: "Course Syllabus",
          url: "#",
          duration: null,
          completed: false,
        },
      ],
    },
    {
      id: 2,
      title: "Core Theory",
      contents: [
        {
          id: 21,
          type: "video",
          label: "Algebraic Expressions",
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
          duration: "8:45",
          completed: false,
        },
        {
          id: 22,
          type: "link",
          label: "Reference Guide",
          url: "https://example.com",
          duration: null,
          completed: false,
        },
        {
          id: 23,
          type: "video",
          label: "Solving Equations",
          url: "https://www.w3schools.com/html/movie.mp4",
          duration: "6:30",
          completed: false,
        },
      ],
    },
    {
      id: 3,
      title: "Applied Practice",
      contents: [
        {
          id: 31,
          type: "upload",
          label: "Exercise Sheet 1",
          url: "#",
          duration: null,
          completed: false,
        },
        {
          id: 32,
          type: "video",
          label: "Worked Examples",
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
          duration: "10:15",
          completed: false,
        },
      ],
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const ContentTypeIcon = ({ type, className = "w-4 h-4" }) => {
  const map = {
    video:    { Icon: Video,       color: "text-purple-500" },
    document: { Icon: FileText,    color: "text-blue-500"   },
    link:     { Icon: Link2,       color: "text-yellow-500" },
    upload:   { Icon: UploadCloud, color: "text-green-500"  },
  };
  const { Icon, color } = map[type] ?? map.document;
  return <Icon className={`${className} ${color}`} />;
};

const formatTime = (secs) => {
  if (isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// ── Custom Video Player ────────────────────────────────────────────────────────

const VideoPlayer = ({ src, title }) => {
  const videoRef  = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);
  const containerRef = useRef(null);

  // Reset on src change
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    setCurrent(videoRef.current?.currentTime ?? 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration ?? 0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    videoRef.current.currentTime = newTime;
    setCurrent(newTime);
  };

  const handleVolumeToggle = () => {
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  // Check if it's a YouTube/Vimeo URL
  const isYoutube = src?.includes("youtube.com") || src?.includes("youtu.be");
  const isVimeo   = src?.includes("vimeo.com");

  const getEmbedUrl = () => {
    if (isYoutube) {
      const id = src.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
      return `https://www.youtube.com/embed/${id}?autoplay=0`;
    }
    if (isVimeo) {
      const id = src.match(/vimeo\.com\/(\d+)/)?.[1];
      return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  if (embedUrl) {
    return (
      <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden group cursor-pointer"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Big play button overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 transition">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer relative group/bar"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-500 rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition" />
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-blue-300 transition">
              {playing
                ? <Pause  className="w-5 h-5 fill-white" />
                : <Play   className="w-5 h-5 fill-white" />
              }
            </button>
            <button onClick={handleVolumeToggle} className="text-white hover:text-blue-300 transition">
              {muted
                ? <VolumeX className="w-4 h-4" />
                : <Volume2 className="w-4 h-4" />
              }
            </button>
            <span className="text-white/80 text-sm font-mono">
              {formatTime(current)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={handleFullscreen} className="text-white hover:text-blue-300 transition">
            {fullscreen
              ? <Minimize className="w-4 h-4" />
              : <Maximize className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Non-video Content Placeholder ─────────────────────────────────────────────

const ContentPlaceholder = ({ item }) => {
  const configs = {
    document: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: "bg-blue-100 text-blue-600",
      label: "Open Document",
      desc: "Click below to open or download this document.",
    },
    link: {
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      icon: "bg-yellow-100 text-yellow-600",
      label: "Open Link",
      desc: "This item links to an external resource.",
    },
    upload: {
      bg: "bg-green-50",
      border: "border-green-100",
      icon: "bg-green-100 text-green-600",
      label: "Download File",
      desc: "Click below to download this file.",
    },
  };
  const c = configs[item.type] ?? configs.document;
  const Icon = { document: FileText, link: Link2, upload: UploadCloud }[item.type] ?? FileText;

  return (
    <div
      className={`w-full rounded-xl border ${c.border} ${c.bg} flex flex-col items-center justify-center gap-4 py-16`}
      style={{ aspectRatio: "16/9" }}
    >
      <div className={`w-16 h-16 rounded-2xl ${c.icon} flex items-center justify-center`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-center">
        <p className="text-md font-semibold text-gray-800">{item.label}</p>
        <p className="text-sm text-gray-500 mt-1">{c.desc}</p>
      </div>
      <a
        href={item.url || "#"}
        target="_blank"
        rel="noreferrer"
        className="px-5 py-2 bg-white border border-gray-200 rounded-lg text-md font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
      >
        {c.label}
      </a>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const ModuleContent = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const course  = state?.course  ?? SAMPLE_COURSE;
  const initMod = state?.moduleId ?? course.modulesData[0]?.id;
  const initCon = state?.contentId ?? course.modulesData[0]?.contents[0]?.id;

  const [activeModuleId,  setActiveModuleId]  = useState(initMod);
  const [activeContentId, setActiveContentId] = useState(initCon);
  const [expandedIds,     setExpandedIds]     = useState(
    course.modulesData.map((m) => m.id)
  );
  const [completed, setCompleted] = useState(() => {
    const map = {};
    course.modulesData.forEach((m) =>
      m.contents.forEach((c) => { map[c.id] = c.completed ?? false; })
    );
    return map;
  });

  // Flatten all content for next/prev
  const allContents = course.modulesData.flatMap((m) =>
    m.contents.map((c) => ({ ...c, moduleId: m.id }))
  );
  const currentIndex  = allContents.findIndex((c) => c.id === activeContentId);
  const activeContent = allContents[currentIndex] ?? allContents[0];
  const activeModule  = course.modulesData.find((m) =>
    m.contents.some((c) => c.id === activeContent?.id)
  );

  const goTo = (contentId, moduleId) => {
    setActiveContentId(contentId);
    setActiveModuleId(moduleId);
    if (!expandedIds.includes(moduleId)) {
      setExpandedIds((prev) => [...prev, moduleId]);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      const prev = allContents[currentIndex - 1];
      goTo(prev.id, prev.moduleId);
    }
  };

  const goNext = () => {
    if (currentIndex < allContents.length - 1) {
      const next = allContents[currentIndex + 1];
      goTo(next.id, next.moduleId);
      // Mark current as completed
      setCompleted((prev) => ({ ...prev, [activeContent.id]: true }));
    }
  };

  const toggleExpand = (id) =>
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const totalItems     = allContents.length;
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPct    = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden text-left">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">

        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => navigate("/student/courses/view", { state: { course } })}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Course
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-md font-bold text-gray-900 truncate">{course.courseTitle}</p>
              <p className="text-sm text-gray-400">{course.class}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{completedCount}/{totalItems} completed</span>
              <span className="font-semibold text-blue-600">{progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto py-2">
          {course.modulesData.map((mod, mIdx) => {
            const isExpanded  = expandedIds.includes(mod.id);
            const modCompleted = mod.contents.filter((c) => completed[c.id]).length;

            return (
              <div key={mod.id} className="border-b border-gray-50 last:border-0">
                {/* Module header */}
                <button
                  onClick={() => toggleExpand(mod.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {mIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{mod.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {modCompleted}/{mod.contents.length} done
                    </p>
                  </div>
                  {isExpanded
                    ? <ChevronUp   className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  }
                </button>

                {/* Content items */}
                {isExpanded && (
                  <div className="pb-1">
                    {mod.contents.map((item) => {
                      const isActive = item.id === activeContentId;
                      const isDone   = completed[item.id];
                      return (
                        <button
                          key={item.id}
                          onClick={() => goTo(item.id, mod.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                            isActive
                              ? "bg-blue-50 border-r-2 border-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Completion icon */}
                          <div className="flex-shrink-0">
                            {isDone
                              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                              : <Circle       className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-gray-300"}`} />
                            }
                          </div>

                          {/* Content type icon */}
                          <ContentTypeIcon type={item.type} className="w-3.5 h-3.5 flex-shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isActive ? "font-semibold text-blue-700" : "text-gray-700"}`}>
                              {item.label}
                            </p>
                            {item.duration && (
                              <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {item.duration}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{activeModule?.title}</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">{activeContent?.label}</span>
          </div>

          {/* Player / Content area */}
          {activeContent?.type === "video" ? (
            <VideoPlayer
              key={activeContent.id}
              src={activeContent.url}
              title={activeContent.label}
            />
          ) : (
            activeContent && <ContentPlaceholder item={activeContent} />
          )}

          {/* Title + meta */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{activeContent?.label}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <ContentTypeIcon type={activeContent?.type} className="w-3.5 h-3.5" />
                    <span className="capitalize">{activeContent?.type}</span>
                  </span>
                  {activeContent?.duration && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {activeContent.duration}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" />
                    {activeModule?.title}
                  </span>
                </div>
              </div>

              {/* Mark complete toggle */}
              <button
                onClick={() =>
                  setCompleted((prev) => ({
                    ...prev,
                    [activeContent.id]: !prev[activeContent.id],
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-md font-semibold transition ${
                  completed[activeContent?.id]
                    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {completed[activeContent?.id] ? (
                  <><CheckCircle2 className="w-4 h-4" /> Completed</>
                ) : (
                  <><Circle className="w-4 h-4" /> Mark Complete</>
                )}
              </button>
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={currentIndex <= 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-md text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-sm text-gray-400">
              {currentIndex + 1} of {allContents.length}
            </span>

            <button
              onClick={goNext}
              disabled={currentIndex >= allContents.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-md font-semibold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};