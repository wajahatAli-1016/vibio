"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css"
import menu from "../../public/menu.png"
import logo from "../../public/youtube.png"
import home from "../../public/home.png"
import subscription from "../../public/subscribe.png"
import history from "../../public/history.png"
import library from "../../public/multimedia-interface.png"
import watchLater from "../../public/clock.png"
import likedVideos from "../../public/like.png"
import { IoSearchOutline, IoNotificationsOutline, IoAppsOutline, IoPersonCircleOutline } from "react-icons/io5";
import Link from "next/link";
import scissor from "../../public/scissors.png"
import graduationCap from "../../public/graduation-cap.png"
import shorts from "../../public/music.png"
import bell from "../../public/bell.png"

import ThemeToggle from "./components/ThemeToggle";

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

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const tags = ["All", "Music", "Mixes", "Cricket", "Breaking", "Religious","Manqabat", "Top Trending", "Movies", "Sports", "Comedy", "Tech", "Education"];
  const [selectedTag, setSelectedTag] = useState(tags[0]);

  const [dbVideos, setDbVideos] = useState([]);


  useEffect(() => {
    const controller = new AbortController();
    const loadDb = async () => {
      try {
        const res = await fetch(`/api/videos`, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setDbVideos(data.videos || []);
      } catch (_) {}
    };
    loadDb();
    return () => controller.abort();
  }, []);
  return (
    <div className={styles.container}>
      {isSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
       
        <div className={styles.home}>
          <img src={home.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Home</p>
        </div>
        <div className={styles.home}>
          <img src={subscription.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Subscription</p>
        </div>
        <div className={styles.home}>
          <img src={shorts.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Shorts</p>
        </div>
        <div className={styles.line}></div>
        <div className={styles.home + " " + styles.history}>
          <img src={history.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>History</p>
        </div>
        <div className={styles.home}>
          <img src={library.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Playlist</p>
        </div>
        <div className={styles.home}>
          <img src={watchLater.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Watch Later</p>
        </div>
        <div className={styles.home}>
          <img src={likedVideos.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Liked Videos</p>
        </div>
        <div className={styles.home}>
          <img src={scissor.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Your clips</p>
        </div>
        <div className={styles.home}>
          <img src={graduationCap.src} alt="home" className={styles.homeImg} />
          <p className={styles.homeText}>Your courses</p>
        </div>
      </div>
      <div className={styles.right}>
      <div className={styles.mainNavbar}>
        <div className={styles.mainLeft}>
          <img src={menu.src} alt="menu" className={`${styles.menuImg} ${styles.mobileOnly}`} onClick={() => setIsSidebarOpen((v) => !v)} />
          <img src={logo.src} alt="logo" className={styles.logoImg} />
          <h1 className={styles.logoText}>Vibio</h1>
        </div>
        <div className={`${styles.mainCenter} ${styles.desktopOnly}`}>
          <div className={styles.mainSearch}>
            <input type="text" placeholder="Search" className={styles.mainSearchInput} />
            <IoSearchOutline className={styles.mainSearchIcon} />
          </div>
          
        </div>
       
        <div className={styles.mainRight}>
        <ThemeToggle/>
          <Link href="/create" className={`${styles.createButton} ${styles.desktopOnly}`}>+ create</Link>
          <IoSearchOutline className={`${styles.mainRightIcon} ${styles.mobileOnly}`} onClick={() => setShowMobileSearch((v) => !v)} />
          <IoAppsOutline className={`${styles.mainRightIcon} ${styles.desktopOnly}`} />
          <IoNotificationsOutline className={`${styles.mainRightIcon} ${styles.desktopOnly}`} />
          <IoPersonCircleOutline className={styles.mainRightIcon} />
        </div>
      </div>
      <div className={styles.tags}>
      {tags.map((tag) => (
        <p key={tag} className={styles.tag} onClick={() => setSelectedTag(tag)} style={{backgroundColor: selectedTag === tag ? "black" : "#f3f1f1", color: selectedTag === tag ? "white" : "black", border: selectedTag === tag ? "1px solid #ccc" : "none"}}>{tag}</p>
      ))}
      </div>
      {showMobileSearch && (
        <div className={styles.mobileSearchBar}>
          <IoSearchOutline className={styles.mainRightIcon} />
          <input className={styles.mobileSearchInput} placeholder="Search" />
        </div>
      )}
      <div className={styles.videoGrid}>
        {dbVideos.map((video) => {
          const videoId = video.id;
          const thumbUrl = video.thumbnail;
          const title = video.title;
          const channelTitle = video.channel;
          const timeText = video.createdAt ? formatTimeAgo(video.createdAt) : undefined;
          
          // Handle thumbnail URL - if it's a filename (no slash), use API route
          const getThumbnailUrl = (thumb) => {
            if (!thumb) return null;
            // If it's a local upload path (starts with /uploads/), use as is
            if (thumb.startsWith('/uploads/')) return thumb;
            // If it's just a filename (no slash), use our API route
            if (!thumb.includes('/')) return `/api/thumbnail/${thumb}`;
            // If it's already a full URL, use as is
            return thumb;
          };
          
          const finalThumbUrl = getThumbnailUrl(thumbUrl);
          
          return (
            <Link key={videoId} href={`/watch/${videoId}`} className={styles.videoCard}>
              {finalThumbUrl ? (
                <img src={finalThumbUrl} alt={title} className={styles.videoCardImg} />
              ) : (
                <div className={styles.videoCardImg} style={{width: 350, height: 198, background: '#eee'}} />
              )}
              <h4>{title}</h4>
              <p>{channelTitle}</p>
              <span>{timeText || ""}</span>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  )
}