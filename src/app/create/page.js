"use client"
import { useState } from "react";
import styles from "../page.module.css";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

export default function Create() {
    const [title, setTitle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video || !thumbnail) return;
    setIsUploading(true);
    try {
      // Try direct-to-Blob first (works on Vercel for large files), fall back to multipart locally
      const tryDirectBlob = async () => {
        const getUrl = async () => {
          const r = await fetch("/api/blob-url", { method: "POST" });
          if (!r.ok) throw new Error("Blob URL not available");
          return r.json();
        };
        const [{ url: videoPutUrl }, { url: thumbPutUrl }] = await Promise.all([getUrl(), getUrl()]);

        const [videoRes, thumbRes] = await Promise.all([
          fetch(videoPutUrl, {
            method: "PUT",
            headers: { "content-type": video.type, "x-vercel-filename": video.name },
            body: video,
          }),
          fetch(thumbPutUrl, {
            method: "PUT",
            headers: { "content-type": thumbnail.type, "x-vercel-filename": thumbnail.name },
            body: thumbnail,
          }),
        ]);
        if (!videoRes.ok || !thumbRes.ok) throw new Error("Direct upload failed");
        const videoUrl = videoRes.headers.get("location");
        const thumbnailUrl = thumbRes.headers.get("location");
        if (!videoUrl || !thumbnailUrl) throw new Error("Missing blob URLs");

        const saveRes = await fetch("/api/uploadVideo", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, channelName, videoUrl, thumbnailUrl }),
        });
        if (!saveRes.ok) {
          const j = await saveRes.json().catch(() => ({}));
          throw new Error(j?.error || j?.detail || saveRes.statusText);
        }
      };

      const tryMultipart = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("channelName", channelName);
        formData.append("video", video);
        formData.append("thumbnail", thumbnail);
        const res = await fetch("/api/uploadVideo", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || j?.detail || res.statusText);
        }
      };

      try {
        await tryDirectBlob();
      } catch (err) {
        const isLocalhost =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        if (isLocalhost) {
          await tryMultipart();
        } else {
          throw new Error(
            `Direct upload not available in production. Configure Vercel Blob (BLOB_READ_WRITE_TOKEN). Original error: ${String(
              err
            )}`
          );
        }
      }

      alert("Uploaded successfully");
      setTitle("");
      setChannelName("");
      setVideo(null);
      setThumbnail(null);
    } catch (err) {
      alert(`Upload failed: ${String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };
    return (
        <div className={styles.cont}>
            <Link href="/" className={styles.backButton}>
            <IoArrowBack className={styles.backIcon}/>
            <span className={styles.backText}>Back</span>
            </Link>
        <div className={styles.formContainer}>
            <h1 className={styles.title}>Upload Video</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor="title">Title</label>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className={styles.input} />
                <label htmlFor="channelName">Channel</label>
                <input type="text" placeholder="Channel" value={channelName} onChange={(e) => setChannelName(e.target.value)} required className={styles.input} />
                <label htmlFor="thumbnail">Thumbnail</label>
                <input type="file" placeholder="Thumbnail" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} required className={styles.inputFile} />
                <label htmlFor="video">Video (mp4)</label>
                <input type="file" placeholder="Video" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} required className={styles.inputFile} />
                <button type="submit" className={styles.button} disabled={isUploading}>{isUploading ? "Uploading..." : "Upload"}</button>
            </form>
        </div>
        </div>
    )
}