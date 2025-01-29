import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import './Account.css'
import Button from '../Button/Button';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';

export default function Account({ accountRef, setHamburgerStatus }) {

    const { user, logout } = useAuth();

    const [popUpStatus, setPopUpStatus] = useState(false);
    const popUpRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        document.addEventListener('click', (e) => {
            if (e.target !== popUpRef.current)
                setPopUpStatus(false);
        })
    }, [])

    const togglePopUp = () => {
        setPopUpStatus(!popUpStatus);
    }

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


    const scrollToTop = () => {
        window.scrollTo(0, 0)
    }

    return (
        <div className="account" ref={accountRef}>
            {
                user
                    ?
                    <>
                        <div className="header-profile row" ref={popUpRef} onClick={togglePopUp}>
                            <div className="profile-pic">
                                {
                                    user?.fullName
                                        ?
                                        user?.fullName[0]
                                        : ''
                                }
                            </div>
                            <div className="profile-details col">
                                <div className="profile-name">
                                    {
                                        user?.fullName
                                            ?
                                            user?.fullName?.split(' ')[0]
                                            : ''
                                    }
                                </div>
                                <div className="profile-email">
                                    {
                                        user?.email || ''
                                    }
                                </div>
                            </div>
                        </div>
                        <div className={`profile-popup ${popUpStatus ? 'active' : ''}`}>
                            <ul>
                                <li id='user-id'>
                                    <div className="icon">
                                        <i className="fi fi-rr-id-badge"></i>
                                    </div>
                                    <div className="text">{user?.username}</div>
                                </li>
                                <li>
                                    <Link to="/profile" onClick={scrollToTop} >
                                        <div className="icon">
                                            <i className="fi fi-rr-user-gear"></i>
                                        </div>
                                        <div className="text">Profile
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/my-courses" onClick={scrollToTop}>
                                        <div className="icon">
                                            <i className="fi fi-rr-e-learning"></i>
                                        </div>
                                        <div className="text">My Courses
                                        </div>
                                    </Link>
                                </li>
                                <li onClick={handleLogOut}>
                                    <div className="icon">
                                        <i className="fi fi-rr-sign-out-alt"></i>
                                    </div>
                                    <div className="text">Log Out</div>
                                </li>
                            </ul>
                        </div>
                    </>
                    :
                    <Button icon='fi fi-rr-sign-in-alt' label='Login' isLoading={false} className={'header-login-button'} onClick={() => { setHamburgerStatus(false); navigate('/login') }} />
            }
        </div >
    )
}
