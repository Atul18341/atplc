import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ hamburgerStatus, setHamburgerStatus }) {


    const handleLinkClick = () => {
        window.scrollTo(0, 0);
        setHamburgerStatus(false)
    }
    const scrollTo = (elementId) => {
        const element = document.querySelector(elementId);
        element.scrollIntoView(elementId)
    }

    const navlinks = [
        {
            icon: 'fi fi-rr-home',
            label: 'Home',
            href: '/',
            onclick: handleLinkClick
        },
        {
            icon: 'fi fi-rr-book',
            label: 'Courses',
            href: '/courses',
            onclick: handleLinkClick
        },
        {
            icon: 'fi fi-rr-calendar-star',
            label: 'Events',
            href: '/events',
            onclick: handleLinkClick
        },
        // {
        //     icon: 'fi fi-rr-layout-fluid',
        //     label: 'Gallery',
        //     href: '/gallery',
        //     onclick: handleLinkClick
        // },
        {
            icon: 'fi fi-rr-comment',
            label: 'Feedback',
            href: '/feedbacks',
            onclick: handleLinkClick
        },
        {
            icon: 'fi fi-rr-info',
            label: 'About',
            href: '/#footer',
            onclick: () => { scrollTo('#footer') }
        },
    ]

    return (
        <nav className={`navbar ${hamburgerStatus ? 'active' : ''}`}>
            <ul className="nav-list">
                {
                    navlinks.map((link, index) => (
                        <li key={index} className="nav-items">
                            <Link onClick={link.onclick} to={link.href} className="nav-links">
                                <div className="icon">
                                    <i className={link.icon}></i>
                                </div>
                                <div className="text">{link.label}</div>
                            </Link>
                        </li>
                    ))
                }
            </ul>
        </nav>
    )
}
