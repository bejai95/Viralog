import { setCookies } from "cookies-next";
import { useState } from "react";
import styles from "../styles/SelectWatched.module.scss";
import { inList, removeFromList } from "../utils/lists";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

const toggleDisease = (disease, diseases, setDiseases) => {
    if (inList(diseases, disease)) {
        setDiseases(removeFromList(diseases, disease).sort());
    } else {
        setDiseases([...diseases, disease].sort());
    }
};

const SelectDiseases = ({ diseases, setDiseases, allDiseases }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.watchedContainer}>
            {diseases && diseases.length == 0 && !expanded && (
                <button className={styles.watchedLabel} onClick={() => setExpanded(!expanded)}>
                    <FontAwesomeIcon icon={faPlus} size="lg" />
                    <span>Add Diseases to Watch</span>
                </button>
            )}
            {allDiseases &&
                diseases &&
                (expanded ? allDiseases : diseases).map((item, index) => (
                    <button
                        key={index}
                        className={`
                        ${inList(diseases, item)
                                ? styles.activeWatched
                                : styles.inactiveWatched
                            } 
                        ${styles.watchedLabel}`}
                        onClick={() => {
                            toggleDisease(item, diseases, setDiseases);
                        }}>
                        {item}
                    </button>
                ))}
            {diseases && (diseases.length > 0 || expanded) &&
                <button
                    className={styles.expandButton}
                    onClick={() => setExpanded(!expanded)}>
                    <FontAwesomeIcon icon={expanded ? faAnglesLeft : faPlus} size="lg" />
                </button>
            }
        </div>
    );
};

export default SelectDiseases;
