import { useContext } from "react";
import Link from "next/link";
import styles from "../styles/NavBar.module.scss";

const right_button_styles = ["float_right", styles.element, styles.hover_darken].join(" ");

function NavBar(props) {
  return (
    <div className={styles.navbar}>
      <nav>
        <div style={{clear: "both"}}></div>
        <Link href="/"><a className={["float_left", styles.element, styles.title].join(" ")}>Disease Watch</a></Link>
        {
          !props.noSearch &&
            <form className={`${styles.search_container} float_left`} action="/search">
              <input type="text" placeholder="Search..." name="search"/>
              <button type="submit"><i className="fa fa-search" /></button>
            </form>
        }
        
        <Link href="/tmp"><a className={right_button_styles}>Temp</a></Link>
        <Link href="/tmp"><a className={right_button_styles}>Temp</a></Link>
        <div style={{clear: "both"}}></div>
      </nav>
    </div>
  );
}

export default NavBar;
