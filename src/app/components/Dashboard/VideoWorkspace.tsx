'use client';

import React, { useState, useRef } from 'react';
import { 
  StreamVideo, 
  StreamVideoClient, 
  StreamCall,
  Call, 
  StreamTheme,
  SpeakerLayout,
  useCallStateHooks, // Used safely inside the sub-component below
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
} from '@stream-io/video-react-sdk';
import { Video, LogOut, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext'; 
import { getStreamToken } from '../../actions/stream';
import '@stream-io/video-react-sdk/dist/css/styles.css'; 

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";

interface VideoWorkspaceProps {
  roomId: string;       
  roomName?: string;     
  isModerator?: boolean; 
}

export default function VideoWorkspace({ roomId, roomName, isModerator }: VideoWorkspaceProps) {
  const { user } = useAuth(); 
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
      const sanitizedUserId = String(user.id || user.Username).replace(/[^a-zA-Z0-9_-]/g, '');

      if (!sanitizedUserId) {
        throw new Error("Target user profile lacks a verifiable unique ID string.");
      }

      // 🔑 Pass dynamic props down to token generation if your backend supports it
      const token = await getStreamToken(sanitizedUserId);

      const streamUser = {
        id: sanitizedUserId, 
        name: String(user.Name || user.Username || "Student Learner"),
        image: user.Profile_Pic ? String(user.Profile_Pic) : undefined,
      };

      const videoClient = new StreamVideoClient({ apiKey, user: streamUser, token });
      setClient(videoClient);

      // 🔑 Fixed: Use dynamic roomId prop instead of hardcoded 'atplc_main_room' string
      const targetCall = videoClient.call('default', 'atplc_main_room');
      await targetCall.camera.disable();
      await targetCall.microphone.disable();
      await targetCall.join({ 
        create: false,
        ring: false,      
        notify: false,    
      });
      
      setCall(targetCall);
    } catch (err: any) {
      console.error("Failed to spin up Stream video room pipeline:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const endMeeting = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    if (call) await call.leave();
    if (client) await client.disconnectUser();
    setCall(null);
    setClient(null);
  };

  const toggleFullscreen = async () => {
    if (!workspaceRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await workspaceRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Browser blocked full-screen window adjustment: ", err);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (client && call) {
    return (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          {/* 🔑 The outer native HTML element safely intercepts layout resizing */}
          <div ref={workspaceRef} className={`w-full flex flex-col justify-between box-border relative transition-all ${
            isFullscreen ? 'h-screen p-6 bg-slate-950' : 'h-[75vh] min-h-[500px] p-4'
          }`}>
            <CallLayoutContainer 
              roomId={roomId} 
              roomName={roomName || ""} 
              isFullscreen={isFullscreen} 
              toggleFullscreen={toggleFullscreen} 
              endMeeting={endMeeting} 
            />
          </div>
        </StreamCall>
      </StreamVideo>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/80 p-6 rounded-2xl gap-4 box-border flex flex-col items-center justify-center shadow-xs">
      <h3 className="font-bold text-[20px] text-slate-850 m-0">Online Session: {roomName}</h3>
      <button
        type="button"
        disabled={isConnecting || !user || !isSessionActive} 
        onClick={startMeeting}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all transform active:scale-98 tracking-wide uppercase cursor-pointer whitespace-nowrap border-none"
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
      <p className="text-[12px] text-slate-500 m-0">Note: Above button is active only when the course is active and 10 min before scheduled time.</p>
    </div>
  );
}

// 🛡️ SUB-COMPONENT: Safely isolated inside StreamCall context to eliminate loop re-renders
interface CallLayoutProps {
  roomId: string;
  roomName: string;
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
  endMeeting: () => Promise<void>;
}

function CallLayoutContainer({ roomId, roomName, isFullscreen, toggleFullscreen, endMeeting }: CallLayoutProps) {
  const [hideAllThumbnails, setHideAllThumbnails] = useState(false);
  
  // 🔑 These hooks can now run perfectly because they are wrapped inside an active <StreamCall> parent
  const { useRemoteParticipants } = useCallStateHooks();
  const remoteParticipants = useRemoteParticipants();
  const activeVideoCount = remoteParticipants.filter(p => p.videoStream).length;

  return (
    <StreamTheme className="w-full h-full flex flex-col justify-between p-0 m-0 box-border relative">
      
      {/* Main Video Stream Grid */}
      <div className="flex-1 w-full relative rounded-xl overflow-hidden bg-slate-900/60">
        <SpeakerLayout participantsBarPosition={hideAllThumbnails ? null : "bottom"} />
      </div>

      {/* Controller Dock Tray UI Layer */}
<div className={`w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 bg-slate-950/90 backdrop-blur-md z-20 box-border transition-all duration-300 ${
  isFullscreen 
    ? 'absolute bottom-0 left-0 right-0 h-20 transform translate-y-full hover:translate-y-0 opacity-0 hover:opacity-100 p-4 bg-gradient-to-t from-black via-slate-950 to-transparent' 
    : 'pt-4 relative h-auto'
}`}>
  
  <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
    {roomId} - <span className="text-blue-400">ATPLC {roomName} Session</span>
  </div>
  
  {/* Center Audio/Video Controls */}
  <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800">
    <ToggleAudioPublishingButton />
    <ToggleVideoPublishingButton />
    <ScreenShareButton />
  </div>

  {/* Right Action Trigger Deck Layout */}
  <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
    <button
      type="button"
      onClick={toggleFullscreen}
      className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs border border-slate-700 transition-all cursor-pointer box-border"
    >
      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
    
    <button 
      type="button"
      onClick={() => setHideAllThumbnails(!hideAllThumbnails)}
      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer transition-all"
    >
      {hideAllThumbnails ? "Show Peer Avatars" : "Hide Peer Avatars (Max Space)"}
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
  );
}