'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; 
import { toast } from 'react-toastify';
import { ShieldCheck, Info, HelpCircle, Lock, User } from 'lucide-react';
import Input from '../Controller/Input';   
import Button from '../components/Button';
import { useAuth } from '../Context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'info' | 'warning' | 'success' | 'error' | null;
  }>({ text: '', type: null });
  
  const [loginDetails, setLoginDetails] = useState({
    Username: "",
    Password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLoginDetails({
      ...loginDetails,
      [e.target.name]: e.target.value,
    });
    
    if (statusMessage.type === 'warning') {
      setStatusMessage({ text: '', type: null });
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { Username, Password } = loginDetails;
    if (Username.trim() !== '' && Password.trim() !== '') {
      try {
        setIsLoading(true);
        setStatusMessage({
          text: '🔄 Initiating security gateway match checks. Please do not close this window...',
          type: 'info'
        });
        console.log(`Username1:${Username},Password1:${Password}`);
        
        const res = await toast.promise(
          login(Username, Password),
          {
            pending: 'Verifying credentials against institutional records...',
          }
        );
        
        if (res.success) {
          setStatusMessage({
            text: '🎉 Credentials Verified! Establishing secure session token handshakes. Redirecting to your workspace...',
            type: 'success'
          });
          
          setTimeout(() => {
            router.replace('/my-courses');
          }, 800);
        } else {
          setStatusMessage({
            text: `❌ Authentication Failed: ${res.message || 'Profile record match anomaly detected.'}`,
            type: 'error'
          });
        }
      } catch (err: any) {
        console.error("DEBUG_LOGIN_FAIL_NETWORK_OBJ:", err.response || err);
        const errorText = err?.response?.data?.response || err?.response?.data?.message || err?.message;
        toast.error(errorText);
        setStatusMessage({
          text: `🔺 System Exception: ${errorText}.`,
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.info("All fields are mandatory");
      setStatusMessage({
        text: '⚠️ Attention Required: Both fields are mandatory. Please fill out your registration number and profile password.',
        type: 'warning'
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4 box-border">
    <div className="w-full max-w-[440px] space-y-7 bg-white p-8 md:p-10 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/40 hover:shadow-2xl hover:shadow-slate-200/30 transition-all duration-300 ease-in-out box-border relative overflow-hidden group">
      
      {/* --- TOP BRANDING & TYPOGRAPHY SYSTEM --- */}
      <div className="text-center space-y-2.5">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner transition-transform duration-300 group-hover:scale-105">
          <ShieldCheck size={24} strokeWidth={2.2} />
        </div>
        <h3 className="text-2xl font-black tracking-tight text-slate-950 font-sans m-0">
          Sign In
        </h3>
        <p className="text-sm text-slate-500 font-medium m-0">
          Access your training dashboard and courses
        </p>
      </div>

      {/* --- DYNAMIC VISITOR STATUS ALERTS --- */}
      {statusMessage.type && (
        <div 
          className={`
            p-4 rounded-xl text-xs font-semibold leading-relaxed border transition-all duration-300 transform animate-fadeIn flex gap-2.5 items-start box-border
            ${statusMessage.type === 'info' ? 'bg-blue-50/60 border-blue-200 text-blue-800' : ''}
            ${statusMessage.type === 'warning' ? 'bg-amber-50/70 border-amber-200 text-amber-800' : ''}
            ${statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 animate-pulse' : ''}
            ${statusMessage.type === 'error' ? 'bg-rose-50/60 border-rose-200 text-rose-800' : ''}
          `}
        >
          <Info size={15} className="flex-shrink-0 mt-0.5 opacity-80" />
          <p className="m-0 flex-1">{statusMessage.text}</p>
        </div>
      )}

      {/* PERSISTENT HELPFUL NOTICE SYSTEM */}
      {!statusMessage.type && (
        <div className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-3.5 text-[11px] text-slate-600 flex gap-2.5 items-start leading-relaxed box-border shadow-xs">
          <HelpCircle size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="m-0">
            <b className="text-slate-900 font-bold">Notice:</b> Ensure Caps Lock is off before submission. Your login credentials correspond to the structural verification values generated upon initial dashboard enrollment.
          </p>
        </div>
      )}

      {/* --- FORM ENTRY LEVEL PIPELINE --- */}
      <form className="space-y-5 m-0" onSubmit={handleLogin}>
        <div className="space-y-4">
          <div className="relative group/input">
            <Input
              icon="fi fi-rr-portrait"
              disabled={isLoading}
              name="Username"
              value={loginDetails.Username}
              type="text"
              label="Username (University Regs. No.)"
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative group/input">
            <Input
              icon="fi fi-rr-lock"
              disabled={isLoading}
              name="Password"
              value={loginDetails.Password}
              type="password"
              label="Password (Entered in Enroll Form)"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Action Trigger Row Wrapper */}
        <div className="pt-2">
          <Button
            icon={isLoading ? "fi fi-rr-spinner animation-spin" : "fi fi-rr-sign-in-alt"}
            label={isLoading ? "Verifying Context..." : "Secure Sign In"}
            isLoading={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-300 text-white font-bold rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 tracking-wide text-xs uppercase cursor-pointer disabled:cursor-not-allowed border-none box-border"
            type="submit"
          />
        </div>
      </form>
    </div>
    </div>
  );
}