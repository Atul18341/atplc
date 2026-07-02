'use client';

import React, { useEffect, useRef, useState, RefObject } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Button from "../Button";
import { useAuth } from "../../Context/AuthContext";

interface AccountProps {
  accountRef?: RefObject<HTMLDivElement | null>;
  setHamburgerStatus: (status: boolean) => void;
}

export default function Account({ accountRef, setHamburgerStatus }: AccountProps) {
  const { user, logout } = useAuth();
  const [popUpStatus, setPopUpStatus] = useState<boolean>(false);
  const popUpRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handles clicking anywhere outside the popup avatar boundary to close it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popUpRef.current && !popUpRef.current.contains(e.target as Node)) {
        setPopUpStatus(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const togglePopUp = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the global document listener from immediately closing it
    setPopUpStatus((prev) => !prev);
  };

  const handleLogOut = async () => {
    try {
      const res = await logout();
      if (res && res.type) {
        toast[res.type as 'success' | 'error' | 'info' | 'warn'](res.message);
      }
      if (res?.success) {
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.response || error?.message || "An error occurred during logout");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClick = () => {
    setHamburgerStatus(false);
    setPopUpStatus(false);
    scrollToTop();
  };

  return (
    <div className="relative select-none" ref={accountRef}>
      {user ? (
        <>
          {/* Header Profile Trigger */}
          <div
            className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors"
            ref={popUpRef}
            onClick={togglePopUp}
          >
            {/* Profile Avatar */}
            <div className="w-15 h-15 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[14px] shadow-sm border border-blue-700/10">
              {user?.Name?.charAt(0).toUpperCase() || (
                <i className="fi fi-rr-user flex items-center justify-center text-base" />
              )}
            </div>
            
            {/* Profile Details */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[18px] font-semibold text-slate-800 leading-tight">
                {user?.Name?.split(" ")[0] || "User"}
              </span>
            </div>
          </div>

          {/* Profile Dropdown Popup Menu Container */}
          <div
            className={`absolute right-0 mt-2 w-56 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-2 z-50 transform transition-all duration-200 origin-top-right ${
              popUpStatus
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            <ul className="list-none p-0 m-0 flex flex-col">
              {/* User Identity Banner */}
              <li className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 text-slate-500 font-mono text-xs">
                <i className="fi fi-rr-id-badge text-sm text-slate-400" />
                <span className="truncate font-bold text-slate-700">{user?.Username}</span>
              </li>

              {/* Navigation Links */}
              <li>
                <Link
                  href="/profile"
                  onClick={handleClick}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm font-medium no-underline"
                >
                  <i className="fi fi-rr-user-gear text-slate-400 group-hover:text-blue-600" />
                  <span>Profile</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/my-courses"
                  onClick={handleClick}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm font-medium no-underline"
                >
                  <i className="fi fi-rr-e-learning text-slate-400 group-hover:text-blue-600" />
                  <span>My Courses</span>
                </Link>
              </li>

              {/* Log Out Button Trigger */}
              <li
                onClick={handleLogOut}
                className="flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 border-t border-slate-100 cursor-pointer transition-colors text-sm font-semibold mt-1"
              >
                <i className="fi fi-rr-sign-out-alt text-rose-500" />
                <span>Log Out</span>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <Button
          icon="fi fi-rr-sign-in-alt"
          label="Login"
          isLoading={false}
          className="header-login-button bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2 px-5 rounded-xl transition-all shadow-sm"
          onClick={() => {
            setHamburgerStatus(false);
            router.push("/login");
          }}
        />
      )}
    </div>
  );
}