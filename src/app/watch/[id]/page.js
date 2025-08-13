import Link from "next/link";
import styles from "../../page.module.css"
import menu from "../../../../public/menu.png"
import logo from "../../../../public/youtube.png"
import WatchNavbar from "./WatchNavbar";
import { connectToDatabase } from "../../lib/db";
import { ObjectId } from "mongodb";


function formatTimeAgo(isoDate) {
  if (!isoDate) return undefined;
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  const fmt = (n, unit) => `${n} ${unit}${n > 1 ? "s" : ""} ago`;
  if (diff >= year) return fmt(Math.floor(diff / year), "year");
  if (diff >= month) return fmt(Math.floor(diff / month), "month");
  if (diff >= week) return fmt(Math.floor(diff / week), "week");
  if (diff >= day) return fmt(Math.floor(diff / day), "day");
  if (diff >= hour) return fmt(Math.floor(diff / hour), "hour");
  if (diff >= minute) return fmt(Math.floor(diff / minute), "minute");
  return "just now";
}

export default async function WatchPage({ params }) {
  const { id } = await params;
  // DB lookup
  const { db } = await connectToDatabase();
  let objectId = null;
  try { objectId = new ObjectId(String(id)); } catch {}
  let dbVideo = null;
  if (objectId) {
    const doc = await db.collection("videos").findOne({ _id: objectId });
    if (doc) {
      dbVideo = {
        id: String(doc._id),
        title: doc.title,
        channel: doc.channel,
        thumbnail: doc.thumbnail,
        video: doc.video,
        createdAt: doc.createdAt || doc._id?.getTimestamp?.() || null,
      };
    }
  }
  if (!dbVideo) {
    return <div style={{ padding: 20 }}>Video not found.</div>;
  }

  // Related DB videos
  const relatedDocs = await db
    .collection("videos")
    .find({ _id: { $ne: objectId } })
    .sort({ createdAt: -1, _id: -1 })
    .limit(15)
    .toArray();
  const relatedVideos = (relatedDocs || []).map((d) => ({
    id: String(d._id),
    title: d.title,
    channel: d.channel,
    thumbnail: d.thumbnail,
    createdAt: d.createdAt || d._id?.getTimestamp?.() || null,
  }));

  const title = dbVideo.title;
  const channelTitle = dbVideo.channel;
  const timeText = dbVideo.createdAt ? formatTimeAgo(dbVideo.createdAt) : undefined;

  return (
    <div style={{ padding: "0px" }}>
      <WatchNavbar />
      <div className={`${styles.watchContent} ${styles.watchLayout}`}>
        <div className={styles.watchMain}>
          <div className={styles.watchPlayer}>
            <video className={styles.watchIframe} src={dbVideo.video} poster={dbVideo.thumbnail} controls autoPlay />
          </div>
          <h2 style={{ marginTop: 12, fontWeight: 600 }}>{title}</h2>
          <p style={{ color: "#666" }}>{[channelTitle, timeText].filter(Boolean).join(" • ")}</p>
        </div>

        <div className={styles.watchSidebarCol}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {relatedVideos.map((v) => {
              const thumbUrl = v.thumbnail;
              const sTitle = v.title || "";
              const sChannel = v.channel || "";
              const sTime = v.createdAt ? formatTimeAgo(v.createdAt) : undefined;
              return (
                <Link
                  key={v.id}
                  href={`/watch/${v.id}`}
                  style={{ display: "flex", gap: 8, textDecoration: "none", color: "inherit" }}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={sTitle}
                      style={{ width: 168, height: 94, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 168, height: 94, background: "#eee", borderRadius: 8 }} />
                  )}
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <span style={{ fontWeight: 500, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {sTitle}
                    </span>
                    <span style={{ color: "#666", fontSize: 12 }}>{sChannel}</span>
                    <span style={{ color: "#666", fontSize: 12 }}>{sTime}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


