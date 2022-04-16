import { setCookies } from "cookies-next";
import { useState } from "react";
import styles from "../styles/SelectWatched.module.scss";
import { inList, removeFromList } from "../utils/lists";

const toggleDisease = (disease, watched, setWatched) => {
    if (inList(watched, disease)) {
        setWatched(removeFromList(watched, disease).sort());
    } else {
        setWatched([...watched, disease].sort());
    }
};

const SelectWatched = ({ watched, setWatched, allDiseases }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.watchedContainer}>
            {watched && watched.length == 0 && !expanded && (
                <caption>
                    <i>
                        Click the arrows to see some available diseases! Select
                        some to personalize your dashboard.{" "}
                    </i>
                </caption>
            )}
            {allDiseases &&
                watched &&
                (expanded ? allDiseases : watched).map((item, index) => (
                    <button
                        key={index}
                        className={`
                        ${
                            inList(watched, item)
                                ? styles.activeWatched
                                : styles.inactiveWatched
                        } 
                        ${styles.watchedLabel}`}
                        onClick={() => {
                            toggleDisease(item, watched, setWatched);
                            console.log("oops");
                        }}>
                        {item}
                    </button>
                ))}
            <button
                className={styles.expandButton}
                onClick={() => setExpanded(!expanded)}>
                {expanded ? "<<" : ">>"}
            </button>
        </div>
    );
};

export default SelectWatched;
