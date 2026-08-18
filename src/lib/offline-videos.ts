/**
 * Offline video storage for the student app.
 *
 * Videos are saved to IndexedDB (app-managed device storage, not the visible
 * Downloads folder) so a student can watch them without an internet connection.
 * The signed URLs handed out by the backend expire after a couple of hours, but
 * a stored Blob keeps playing forever.
 */

export interface StoredVideo {
  key: string;
  blob: Blob;
  size: number;
  mimeType: string;
  groupId: string;
  lessonId: string;
  field: string;
  title: string;
  savedAt: number;
}

export interface DownloadProgress {
  /** 0..1 when the total size is known, null for indeterminate. */
  ratio: number | null;
  receivedBytes: number;
  totalBytes: number;
}

const DB_NAME = "educenter-offline";
const DB_VERSION = 1;
const STORE = "videos";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not supported"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveStoredVideo(record: StoredVideo): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(record);
  await transactionDone(tx);
}

export async function getStoredVideo(key: string): Promise<StoredVideo | null> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const record = await requestToPromise(
    tx.objectStore(STORE).get(key) as IDBRequest<StoredVideo | undefined>
  );
  return record || null;
}

export async function listStoredVideos(): Promise<StoredVideo[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const records = await requestToPromise(
    tx.objectStore(STORE).getAll() as IDBRequest<StoredVideo[]>
  );
  return records || [];
}

export async function removeStoredVideo(key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(key);
  await transactionDone(tx);
}

/**
 * Stream a video URL into IndexedDB, reporting progress as bytes arrive.
 * Returns the stored record. Throws on network or quota errors.
 */
export async function downloadVideoToStorage(
  key: string,
  url: string,
  meta: Omit<StoredVideo, "key" | "blob" | "size" | "savedAt">,
  onProgress?: (progress: DownloadProgress) => void
): Promise<StoredVideo> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`فشل تحميل الفيديو (${response.status})`);
  }
  const body = response.body;
  if (!body) {
    throw new Error("فشل تحميل الفيديو — لا يمكن قراءة البيانات");
  }

  const totalBytes = Number(response.headers.get("content-length") || 0);
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let receivedBytes = 0;

  const reader = body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    // Copy into a fresh ArrayBuffer-backed view (stream chunks may be backed by
    // a SharedArrayBuffer, which Blob does not accept).
    chunks.push(new Uint8Array(value));
    receivedBytes += value.byteLength;
    onProgress?.({
      ratio: totalBytes > 0 ? receivedBytes / totalBytes : null,
      receivedBytes,
      totalBytes,
    });
  }

  const blob = new Blob(chunks, { type: meta.mimeType || "video/mp4" });
  const record: StoredVideo = {
    key,
    blob,
    size: blob.size,
    ...meta,
    savedAt: Date.now(),
  };
  await saveStoredVideo(record);
  return record;
}

export interface StorageEstimateInfo {
  usage: number;
  quota: number | null;
  percent: number | null;
}

/** Used bytes from IndexedDB records + the browser's storage estimate. */
export async function estimateStorage(): Promise<StorageEstimateInfo> {
  let usage = 0;
  try {
    const records = await listStoredVideos();
    usage = records.reduce((sum, r) => sum + (r.size || 0), 0);
  } catch {
    // IndexedDB unavailable — report usage as unknown.
  }

  let quota: number | null = null;
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      quota = estimate.quota ?? null;
    } catch {
      quota = null;
    }
  }

  return {
    usage,
    quota,
    percent: quota && quota > 0 ? usage / quota : null,
  };
}

/** Ask the browser to keep this origin's storage even under pressure. */
export async function requestPersistentStorage(): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.storage?.persist) {
    try {
      await navigator.storage.persist();
    } catch {
      // Best effort only.
    }
  }
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}