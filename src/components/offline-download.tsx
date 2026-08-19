"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, Loader2, Trash2 } from "lucide-react";
import api from "@/lib/api";
import VideoPlayer from "@/components/video-player";
import {
  StoredVideo,
  getStoredVideo,
  downloadVideoToStorage,
  removeStoredVideo,
  formatBytes,
  requestPersistentStorage,
} from "@/lib/offline-videos";

interface OfflineDownloadProps {
  groupId: string;
  lessonId: string;
  field: string;
  url: string;
  title: string;
  mimeType?: string;
  onStored?: (record: StoredVideo) => void;
  onRemoved?: () => void;
}

/**
 * "Download for offline viewing" button. Stores the video in IndexedDB
 * (app-managed storage — not the visible Downloads folder) so it plays without
 * internet. Reports progress while downloading and hands the stored Blob up so
 * the surrounding player can switch to it.
 */
export function OfflineDownload({
  groupId,
  lessonId,
  field,
  url,
  title,
  mimeType = "video/mp4",
  onStored,
  onRemoved,
}: OfflineDownloadProps) {
  const videoKey = `${groupId}:${lessonId}:${field}`;
  const [stored, setStored] = useState<StoredVideo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onStoredRef = useRef(onStored);
  onStoredRef.current = onStored;
  const onRemovedRef = useRef(onRemoved);
  onRemovedRef.current = onRemoved;

  useEffect(() => {
    let cancelled = false;
    getStoredVideo(videoKey)
      .then((record) => {
        if (cancelled) return;
        setStored(record);
        if (record) onStoredRef.current?.(record);
      })
      .catch(() => {
        // Storage unavailable; download button simply won't persist.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoKey]);

  const handleDownload = async () => {
    setError(null);
    setDownloading(true);
    setProgress(null);
    try {
      await requestPersistentStorage();
      const record = await downloadVideoToStorage(
        videoKey,
        url,
        { groupId, lessonId, field, title, mimeType },
        (p) => setProgress(p.ratio)
      );
      setStored(record);
      onStoredRef.current?.(record);
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string } | null;
      if (err?.name === "QuotaExceededError") {
        setError(
          "مساحة التخزين ممتلئة — احذف بعض التحميلات القديمة أو حرّر مساحة على جهازك"
        );
      } else {
        setError(err?.message || "فشل تحميل الفيديو للعرض بدون إنترنت");
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeStoredVideo(videoKey);
    } catch {
      // Ignore removal errors.
    }
    setStored(null);
    setProgress(null);
    onRemovedRef.current?.();
  };

  if (stored) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
        <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
          <Check className="w-4 h-4" />
          متاح بدون إنترنت
        </span>
        <span className="text-[11px] text-muted-foreground">
          {formatBytes(stored.size)}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          aria-label="حذف التحميل"
          className="ms-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-500 bg-red-500/10 text-[11px] font-bold hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          حذف
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {downloading && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="flex-1">
            جارِ التحميل للعرض بدون إنترنت
            {progress != null && ` — ${Math.round(progress * 100)}%`}
          </span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-background border overflow-hidden">
        <div
          className="h-full bg-cyan-500 transition-all duration-200"
          style={{
            width: `${progress != null ? progress * 100 : downloading ? 6 : 0}%`,
          }}
        />
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all disabled:opacity-60 disabled:pointer-events-none"
      >
        <Download className="w-3.5 h-3.5" />
        {downloading ? "جاري التحميل..." : "تحميل للعرض بدون إنترنت"}
      </button>
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function useOfflineVideoSrc(remoteUrl: string, videoKey: string) {
  const [src, setSrc] = useState(remoteUrl);
  const urlRef = useRef<string | null>(null);

  const applyBlob = useCallback(
    (record: StoredVideo | null) => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      if (record?.blob) {
        const url = URL.createObjectURL(record.blob);
        urlRef.current = url;
        setSrc(url);
      } else {
        setSrc(remoteUrl);
      }
    },
    [remoteUrl]
  );

  useEffect(() => {
    let cancelled = false;
    getStoredVideo(videoKey)
      .then((record) => {
        if (!cancelled) applyBlob(record);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoKey, remoteUrl]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  return { src, applyBlob };
}

interface OfflineVideoSectionProps {
  groupId: string;
  lessonId: string;
  field: string;
  url: string;
  title: string;
  mimeType?: string;
  className?: string;
}

/**
 * A video that plays from local storage when a copy has been downloaded for
 * offline viewing, otherwise from the (signed) remote URL. Includes the
 * download button and progress UI.
 */
export function OfflineVideoSection({
  groupId,
  lessonId,
  field,
  url,
  title,
  mimeType,
  className,
}: OfflineVideoSectionProps) {
  const videoKey = `${groupId}:${lessonId}:${field}`;
  const { src, applyBlob } = useOfflineVideoSrc(url, videoKey);

  // Signed Supabase URLs expire; when the player fails, fetch a fresh one.
  const isSignedSupabaseUrl = url.includes("/storage/v1/object/sign/");
  const refreshSrc = isSignedSupabaseUrl
    ? () =>
        api
          .get(
            `/groups/${groupId}/lessons/${lessonId}/video/signed?field=${encodeURIComponent(field)}`
          )
          .then((res) => res.data?.url as string)
    : undefined;

  return (
    <div className="space-y-2">
      <VideoPlayer src={src} className={className} refreshSrc={refreshSrc} />
      <OfflineDownload
        groupId={groupId}
        lessonId={lessonId}
        field={field}
        url={url}
        title={title}
        mimeType={mimeType}
        onStored={applyBlob}
        onRemoved={() => applyBlob(null)}
      />
    </div>
  );
}
