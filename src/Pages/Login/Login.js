import React, { useEffect, useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom';
import Input from '../../Controller/Input/Input';
import Button from '../../Components/Button/Button';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';

export default function Login() {

    const navigate = useNavigate();
    const { login, user } = useAuth()
    const [isLoading, setIsLoading] = useState(false);
    const [loginDetails, setLoginDetails] = useState({
        Username: "",
        Password: "",
    });


    useEffect(() => {
        document.title = "ATPLC | Login"
        document.getElementsByTagName("META")[2].content = 'Login to acess all your courses and thier dashboards'
        window.scrollTo(0, 0);
    }, [])

    useEffect(() => {
        if (user?.id) {
            navigate('/', { replace: true });
        }
    }, [navigate, user])

    const handelChange = (e) => {
        setLoginDetails({
            ...loginDetails,
            [e.target.name]: e.target.value
        });
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { Username, Password } = loginDetails;
        if (Username !== '' && Password !== '') {
            try {
                setIsLoading(true);
                const res = await toast.promise(
                    login(Username, Password),
                    {
                        pending: 'Please wait while we checking your credentials.',
                        // success: 'Looks like you are authentic',
                        // error: 'Opps ! Somthing went wrong.'
                    }
                )

                toast[res.type](res.message);

                if (res.success) {
                    navigate('/my-courses');
                }

            } catch (err) {
                toast.error(err?.response?.data?.response || err?.message);
            }
            finally {
                setIsLoading(false);
            }
        }
        else {
            toast.info("All fields are mandatory")
        }
    }

    return (
        <div className='page login-page'>
            <div className="login-container">
                <div className="login-heading">
                    <h3>Login</h3>
                </div>
                {/* {
                    error !== '' &&
                    <div className="message-box">
                        {error}
                    </div>
                } */}
                <form className="login-form" action="" onSubmit={handleLogin}>
                    <Input icon={'fi fi-rr-portrait'} disabled={isLoading} name='Username' value={loginDetails.Username} type='text' label='username' onChange={handelChange} />
                    <Input icon={'fi fi-rr-lock'} disabled={isLoading} name='Password' value={loginDetails.Password} type='password' label='password' onChange={handelChange} />
                    <Button icon={'fi fi-rr-sign-in-alt'} label="Login" isLoading={isLoading} className='login-button' type='submit' />
                </form>
            </div>
        </div>
    )
}
