import { setCookies } from "cookies-next";
import { useState } from "react";
import styles from "../styles/SelectWatched.module.scss";
import { inList, removeFromList } from "../utils/lists";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

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
                <button className={styles.watchedLabel} onClick={() => setExpanded(!expanded)}>
                    <FontAwesomeIcon icon={faPlus} size="lg"/>
                    <span>Add Diseases to Watch</span>
                </button>
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
                        }}>
                        {item}
                    </button>
                ))}
            { watched && (watched.length > 0 || expanded) && 
                <button
                    className={styles.expandButton}
                    onClick={() => setExpanded(!expanded)}>
                    <FontAwesomeIcon icon={expanded ? faAnglesLeft : faPlus} size="lg"/>
                </button>
            }
        </div>
    );
};

export default SelectWatched;
