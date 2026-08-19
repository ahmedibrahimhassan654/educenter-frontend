"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  TriangleAlert,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  title?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = `${s}`.padStart(2, "0");
  if (h > 0) return `${h}:${`${m}`.padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

const CONTROL_BTN =
  "shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-white/90 hover:bg-white/15 hover:text-white transition-colors";

export default function VideoPlayer({
  src,
  poster,
  className,
  title,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [pipSupported, setPipSupported] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPipSupported(
      typeof document !== "undefined" && document.pictureInPictureEnabled
    );
  }, []);

  useEffect(() => {
    const onFsChange = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const wakeControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (videoRef.current && !videoRef.current.paused) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen();
    }
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // Unsupported or blocked; ignore.
    }
  };

  const seekTo = (ratio: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(duration)) return;
    video.currentTime = Math.min(Math.max(ratio, 0), 1) * duration;
  };

  const onSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  };

  const onSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const onBuffered = () => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0) return;
    setBuffered(video.buffered.end(video.buffered.length - 1));
  };

  const playedRatio = duration > 0 ? currentTime / duration : 0;
  const bufferedRatio = duration > 0 ? buffered / duration : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-black select-none",
        fullscreen && "rounded-none",
        className
      )}
      onMouseMove={wakeControls}
      onMouseLeave={() => {
        if (videoRef.current && !videoRef.current.paused) {
          setControlsVisible(false);
        }
      }}
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        className="w-full h-full max-h-full bg-black"
        onPlay={() => {
          setPlaying(true);
          wakeControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onError={() => setError(true)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onProgress={onBuffered}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
      />

      {title && (
        <div className="absolute top-3 inset-x-3 z-10">
          <p
            className={cn(
              "text-white/90 text-sm font-bold drop-shadow transition-opacity duration-300",
              !controlsVisible && "opacity-0"
            )}
          >
            {title}
          </p>
        </div>
      )}

      {/* Buffering spinner */}
      {waiting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-white/80 animate-spin drop-shadow-lg" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 text-white/90 text-sm font-bold text-center px-6">
          <TriangleAlert className="w-10 h-10 text-amber-400" />
          تعذر تشغيل الفيديو — تحقق من اتصال الإنترنت وأعد المحاولة.
        </div>
      )}

      {/* Big play overlay when paused */}
      {!playing && !waiting && !error && (
        <button
          type="button"
          aria-label="تشغيل"
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-gradient-to-t from-black/50 via-transparent to-black/30"
        >
          <span className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:scale-105 active:scale-95 transition-all shadow-2xl">
            <Play className="w-8 h-8 md:w-9 md:h-9 fill-current ms-1" />
          </span>
        </button>
      )}

      {/* Control bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 px-3 pb-2.5 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300",
          !controlsVisible && "opacity-0 pointer-events-none"
        )}
      >
        {/* Seek bar */}
        <div
          role="slider"
          aria-label="شريط التقدم"
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime}
          className="group/seek relative h-5 flex items-center cursor-pointer touch-none"
          onPointerDown={onSeekPointerDown}
          onPointerMove={onSeekPointerMove}
        >
          <div className="relative h-1 w-full rounded-full bg-white/25 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white/40"
              style={{ width: `${bufferedRatio * 100}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-cyan-400"
              style={{ width: `${playedRatio * 100}%` }}
            />
          </div>
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md scale-0 group-hover/seek:scale-100 group-hover/seek:bg-cyan-400 transition-transform"
            style={{ left: `calc(${playedRatio * 100}% - 7px)` }}
          />
        </div>

        <div className="flex items-center gap-1">
          <button type="button" className={CONTROL_BTN} onClick={togglePlay} aria-label={playing ? "إيقاف" : "تشغيل"}>
            {playing ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ms-0.5" />
            )}
          </button>
          <button
            type="button"
            className={CONTROL_BTN}
            onClick={() => {
              const video = videoRef.current;
              if (video) video.currentTime = Math.max(0, video.currentTime - 10);
            }}
            aria-label="رجوع 10 ثواني"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={CONTROL_BTN}
            onClick={() => {
              const video = videoRef.current;
              if (video) video.currentTime = Math.min(video.duration, video.currentTime + 10);
            }}
            aria-label="تقديم 10 ثواني"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <span className="text-white/90 text-xs font-medium tabular-nums px-1.5" dir="ltr">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1 group/vol">
            <button
              type="button"
              className={CONTROL_BTN}
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                video.muted = !video.muted;
                setMuted(video.muted);
              }}
              aria-label={muted ? "إلغاء كتم الصوت" : "كتم الصوت"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={onVolumeChange}
              aria-label="مستوى الصوت"
              className="hidden group-hover/vol:block w-20 accent-cyan-400 cursor-pointer"
              dir="ltr"
            />
          </div>

          {pipSupported && (
            <button type="button" className={CONTROL_BTN} onClick={togglePip} aria-label="شاشة عائمة">
              <PictureInPicture2 className="w-5 h-5" />
            </button>
          )}

          <button type="button" className={CONTROL_BTN} onClick={toggleFullscreen} aria-label="ملء الشاشة">
            {fullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
