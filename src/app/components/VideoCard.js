"use client"
import styles from "../page.module.css"
export default function VideoCard({ video }) {
    return (
      <div className="video-card">
        <img src={video.thumbnail} alt={video.title} />
        <h4>{video.title}</h4>
        <p>{video.channel}</p>
        <span>{video.views} • {video.time}</span>
      </div>
    );
  }