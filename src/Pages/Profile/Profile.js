import React, { useEffect, useState } from 'react'
import './Profile.css'
import Loader from '../../Components/Loader/Loader'
import Input from '../../Controller/Input/Input'
import Button from '../../Components/Button/Button'
import { useAuth } from '../../context/authContext'
import { toast } from 'react-toastify'


export default function Profile() {

    const { user, updateProfile } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [showUpdateBtn, setShowUpdateBtn] = useState(false);
    const [profile, setProfile] = useState(user);

    useEffect(() => {
        document.title = "ATPLC | Profile"
        document.getElementsByTagName("META")[2].content = 'Update your Profile to be get updated.'
        window.scrollTo(0, 0);
        setProfile(user);
    }, [user])

    const changePersonalInfo = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        try {
            const res = await updateProfile(profile);
            toast[res.type](res.message);
        } catch (error) {
            toast.error(error?.response?.data?.response || error?.response?.data?.message || error?.message)
        } finally {
            setIsLoading(false);
        }
    }


    const handelImageUpload = (e) => {
        setShowUpdateBtn(true);
        const image = e.target.files[0];
        const imagePreview = URL.createObjectURL(e.target.files[0]);

        setProfile({ ...profile, Profile_Pic: image, Profile_Preview: imagePreview });

    }

    const handelChange = (e) => {
        !showUpdateBtn && setShowUpdateBtn(true);
        if (e.target.name === 'Contact_No') {
            if (e.target.value.length > 10) {
                return toast.error('Contact No should be of 10 digits')
            }
        }
        setProfile({ ...profile, [e.target.name]: e.target.value })
    }

    return (
        <div className="personal-info-field">
            <div className="field-heading">
                <h4>Personal Information</h4>
            </div>
            {
                isLoading ?
                    <Loader
                    />
                    :
                    <form className='field-body' onSubmit={changePersonalInfo}>
                        <div className="update-field">
                            <div className="profile-img">
                                {
                                    profile?.Profile_Preview && profile?.Profile_Preview !== '' ?
                                        <img src={profile.Profile_Preview} alt="profile-pic"
                                        />
                                        :
                                        <i className="fi fi-rr-user"></i>
                                }
                            </div>

                            <div className="upload-profile-img">
                                <input type="file" accept=".jpg,.jpeg,.png" id='upload-profile-pic'
                                    onChange={handelImageUpload}
                                />
                                <label htmlFor="upload-profile-pic">
                                    <i className="fi fi-rr-camera"></i>
                                </label>
                            </div>
                        </div>

                        {/* {
                            message !== '' &&
                            <div className="message-box">
                                {message}
                            </div>
                        } */}

                        <div className="update-field">
                            <Input
                                id='full-name'
                                label='Name'
                                value={profile?.Name}
                                name='Name'
                                icon='fi fi-rr-id-card-clip-alt'
                                onChange={handelChange}
                            />
                        </div>
                        <div className="update-field">
                            <Input
                                id='college'
                                label='College'
                                value={profile?.College_Name}
                                name='College_Name'
                                icon='fi fi-rr-graduation-cap'
                                onChange={handelChange}
                            />
                        </div>
                        <div className="update-field">
                            <Input
                                id='branch'
                                label='Branch'
                                value={profile?.Branch}
                                name='Branch'
                                icon='fi fi-rr-code-branch'
                                onChange={handelChange}
                            />
                            <Input
                                id='batch'
                                label='Batch'
                                value={profile?.Batch}
                                name='Batch'
                                icon='fi fi-rr-badge'
                                onChange={handelChange}
                            />
                        </div>
                        <div className="update-field">
                            <Input
                                id='hometown'
                                label='Hometown'
                                value={profile?.Hometown}
                                name='Hometown'
                                icon='fi fi-rr-house-building'
                                onChange={handelChange}
                            />
                            <Input
                                type='number'
                                id='contact-no'
                                label='Contact No'
                                value={profile?.Contact_No}
                                name='Contact_No'
                                icon='fi fi-rr-mobile-notch'
                                onChange={handelChange}
                            />
                        </div>
                        {
                            showUpdateBtn ?
                                <Button icon={"fi fi-rr-refresh"} label="Update Profile" isLoading={isLoading} className='profile-update-btn' type='submit' />
                                : null
                        }
                    </form>
            }
        </div>
    )
}

