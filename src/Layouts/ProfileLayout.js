import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import '../Pages/Profile/Profile.css'
import { useAuth } from '../context/authContext';
import { toast } from 'react-toastify';

export default function ProfileLayout() {

    const { logout } = useAuth()

    const navigate = useNavigate();


    const handleLogOut = async () => {
        try {
            const res = await logout();
            toast[res.type](res.message)
            if (res.success) {
                navigate('/')
            }
        } catch (error) {
            toast.error(error?.response?.data?.response || error?.message)
        }

    }

    return (
        <section className='page profile-page'>
            <div className="section-heading">
                <h3>Profile</h3>
            </div>
            <div className="seciton-body">
                <div className={`sidebar`}>

                    <NavLink end to="" className={({ isActive }) => isActive ? "sidebar-links active" : "sidebar-links"}>
                        <div className="icon">
                            <i className="fi fi-rr-clipboard-user"></i>
                        </div>
                        <div className="text">
                            Personal Info
                        </div>
                    </NavLink>

                    <NavLink end to="update-password" className={({ isActive }) => isActive ? "sidebar-links active" : "sidebar-links"}>
                        <div className="icon">
                            <i className="fi fi-rr-key-skeleton-left-right"></i>
                        </div>
                        <div className="text">
                            Change Password
                        </div>
                    </NavLink>
                    <NavLink to="/" className={({ isActive }) => isActive ? "sidebar-links logout active" : "sidebar-links logout"} onClick={handleLogOut}>
                        <div className="icon">
                            <i className="fi fi-rr-sign-out-alt"></i>
                        </div>
                        <div className="text">
                            Log Out
                        </div>
                    </NavLink>
                </div>

                <div className="content-container">
                    <Outlet />
                </div>
            </div>
        </section >
    )
}

