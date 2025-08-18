"use client";
import { useState } from "react";
import styles from "../../page.module.css";
import menu from "../../../../public/menu.png";
import logo from "../../../../public/youtube.png";
import { IoSearchOutline, IoNotificationsOutline, IoAppsOutline, IoPersonCircleOutline } from "react-icons/io5";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function WatchNavbar() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <>
      <div className={styles.watchNavbar}>
        <div className={styles.watchLeft}>
          <img src={menu.src} alt="menu" className={`${styles.menuImg} ${styles.mobileOnly}`} />
          <img src={logo.src} alt="logo" className={styles.logoImg} />
          <h1 className={styles.logoText}>Vibio</h1>
        </div>
        <div className={`${styles.watchCenter} ${styles.desktopOnly}`}>
          <div className={styles.watchSearch}>
            <input type="text" placeholder="Search" className={styles.watchSearchInput} />
            <IoSearchOutline className={styles.watchSearchIcon} />
          </div>
        </div>
        <div className={styles.watchRight}>
        <ThemeToggle/>
          <IoSearchOutline className={`${styles.watchRightIcon} ${styles.mobileOnly}`} onClick={() => setShowMobileSearch((v) => !v)} />
          <IoAppsOutline className={`${styles.watchRightIcon} ${styles.desktopOnly}`} />
          <IoNotificationsOutline className={`${styles.watchRightIcon} ${styles.desktopOnly}`} />
          <IoPersonCircleOutline className={styles.watchRightIcon} />
        </div>
      </div>
      {showMobileSearch && (
        <div className={styles.mobileSearchBar}>
         
          <IoSearchOutline className={styles.mainRightIcon} />
          <input className={styles.mobileSearchInput} placeholder="Search" />
        </div>
      )}
    </>
  );
}


