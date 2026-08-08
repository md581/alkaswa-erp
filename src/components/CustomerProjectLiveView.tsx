import React, { useState, useEffect } from 'react';
import { dbService } from '../db/dbService';
import { Project, CameraStream, ProjectCamera } from '../types';
import { Play, Video, VideoOff, RefreshCw, Eye, Camera, Maximize2, Layers, CheckCircle2, Circle, AlertCircle, Image as ImageIcon, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerProjectLiveViewProps {
  lang: 'en' | 'bn';
  selectedProjectId?: string;
}

export default function CustomerProjectLiveView({
  lang,
  selectedProjectId: initialProjectId
}: CustomerProjectLiveViewProps) {
  const [projects] = useState<Project[]>(() => dbService.projects.getAll());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || projects[0]?.id || '');
  const [cameraStreams] = useState<CameraStream[]>(() => dbService.cameraStreams.getAll());
  const [projectCameras] = useState<ProjectCamera[]>(() => dbService.projectCameras.getAll());
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'customer' | 'engineer', text: string, time: string }>>([
    { sender: 'customer', text: 'When is the concrete slab casting for the 4th floor scheduled?', time: '10:15 AM' },
    { sender: 'engineer', text: 'Hello, the casting is scheduled for tomorrow morning starting from 8:00 AM. You can watch it live on Camera 2!', time: '10:30 AM' }
  ]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Filter cameras mapped to this project
  const mappedCameras = projectCameras.filter(pc => pc.projectId === selectedProjectId && pc.isApprovedForCustomer);
  const availableStreams = cameraStreams.filter(cs => mappedCameras.some(mc => mc.cameraId === cs.id));

  useEffect(() => {
    if (availableStreams.length > 0) {
      setActiveCameraId(availableStreams[0].id);
    } else {
      setActiveCameraId('');
    }
  }, [selectedProjectId]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newMsg = {
      sender: 'customer' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatLog(prev => [...prev, newMsg]);
    setChatMessage('');

    // Simulate auto answer from Site Engineer
    setTimeout(() => {
      const response = {
        sender: 'engineer' as const,
        text: 'Thank you for your message. The site operations team has received your query and will update you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatLog(prev => [...prev, response]);
    }, 1500);
  };

  const activeStream = cameraStreams.find(cs => cs.id === activeCameraId);

  // Mock milestones for selected project
  const milestones = [
    { id: 'm1', nameEn: 'Sourcing & Soil Test', nameBn: 'ভূমি অধিগ্রহণ ও সয়েল টেস্ট', status: 'Completed', date: 'Oct 2024' },
    { id: 'm2', nameEn: 'Architectural Approval', nameBn: 'স্থাপত্য নকশা ও অনুমোদন', status: 'Completed', date: 'Jan 2025' },
    { id: 'm3', nameEn: 'Piling & Foundation', nameBn: 'পাইলিং ও ফাউন্ডেশন', status: 'Completed', date: 'May 2025' },
    { id: 'm4', nameEn: 'Basement Sub-Structure', nameBn: 'বেসমেন্ট সাব-স্ট্রাকচার', status: 'Completed', date: 'Sep 2025' },
    { id: 'm5', nameEn: 'Superstructure Slab Casting', nameBn: 'সুপার-স্ট্রাকচার স্ল্যাব ঢালাই', status: 'Active', date: 'In Progress' },
    { id: 'm6', nameEn: 'Brick Laying & Plastering', nameBn: 'ইট গাঁথুনি এবং প্লাস্টার', status: 'Pending', date: 'Scheduled' },
    { id: 'm7', nameEn: 'Electrical & Plumbing Fitting', nameBn: 'ইলেকট্রিক্যাল ও প্লাম্বিং ফিটিং', status: 'Pending', date: 'Scheduled' },
    { id: 'm8', nameEn: 'Handover & Final Finishing', nameBn: 'হস্তান্তর ও ফিনিশিং কাজ', status: 'Pending', date: 'Scheduled' }
  ];

  // Recent on-site updates photos
  const sitePhotos = [
    { id: 'ph1', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=350', caption: 'Rebar binding check for Column C3', date: 'July 06, 2026' },
    { id: 'ph2', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=350', caption: 'Mobile crane setup in block A', date: 'July 05, 2026' },
    { id: 'ph3', url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=350', caption: 'Basement plaster curing', date: 'July 03, 2026' }
  ];

  return (
    <div className="space-y-6">
      {/* Selector and Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-800">
            {lang === 'en' ? 'Customer Project Portal' : 'গ্রাহক প্রকল্প পোর্টাল'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? 'Real-time site milestones, live CCTV camera feeds, and secure site communication desk.' 
              : 'রিয়েল-টাইম প্রকল্পের অগ্রগতি, লাইভ সিসিটিভি ক্যামেরা ফিড এবং সাইট ইঞ্জিনিয়ারের সাথে যোগাযোগ করুন।'}
          </p>
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {lang === 'en' ? p.nameEn : p.nameBn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Timeline and Progress Summary (8 Cols) */}
          <div className="xl:col-span-8 space-y-6">
            {/* Bento Progress Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {lang === 'en' ? 'Construction Milestone Status' : 'নির্মাণ মাইলস্টোন অগ্রগতি'}
                  </h3>
                  <p className="text-xxs text-slate-400">
                    {lang === 'en' ? 'Official project timeline verified by structural engineers.' : 'স্ট্রাকচারাল ইঞ্জিনিয়ারদের দ্বারা প্রত্যয়িত কাজের বিবরণী।'}
                  </p>
                </div>
                <span className="text-xxs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  {selectedProject.completionPercent}% {lang === 'en' ? 'Overall Progress' : 'সার্বিক অগ্রগতি'}
                </span>
              </div>

              {/* Progress Slider */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${selectedProject.completionPercent}%` }}
                />
              </div>

              {/* Horizontal Timeline Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {milestones.map((m, idx) => {
                  const isCompleted = m.status === 'Completed';
                  const isActive = m.status === 'Active';
                  return (
                    <div 
                      key={m.id} 
                      className={`p-3 rounded-2xl border text-left space-y-2 transition-all ${
                        isActive 
                          ? 'border-indigo-200 bg-indigo-50/20' 
                          : isCompleted 
                            ? 'border-slate-100 bg-slate-50/50' 
                            : 'border-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">Step 0{idx+1}</span>
                        {isCompleted ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : isActive ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                        ) : (
                          <Circle size={12} className="text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{lang === 'en' ? m.nameEn : m.nameBn}</p>
                        <p className="text-[9px] font-medium text-slate-400">{m.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live CCTV Stream Player */}
            <div className={`bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4 relative ${fullScreenMode ? 'fixed inset-0 z-50 flex flex-col justify-between' : ''}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl animate-pulse">
                    <Video size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {lang === 'en' ? 'Live HD Site Camera Stream' : 'লাইভ এইচডি সাইট ক্যামেরা স্ট্রিম'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {lang === 'en' ? 'RSTP Feed Encrypted • FPS: 24 • Quality: 1080p' : 'আরএসটিপি ফিড সুরক্ষিত • ২৪ এফপিএস • ১০৮০পি গুণমান'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                    }}
                    className={`p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 border border-slate-700`}
                  >
                    {isPlaying ? <Video size={14} className="text-emerald-400" /> : <VideoOff size={14} className="text-rose-400" />}
                  </button>
                  <button 
                    onClick={() => {
                      setSnapshotTaken(true);
                      setTimeout(() => setSnapshotTaken(false), 2000);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 border border-slate-700"
                    title="Take Snapshot"
                  >
                    <Camera size={14} />
                  </button>
                  <button 
                    onClick={() => setFullScreenMode(!fullScreenMode)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 border border-slate-700"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              {/* Feed Screen */}
              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
                {isPlaying ? (
                  <>
                    {activeStream ? (
                      <img 
                        src={activeStream.streamUrl} 
                        alt="CCTV stream" 
                        className="w-full h-full object-cover filter brightness-90 grayscale-[10%]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <VideoOff size={36} className="text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No approved camera streams found for this project.</p>
                      </div>
                    )}
                    {/* Live overlay watermark */}
                    <div className="absolute top-4 left-4 bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      LIVE FEED
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/60 text-slate-300 font-mono text-[9px] px-2 py-1 rounded-md">
                      {activeStream?.nameEn || 'N/A'} • {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <VideoOff size={40} className="text-rose-500/50 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-300">STREAM PAUSED</p>
                    <p className="text-xs text-slate-500">Click the video button at top to resume live casting feed.</p>
                  </div>
                )}

                {/* Snapshot Toast notification */}
                <AnimatePresence>
                  {snapshotTaken && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-4 right-4 bg-emerald-500 text-slate-900 text-xxs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={12} />
                      SNAPSHOT SAVED TO VAULT
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Camera Feeds Tabs */}
              {availableStreams.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableStreams.map(cs => {
                    const isActive = cs.id === activeCameraId;
                    return (
                      <button
                        key={cs.id}
                        onClick={() => setActiveCameraId(cs.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all text-[10px] cursor-pointer ${
                          isActive 
                            ? 'bg-slate-800 text-white border border-slate-700' 
                            : 'bg-slate-950/50 text-slate-500 border border-transparent hover:text-slate-300'
                        }`}
                      >
                        <Video size={12} className={isActive ? 'text-rose-500' : 'text-slate-600'} />
                        <span className="truncate">{lang === 'en' ? cs.nameEn : cs.nameBn}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Site Updates and Chat Desk (4 Cols) */}
          <div className="xl:col-span-4 space-y-6">
            {/* Construction Update Gallery */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ImageIcon size={16} className="text-indigo-500" />
                  {lang === 'en' ? 'Recent On-Site Photos' : 'অন-সাইট কাজের ছবি'}
                </h3>
                <p className="text-xxs text-slate-400">
                  {lang === 'en' ? 'Uploaded directly from our engineering team today.' : 'আজকে আমাদের সাইট ইঞ্জিনিয়ারদের আপলোড করা ছবি।'}
                </p>
              </div>

              <div className="space-y-3">
                {sitePhotos.map(photo => (
                  <div key={photo.id} className="group relative rounded-xl overflow-hidden aspect-video border border-slate-100">
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                      <p className="text-[10px] font-bold text-white">{photo.caption}</p>
                      <p className="text-[8px] text-slate-300">{photo.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engineer Support Messaging */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-500" />
                  {lang === 'en' ? 'Site Engineer Helpline' : 'সাইট ইঞ্জিনিয়ার হেল্পলাইন'}
                </h3>
                <p className="text-xxs text-slate-400">
                  {lang === 'en' ? 'Secure, direct messaging with the supervising engineer.' : 'তত্ত্বাবধায়ক প্রকৌশলীর সাথে সরাসরি বার্তা আদান-প্রদান করুন।'}
                </p>
              </div>

              {/* Chat View */}
              <div className="h-48 border border-slate-100 bg-slate-50/50 rounded-2xl p-3 overflow-y-auto space-y-2.5">
                {chatLog.map((chat, idx) => {
                  const isCustomer = chat.sender === 'customer';
                  return (
                    <div key={idx} className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-2xl text-xxs max-w-[85%] ${
                        isCustomer 
                          ? 'bg-emerald-500 text-white rounded-tr-none' 
                          : 'bg-slate-200 text-slate-800 rounded-tl-none'
                      }`}>
                        <p>{chat.text}</p>
                      </div>
                      <span className="text-[8px] text-slate-400 mt-0.5 font-semibold">{chat.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Send Box */}
              <form onSubmit={handleSendChat} className="flex gap-1.5">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={lang === 'en' ? 'Ask a question...' : 'প্রশ্ন করুন...'}
                  className="bg-slate-50 border border-slate-200 text-xxs rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 grow"
                />
                <button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl p-2 cursor-pointer shrink-0 transition-colors"
                >
                  <Send size={12} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-xs text-center">
          <AlertCircle size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-bold">No active projects available to load progress tracker.</p>
        </div>
      )}
    </div>
  );
}
