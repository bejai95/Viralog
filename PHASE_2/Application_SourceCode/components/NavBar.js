"use strict";
import { useContext } from "react";
import Link from "next/link";
import styles from "../styles/NavBar.module.scss";
import Image from "next/image";
import logo from "../public/logo-full.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const right_button_styles = [styles.element, styles.hover_darken].join(" ");

function NavBar({ search }) {
  return (
    <div className={styles.navbar}>
      <nav>
        <div style={{clear: "both"}}></div>
        <div className={styles.navLeft}>
          <Link href="/"><a className={styles.title}><Image src={logo} alt="Disease Watch" layout="fill"></Image></a></Link>
        </div>
        <div className={styles.navCenter}>
          <form className={`${styles.search_container} float_left`} action="/diseases">
            <input type="text" placeholder="Search diseases or symptoms..." name="search" defaultValue={search || ""}/>
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} />
              </button>
          </form>
        </div>
        <div className={styles.navRight}>
          <Link href="/"><a className={right_button_styles}>Map</a></Link>
          <Link href="/dashboard"><a className={right_button_styles}>Dashboard</a></Link>
          <Link href="/diseases"><a className={right_button_styles}>Diseases</a></Link>
          <Link href="/articles"><a className={right_button_styles}>Articles</a></Link>
        </div>

        <div style={{clear: "both"}}></div>
      </nav>
    </div>
  );
}

export default NavBar;
