'use client';

import React, { useState,useRef } from 'react';
import { 
  StreamVideo, 
  StreamVideoClient, 
  StreamCall,
  Call, 
  StreamTheme,
  SpeakerLayout,
  ToggleAudioPublishingButton, // Handlers for Microphone Mute/Unmute
  ToggleVideoPublishingButton, // Handlers for Camera Mute/Unmute
  ScreenShareButton,
} from '@stream-io/video-react-sdk';
import { Video, LogOut, Loader2, MonitorPlay,Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext'; // 🔑 Grab your authenticated user state
import { getStreamToken } from '../../actions/stream';
import '@stream-io/video-react-sdk/dist/css/styles.css'; // Global stream styles layout

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";

interface VideoWorkspaceProps {
  roomId: string;       // Unique ID for the classroom call room
  roomName?: string;     // Display name for the workspace layout header
  isModerator?: boolean; // Controls whether to request elevated admin privileges
}
export default function VideoWorkspace({roomId, 
  roomName, 
  isModerator
}: VideoWorkspaceProps) {
  const { user } = useAuth(); //
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSessionActive, setSessionActive] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const startMeeting = async () => {
  if (!user) return;
  setIsConnecting(true);

  try {
    // 1. Force the User ID into a clean, sanitized string format
    // This strips out any accidental spaces or illegal characters
    const sanitizedUserId = String(user.id || user.Username)
      .replace(/[^a-zA-Z0-9_-]/g, '');

    if (!sanitizedUserId) {
      throw new Error("Target user profile lacks a verifiable unique ID string.");
    }

    // 2. Fetch the token securely from the Server Action using the exact same sanitized ID
    const token = await getStreamToken(sanitizedUserId);

    // 3. Format the user object strictly adhering to Stream's type architecture
    const streamUser = {
      id: sanitizedUserId, // 🔑 Must match the exact string passed to getStreamToken
      name: String(user.Name || user.Username || "Student Learner"),
      image: user.Profile_Pic ? String(user.Profile_Pic) : undefined,
    };

    // 4. Instantiate the client with completely type-safe parameters
    const videoClient = new StreamVideoClient({ 
      apiKey, 
      user: streamUser, 
      token 
    });
    setClient(videoClient);

    const targetCall = videoClient.call('default', 'atplc_main_room');
    await targetCall.camera.disable();
    await targetCall.microphone.disable();
    await targetCall.join({ 
      create: false,
      // Pass the initial audio-visual media capture parameters directly here:
      ring: false,      // Prevents automatic phone-ringing sounds for standard classrooms
      notify: false,    // Set to true only if you want to push alerts to other members
    });
    
    setCall(targetCall);
  } catch (err: any) {
    console.error("Failed to spin up Stream video room pipeline:", err);
  } finally {
    setIsConnecting(false);
  }
};

  const endMeeting = async () => {
    if (call) {
      await call.leave();
    }
    if (client) {
      await client.disconnectUser();
    }
    setCall(null);
    setClient(null);
  };
   // 🔑 THE NATIVE FULLSCREEN API HANDLER METHOD
  const toggleFullscreen = async () => {
    if (!workspaceRef.current) return;

    try {
      if (!document.fullscreenElement) {
        // Expand the target node element to fill the entire monitor canvas
        await workspaceRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Drop down back into normal layout bounds
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Browser blocked full-screen window adjustment: ", err);
    }
  };

  // Listen to native browser changes (e.g., if user hits the 'Esc' key)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  // If a call is active, swap the entire grid over to the full-canvas video interface layout cleanly
  if (client && call) {
    return (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          {/* 🔑 ASSIGN THE REF LAYER HERE AND STYLE RESPONSIBLY FOR FULLSCREEN TRANSITIONS */}
          <div ref={workspaceRef} className="w-full h-[85vh] min-h-[600px] bg-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between relative box-border">
            
            <StreamTheme className={`w-full flex flex-col justify-between p-4 box-border relative transition-all ${
              isFullscreen ? 'h-screen p-6' : 'h-[75vh] min-h-[500px]'
            }`}>
              
              {/* Main Video Stream Grid */}
              <div className="flex-1 w-full relative rounded-xl overflow-hidden bg-slate-900/60">
                <SpeakerLayout participantsBarPosition="bottom" />
              </div>

              {/* Controller Dock Tray UI Layer */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 px-2 bg-slate-950/80 backdrop-blur-md relative z-20">
                <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                {roomId}-<span className="text-blue-400">ATPLC {roomName} Session</span>
                </div>
                
                {/* Center Audio/Video Controls */}
                <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800">
                <ToggleAudioPublishingButton />
                <ToggleVideoPublishingButton/>
                <ScreenShareButton />
              </div>
                {/* Right Action Trigger Deck Layout */}
                <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
                  
                  {/* 🔑 NEW: FULL SCREEN TOGGLE TRIGGER ACTION */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs border border-slate-700 transition-all cursor-pointer box-border"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  
                  <button
                    type="button"
                    onClick={endMeeting}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-xs border border-red-500/20 transition-all cursor-pointer box-border"
                  >
                    <LogOut size={13} />
                    <span>Leave</span>
                  </button>
                </div>

              </div>

            </StreamTheme>
          </div>
        </StreamCall>
      </StreamVideo>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/80 p-6 rounded-2xl gap-6 box-border flex flex-col items-center justify-center direction- shadow-xs">

      {/* Action Activation Launcher Button Trigger Right side */}
      <h3 className="font-bold text-[20px]">Online Session:</h3>
      <button
        type="button"
        disabled={isConnecting || !user || !isSessionActive} // Disable if no active user session
        onClick={startMeeting}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all transform active:scale-98 tracking-wide uppercase cursor-pointer whitespace-nowrap"
      >
        {isConnecting ? (
          <>
            <Loader2 size={14} className="animate-spin text-slate-300" />
            <span>Joining session...</span>
          </>
        ) : (
          <>
            <Video size={14} strokeWidth={2.5} />
            <span>Join Online Session</span>
          </>
        )}
      </button>
     <p className="text-[12px]">Note: Above button is active only when the course is active and 10 min before scheduled time.</p>
    </div>
  );
}