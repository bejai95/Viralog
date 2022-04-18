import React from "react";
import styles from "../styles/Dropdown.module.scss"

const Dropdown = ({options, defaultValueIndex, setValue}) => {
    return (
        <select className={styles.dropdown} onChange={(e) => setValue(e.target.value)} defaultValue={options[defaultValueIndex]}>
            {
                options.map((item, index) => 
                        <option key={index} value={item}>
                            {item}
                        </option>
                    )
            }
        </select>
    )
}

export default Dropdown;