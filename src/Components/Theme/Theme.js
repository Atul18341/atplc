import React from 'react'
import './Theme.css'
import { useTheme } from '../../context/themeContext'

export default function Theme() {

    const { theme, setLightTheme, setDarkTheme } = useTheme();


    return (
        <div className="theme">
            {
                theme === 'dark' ?
                    <span className="icon" onClick={setLightTheme}>
                        <i className="fi fi-rr-clouds-sun"></i>
                    </span>
                    :
                    <span className="icon" onClick={setDarkTheme}>
                        <i className="fi fi-rr-clouds-moon"></i>
                    </span>
            }
        </div >
    )
}
