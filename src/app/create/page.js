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
      // Send multipart form-data directly to our API, which saves files locally and stores DB record
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