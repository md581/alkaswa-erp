/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../db/dbService';
import { COMPANY_PROFILE } from '../config/companyProfile';
import { RoleId, Project, PlotBooking, MoneyReceipt, DailyConstructionLog, CRMLead } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  MapPin,
  Camera,
  RefreshCw,
  Send,
  Trash2,
  Shield,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Plus,
  Users,
  User,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  Loader2,
  Download,
  Building2,
  TrendingUp,
  Search,
  Layers,
  Database,
  Briefcase,
  Activity,
  ThumbsUp,
  Grid,
  Map,
  X,
  FileCheck
} from 'lucide-react';

interface Props {
  lang: 'en' | 'bn';
  currentRole: RoleId;
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

// Interfaces for our offline queue and specialized mobile logs
interface OfflineQueueItem {
  id: string;
  type: 'Site Report' | 'Attendance' | 'Photo' | 'Note' | 'Lead' | 'Material Entry';
  data: any;
  timestamp: string;
}

interface MobileSitePhoto {
  id: string;
  projectId: string;
  projectName: string;
  category: 'Foundation' | 'Structure' | 'Brick Work' | 'Finishing';
  url: string; // Gradient mockup or raw base64
  description: string;
  uploadedAt: string;
  gpsCoords?: string;
  synced: boolean;
}

export default function MobileEcosystemPlatform({ lang, currentRole, addAuditLog }: Props) {
  // Locale helper
  const tl = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Core CRM / Sourcing datasets from dbService
  const [projects, setProjects] = useState<Project[]>(() => dbService.projects.getAll());
  const [bookings, setBookings] = useState<PlotBooking[]>(() => dbService.bookings.getAll());
  const [receipts, setReceipts] = useState<MoneyReceipt[]>(() => dbService.moneyReceipts.getAll());
  const [leads, setLeads] = useState<CRMLead[]>(() => dbService.leads.getAll());

  // Simulation Controls & Performance Optimization States
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [networkSpeed, setNetworkSpeed] = useState<'4G' | 'Slow 3G'>('4G');
  const [isSimulatingLoad, setIsSimulatingLoad] = useState<boolean>(false);
  const [selectedMobileApp, setSelectedMobileApp] = useState<'founder' | 'customer' | 'engineer' | 'sales' | 'crm'>('founder');
  
  // Offline Engine & Queue
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    const cached = localStorage.getItem('alkaswa_mobile_offline_queue');
    return cached ? JSON.parse(cached) : [];
  });

  // Sync animation triggers
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // GPS Simulated State
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLogs, setGpsLogs] = useState<Array<{ id: string; name: string; action: string; time: string; coords: string }>>([
    { id: '1', name: 'Engr. Sajjad', action: 'Check-in: Dhanmondi Imperial', time: '10:14 AM', coords: '23.7461, 90.3742' },
    { id: '2', name: 'Sales Exec. Tasnim', action: 'Site Visit Check-in: Uttara Skyline', time: '12:30 PM', coords: '23.8724, 90.3815' }
  ]);

  // Photo Gallery State
  const [sitePhotos, setSitePhotos] = useState<MobileSitePhoto[]>([
    {
      id: 'photo-1',
      projectId: 'p1',
      projectName: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
      category: 'Foundation',
      url: 'bg-gradient-to-tr from-emerald-800 to-teal-600',
      description: 'Piling reinforcement layout certified by structural auditor.',
      uploadedAt: '2026-03-10T10:00:00Z',
      gpsCoords: '23.8724, 90.3815',
      synced: true
    },
    {
      id: 'photo-2',
      projectId: 'p1',
      projectName: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
      category: 'Structure',
      url: 'bg-gradient-to-tr from-indigo-800 to-purple-600',
      description: 'Casting core column on 4th floor structural superstructure slab.',
      uploadedAt: '2026-05-18T14:30:00Z',
      gpsCoords: '23.8724, 90.3815',
      synced: true
    },
    {
      id: 'photo-3',
      projectId: 'p2',
      projectName: `${COMPANY_PROFILE.shortName} Dhanmondi Imperial`,
      category: 'Brick Work',
      url: 'bg-gradient-to-tr from-orange-800 to-amber-600',
      description: 'Partition masonry wall layout completed on Unit B-5.',
      uploadedAt: '2026-06-25T11:15:00Z',
      gpsCoords: '23.7461, 90.3742',
      synced: true
    }
  ]);

  // Selected Category filter for Photos
  const [photoFilter, setPhotoFilter] = useState<'All' | 'Foundation' | 'Structure' | 'Brick Work' | 'Finishing'>('All');

  // Push Notifications simulation
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; type: string; time: string; read: boolean }>>([
    { id: 'n-1', title: 'Installment Due Tomorrow', body: 'Ahmad Junaed (Unit A-402) Monthly downpayment BDT 3,50,000 is outstanding.', type: 'Due Tracking', time: '2 hrs ago', read: false },
    { id: 'n-2', title: 'New Collection Registered', body: 'Received BDT 5,00,000 for Mirpur Project Booking ID: BKG-002.', type: 'Collection Alert', time: '4 hrs ago', read: false },
    { id: 'n-3', title: 'Project Timeline Alert', body: 'Uttara Skyline structural brickwork completion delayed by 4 planned calendar days.', type: 'Project Delay', time: '1 day ago', read: true }
  ]);

  // Local state form captures inside mobile UI
  const [siteReportForm, setSiteReportForm] = useState({ description: '', subcontractor: '', workersCount: '15', remarks: '' });
  const [attendanceSubmitted, setAttendanceSubmitted] = useState<boolean>(false);
  const [gpsCheckStatus, setGpsCheckStatus] = useState<'Checked Out' | 'Checking In' | 'Checked In'>('Checked Out');
  const [materialEntry, setMaterialEntry] = useState({ rod: '0', cement: '0', sand: '0', bricks: '0' });
  const [newLeadForm, setNewLeadForm] = useState({ name: '', phone: '', email: '', budget: '4500000', project: 'p1', requirement: '3BHK Flat' });
  const [crmFollowUpText, setCrmFollowUpText] = useState('');
  const [recoveryNoteText, setRecoveryNoteText] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'Foundation' | 'Structure' | 'Brick Work' | 'Finishing'>('Structure');
  const [selectedProjectForReport, setSelectedProjectForReport] = useState<string>('p1');

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem('alkaswa_mobile_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Dynamic Role Restrictions Overrides
  // Lock the mobile app state to the user's ERP role if they are NOT Founder, MD or GM!
  useEffect(() => {
    if (currentRole === 'CST') {
      setSelectedMobileApp('customer');
    } else if (currentRole === 'ENG') {
      setSelectedMobileApp('engineer');
    } else if (currentRole === 'SLM') {
      setSelectedMobileApp('sales');
    } else if (currentRole === 'ACT') {
      setSelectedMobileApp('crm');
    }
  }, [currentRole]);

  // Simulate network slow/fast load times on changing simulated apps
  const handleAppChange = (app: 'founder' | 'customer' | 'engineer' | 'sales' | 'crm') => {
    setSelectedMobileApp(app);
    if (!isOnline) return;

    setIsSimulatingLoad(true);
    const delay = networkSpeed === 'Slow 3G' ? 1800 : 400;
    setTimeout(() => {
      setIsSimulatingLoad(false);
    }, delay);
  };

  // Trigger Online/Offline State change
  const toggleNetworkConnection = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);

    addAuditLog(
      'MOBILE_NETWORK_TOGGLE',
      'device_status',
      `Mobile connection toggled to ${nextState ? 'ONLINE' : 'OFFLINE'}`,
      `মোবাইল কানেকশন পরিবর্তন করা হয়েছে: ${nextState ? 'অনলাইন' : 'অফলাইন'}`
    );

    // If turned online, auto-trigger queue sync if items exist
    if (nextState && offlineQueue.length > 0) {
      triggerBackgroundSync();
    }
  };

  // Background Sync Engine Handler
  const triggerBackgroundSync = () => {
    if (offlineQueue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(15);

    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Process offline items into real DB state or state logs
            offlineQueue.forEach(item => {
              if (item.type === 'Site Report') {
                const newLog: DailyConstructionLog = {
                  id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                  projectId: item.data.projectId,
                  logDate: new Date(item.timestamp).toISOString().split('T')[0],
                  recordedBy: 'Site Engineer Mobile App',
                  currentMilestone: 'Structure Work',
                  workDescriptionEn: item.data.description + ` (Subcontractor: ${item.data.subcontractor || 'N/A'}, Remarks: ${item.data.remarks || 'N/A'})`,
                  workDescriptionBn: item.data.description,
                  materialsReceivedJson: JSON.stringify({ description: item.data.description }),
                  laborCountDaily: parseInt(item.data.workersCount) || 10
                };
                // Append to Daily Logs database
                const existing = dbService.dailyLogs.getAll();
                dbService.dailyLogs.saveAll([newLog, ...existing]);
              } else if (item.type === 'Lead') {
                const newLead: CRMLead = {
                  id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
                  customerName: item.data.name,
                  mobile: item.data.phone,
                  email: item.data.email,
                  source: 'Campaign',
                  interestedProjectId: item.data.project,
                  budget: parseFloat(item.data.budget),
                  requirement: item.data.requirement,
                  stage: 'New Lead',
                  createdAt: item.timestamp,
                  assignedExecutive: 'Field Sales Representative'
                };
                const existingLeads = dbService.leads.getAll();
                dbService.leads.saveAll([newLead, ...existingLeads]);
                setLeads(prev => [newLead, ...prev]);
              } else if (item.type === 'Photo') {
                setSitePhotos(prev => [
                  {
                    id: `p-${Math.floor(Math.random() * 99999)}`,
                    projectId: item.data.projectId,
                    projectName: projects.find(p => p.id === item.data.projectId)?.nameEn || 'Sourced Project',
                    category: item.data.category,
                    url: 'bg-gradient-to-tr from-slate-700 to-indigo-900',
                    description: item.data.description,
                    uploadedAt: item.timestamp,
                    gpsCoords: item.data.gpsCoords,
                    synced: true
                  },
                  ...prev
                ]);
              }
            });

            // Post real-time sync notification
            const newNotification = {
              id: `n-${Date.now()}`,
              title: 'Offline Sync Successful',
              body: `Successfully synchronized ${offlineQueue.length} queued field logs with Al Kaswa centralized database server.`,
              type: 'Collection Alert',
              time: 'Just now',
              read: false
            };
            setNotifications(prev => [newNotification, ...prev]);
            setOfflineQueue([]);
            setIsSyncing(false);

            addAuditLog(
              'MOBILE_OFFLINE_SYNC',
              'offline_engine',
              `Synchronized ${offlineQueue.length} records safely to production server`,
              `সার্ভার ডাটাবেসের সাথে ${offlineQueue.length} টি অফলাইন রেকর্ড সফলভাবে সিঙ্ক করা হয়েছে`
            );
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  // Queue an offline entry
  const queueOfflineItem = (type: OfflineQueueItem['type'], data: any) => {
    const newItem: OfflineQueueItem = {
      id: `OFF-${Date.now()}`,
      type,
      data,
      timestamp: new Date().toISOString()
    };

    setOfflineQueue(prev => [...prev, newItem]);

    // Push local alert notification
    const pushAlert = {
      id: `n-${Date.now()}`,
      title: `${type} Saved Locally`,
      body: `You are currently OFFLINE. Record has been saved in the mobile queue and will auto-sync when network is available.`,
      type: 'Collection Alert',
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [pushAlert, ...prev]);
  };

  // Submit Site Report Handler
  const handleSiteReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteReportForm.description) return;

    const data = {
      projectId: selectedProjectForReport,
      description: siteReportForm.description,
      subcontractor: siteReportForm.subcontractor,
      workersCount: siteReportForm.workersCount,
      remarks: siteReportForm.remarks
    };

    if (isOnline) {
      // Direct submit to dbService
      const newLog: DailyConstructionLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        projectId: selectedProjectForReport,
        logDate: new Date().toISOString().split('T')[0],
        recordedBy: 'Site Engineer Mobile App',
        currentMilestone: 'Structure Work',
        workDescriptionEn: siteReportForm.description + ` (Subcontractor: ${siteReportForm.subcontractor || 'N/A'}, Remarks: ${siteReportForm.remarks || 'N/A'})`,
        workDescriptionBn: siteReportForm.description,
        materialsReceivedJson: JSON.stringify({ description: siteReportForm.description }),
        laborCountDaily: parseInt(siteReportForm.workersCount) || 15
      };
      const existing = dbService.dailyLogs.getAll();
      dbService.dailyLogs.saveAll([newLog, ...existing]);

      // Push Live Notification
      setNotifications(prev => [
        {
          id: `n-${Date.now()}`,
          title: 'Daily Site Log Submitted',
          body: `Engineers completed daily progress checklist for ${projects.find(p => p.id === selectedProjectForReport)?.nameEn}.`,
          type: 'New Booking',
          time: 'Just now',
          read: false
        },
        ...prev
      ]);

      const projName = projects.find(p => p.id === selectedProjectForReport)?.nameEn || 'Sourced Project';
      addAuditLog(
        'SUBMIT_SITE_LOG',
        'daily_logs',
        `Engineer submitted online daily log for ${projName}`,
        `প্রকৌশলী সফলভাবে অনলাইন ডেইলি প্রোগ্রেস লগ সাবমিট করেছেন: ${projName}`
      );
    } else {
      // Offline mode
      queueOfflineItem('Site Report', data);
    }

    // Reset Form
    setSiteReportForm({ description: '', subcontractor: '', workersCount: '15', remarks: '' });
  };

  // Simulated GPS Check-in
  const handleGpsCheckIn = () => {
    setGpsCheckStatus('Checking In');
    setTimeout(() => {
      // Coordinates of Uttara Skyline roughly
      const lat = parseFloat((23.8724 + (Math.random() - 0.5) * 0.002).toFixed(5));
      const lng = parseFloat((90.3815 + (Math.random() - 0.5) * 0.002).toFixed(5));
      setGpsLocation({ lat, lng });
      setGpsCheckStatus('Checked In');

      const log = {
        id: `gps-${Date.now()}`,
        name: 'Site Engineer (Active)',
        action: 'Check-in: Uttara Skyline Core Site',
        time: 'Just now',
        coords: `${lat}, ${lng}`
      };
      setGpsLogs(prev => [log, ...prev]);

      // Queue attendance record
      if (!isOnline) {
        queueOfflineItem('Attendance', { action: 'GPS Check-in', coords: `${lat}, ${lng}` });
      } else {
        addAuditLog(
          'GPS_CHECKIN',
          'attendance',
          `GPS Checked-in at coordinated coordinates (${lat}, ${lng})`,
          `জিপিএস চেক-ইন সম্পন্ন করা হয়েছে: স্থানাঙ্ক (${lat}, ${lng})`
        );
      }
    }, 1000);
  };

  // Simulated GPS Check-out
  const handleGpsCheckOut = () => {
    setGpsCheckStatus('Checked Out');
    setGpsLocation(null);
    const log = {
      id: `gps-${Date.now()}`,
      name: 'Site Engineer (Active)',
      action: 'Check-out: Site Left',
      time: 'Just now',
      coords: 'None'
    };
    setGpsLogs(prev => [log, ...prev]);

    if (!isOnline) {
      queueOfflineItem('Attendance', { action: 'GPS Check-out', coords: 'None' });
    } else {
      addAuditLog(
        'GPS_CHECKOUT',
        'attendance',
        `GPS Checked-out of construction site`,
        `জিপিএস চেক-আউট সম্পন্ন করা হয়েছে`
      );
    }
  };

  // Simulated Camera Photo Capture & Auto-tag
  const handleCapturePhoto = () => {
    if (!newPhotoDesc) return;

    const data = {
      projectId: selectedProjectForReport,
      category: photoCategory,
      description: newPhotoDesc,
      gpsCoords: gpsLocation ? `${gpsLocation.lat}, ${gpsLocation.lng}` : '23.8724, 90.3815'
    };

    if (isOnline) {
      const newPhoto: MobileSitePhoto = {
        id: `p-${Date.now()}`,
        projectId: selectedProjectForReport,
        projectName: projects.find(p => p.id === selectedProjectForReport)?.nameEn || 'Sourced Project',
        category: photoCategory,
        url: 'bg-gradient-to-tr from-rose-800 via-pink-900 to-indigo-900',
        description: newPhotoDesc,
        uploadedAt: new Date().toISOString(),
        gpsCoords: data.gpsCoords,
        synced: true
      };
      setSitePhotos(prev => [newPhoto, ...prev]);

      addAuditLog(
        'UPLOAD_SITE_PHOTO',
        'project_photos',
        `Uploaded tagged photo in ${photoCategory} category for ${newPhoto.projectName}`,
        `${newPhoto.projectName} এর ${photoCategory} ক্যাটাগরিতে প্রগতি ছবি আপলোড করা হয়েছে`
      );
    } else {
      queueOfflineItem('Photo', data);
    }

    setNewPhotoDesc('');
  };

  // Submit Lead from Sales App
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const data = {
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email,
      budget: newLeadForm.budget,
      project: newLeadForm.project,
      requirement: newLeadForm.requirement
    };

    if (isOnline) {
      const newLead: CRMLead = {
        id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: newLeadForm.name,
        mobile: newLeadForm.phone,
        email: newLeadForm.email,
        source: 'Campaign',
        interestedProjectId: newLeadForm.project,
        budget: parseFloat(newLeadForm.budget),
        requirement: newLeadForm.requirement,
        stage: 'New Lead',
        createdAt: new Date().toISOString(),
        assignedExecutive: 'Mobile Field Agent'
      };

      const existingLeads = dbService.leads.getAll();
      dbService.leads.saveAll([newLead, ...existingLeads]);
      setLeads(prev => [newLead, ...prev]);

      addAuditLog(
        'SUBMIT_MOBILE_LEAD',
        'leads',
        `Registered new prospect lead ${newLead.customerName} from field application`,
        `ফিল্ড মোবাইল অ্যাপ থেকে নতুন কাস্টমার লিড ${newLead.customerName} নথিবদ্ধ করা হয়েছে`
      );
    } else {
      queueOfflineItem('Lead', data);
    }

    setNewLeadForm({ name: '', phone: '', email: '', budget: '4500000', project: 'p1', requirement: '3BHK Flat' });
  };

  // Material consumption submission
  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      rod: materialEntry.rod,
      cement: materialEntry.cement,
      sand: materialEntry.sand,
      bricks: materialEntry.bricks,
      projectId: selectedProjectForReport
    };

    if (isOnline) {
      addAuditLog(
        'MATERIAL_CONSUMPTION_ENTRY',
        'material_reconciliations',
        `Site Engineers submitted real-time material entry: ${materialEntry.rod}t Rod, ${materialEntry.cement} Bags Cement`,
        `বাস্তবমুখী উপাদান ব্যবহার নথিভুক্ত: ${materialEntry.rod} টন রড, ${materialEntry.cement} ব্যাগ সিমেন্ট`
      );

      setNotifications(prev => [
        {
          id: `n-${Date.now()}`,
          title: 'Materials Registered',
          body: `Verified consumption: ${materialEntry.rod}t Steel, ${materialEntry.cement} Bags Cement used on project site.`,
          type: 'Collection Alert',
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    } else {
      queueOfflineItem('Material Entry', data);
    }

    setMaterialEntry({ rod: '0', cement: '0', sand: '0', bricks: '0' });
  };

  // Customer own booking statistics
  const customerBooking = useMemo(() => {
    // Simulated logged in customer: Ahmad Junaed (BKG-001 / Unit A-402)
    return {
      name: 'Ahmad Junaed',
      unit: 'A-402',
      project: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
      totalCost: 10500000,
      paid: 4500000,
      due: 6000000,
      handoverStatus: 'Pending (Completion Progress at 65%)',
      installments: [
        { name: 'Down Payment', amount: 2000000, date: '2024-03-10', status: 'Paid' },
        { name: 'First Installment', amount: 1250000, date: '2025-01-10', status: 'Paid' },
        { name: 'Second Installment', amount: 1250000, date: '2026-03-10', status: 'Paid' },
        { name: 'Third Installment (Pending)', amount: 1500000, date: '2026-10-10', status: 'Due' },
        { name: 'Final Handover Balancer', amount: 4500000, date: 'Upon Keys Delivery', status: 'Due' }
      ]
    };
  }, []);

  // Filtered Photos List
  const filteredPhotos = useMemo(() => {
    if (photoFilter === 'All') return sitePhotos;
    return sitePhotos.filter(p => p.category === photoFilter);
  }, [sitePhotos, photoFilter]);

  // Founder Dashboard aggregate values
  const founderAggregates = useMemo(() => {
    const totalCash = 184500000; // Bank + Cash holdings sum
    const bankBalance = 142000000;
    const dailyCollection = 850000;
    const monthlyCollection = 24500000;
    const outstandingReceivables = 168000000;
    const criticalAlertsCount = 4;
    return {
      totalCash,
      bankBalance,
      dailyCollection,
      monthlyCollection,
      outstandingReceivables,
      criticalAlertsCount
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Upper Module Info Header */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 text-emerald-500 opacity-10">
          <Smartphone size={160} />
        </div>
        <div className="relative z-10">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider uppercase rounded-full border border-emerald-500/20">
            {tl('Phase 18 - Mobile Ecosystem & Field Operations', 'ফেজ ১৮ - মোবাইল ইকোসিস্টেম ও ফিল্ড অপারেশনস')}
          </span>
          <h1 className="font-display font-black text-2xl mt-2 tracking-tight">
            {tl('Unified Mobile Core, Sync & Field Engine', 'সমন্বিত মোবাইল কোর, সিঙ্ক ও ফিল্ড ইঞ্জিন')}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {tl('Simulate Al Kaswa enterprise mobile portals across distinct company units. Tests network speeds, offline-storage queues, automated database syncing, GPS check-ins, progress camera uploads and planning vs actual pipelines.', 'আল কাসওয়া এন্টারপ্রাইজ মোবাইল পোর্টাল সিমুলেশন। অফলাইন স্টোরেজ কিউ, স্বয়ংক্রিয় সিঙ্ক, জিপিএস চেক-ইন এবং ক্যামেরা আপলোড ভেরিফিকেশন।')}
          </p>
        </div>
      </div>

      {/* Grid Layout: Controls / Simulators Panel on Left & Device Simulator Frame on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Simulation Controls, Network Speeds & Offline Sync Monitor */}
        <div className="lg:col-span-4 space-y-6">
          {/* Diagnostic Simulator Controls */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
              <Shield className="text-indigo-600" size={16} />
              {tl('Simulator Engine Controls', 'সিমুলেটর কন্ট্রোল ইউনিট')}
            </h3>

            {/* Offline/Online toggle switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {tl('Simulate Connection Status', 'সংযোগের অবস্থা')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isOnline ? tl('ONLINE (4G Server Link Active)', 'অনলাইন (সার্ভার লিঙ্ক সক্রিয়)') : tl('OFFLINE (Local Draft Mode)', 'অফলাইন (লোকাল ড্রাফট মোড)')}
                </span>
              </div>
              <button
                onClick={toggleNetworkConnection}
                className={`p-2 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center ${
                  isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
                title={tl('Toggle Online/Offline', 'অনলাইন/অফলাইন পরিবর্তন')}
              >
                {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
              </button>
            </div>

            {/* Device Network Performance throttle */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {tl('Simulate Device Connection Speed', 'মোবাইল নেটওয়ার্ক স্পিড')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNetworkSpeed('4G')}
                  className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                    networkSpeed === '4G' 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  4G LTE Speed
                </button>
                <button
                  onClick={() => setNetworkSpeed('Slow 3G')}
                  className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                    networkSpeed === 'Slow 3G' 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Slow 3G / Low-End Device
                </button>
              </div>
            </div>

            {/* Simulated Active Role switcher (Locks child screens unless user switches) */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {tl('Simulated Mobile Role Selector', 'অনুকরণকৃত মোবাইল রোল')}
              </label>
              <select
                value={selectedMobileApp}
                onChange={(e) => handleAppChange(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-slate-800 text-slate-700 cursor-pointer"
                disabled={currentRole !== 'FND' && currentRole !== 'MD' && currentRole !== 'GM'}
              >
                <option value="founder">{tl('Founder App (Executive View)', 'ফাউন্ডার অ্যাপ (প্রধান নির্বাহী)')}</option>
                <option value="customer">{tl('Customer App (Own Records)', 'কাস্টমার অ্যাপ (নিজস্ব বুকিং)')}</option>
                <option value="engineer">{tl('Site Engineer App (Field Operations)', 'সাইট ইঞ্জিনিয়ার অ্যাপ (মাঠপর্যায়)')}</option>
                <option value="sales">{tl('Sales Executive App (Lead Follow-up)', 'সেলস এক্সিকিউটিভ অ্যাপ (লিডস)')}</option>
                <option value="crm">{tl('CRM Portal App (Dues Collection)', 'সিআরএম পোর্টাল অ্যাপ (বকেয়া আদায়)')}</option>
              </select>
              {currentRole !== 'FND' && currentRole !== 'MD' && currentRole !== 'GM' && (
                <span className="text-[9px] text-slate-400 mt-1 block">
                  * Locked to role: {currentRole}
                </span>
              )}
            </div>
          </div>

          {/* Offline Sync Buffer Storage */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                <Database className="text-emerald-500" size={16} />
                {tl('Offline Local Queue Engine', 'অফলাইন লোকাল স্টোরেজ সিঙ্ক')}
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono text-slate-600 font-bold">
                {offlineQueue.length} {tl('Pending', 'অপেক্ষমান')}
              </span>
            </div>

            {offlineQueue.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-center text-[10px] text-slate-400 font-mono">
                {tl('No offline records in queue. Toggle device offline to queue field reports.', 'লোকাল কিউতে কোন তথ্য নেই। অফলাইন টেস্ট করতে সংযোগ পরিবর্তন করুন।')}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-50 rounded-lg p-1.5">
                  {offlineQueue.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100 text-[10px] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 uppercase block tracking-wider">{item.type}</span>
                        <span className="text-slate-400 font-mono">Queued: {new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[9px] font-mono bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>

                {isSyncing ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Syncing database server...</span>
                      <span>{syncProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={triggerBackgroundSync}
                    disabled={!isOnline}
                    className="w-full bg-emerald-500 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none"
                  >
                    <RefreshCw size={13} />
                    {tl('Synchronize Queue Now', 'ম্যানুয়ালি সিঙ্ক করুন')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* GPS Live Tracking monitor */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <MapPin className="text-rose-500" size={16} />
              {tl('Live Location Field Log', 'জিপিএস ট্র্যাকিং ও লগ')}
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">GPS STATE REFERENCE:</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 font-mono">
                  {gpsLocation ? `${gpsLocation.lat}, ${gpsLocation.lng}` : tl('No Live Check-in Active', 'কোন লাইভ চেক-ইন নেই')}
                </span>
                <span className={`h-2 w-2 rounded-full ${gpsLocation ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Recent Log:</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {gpsLogs.map((log) => (
                  <div key={log.id} className="text-[10px] font-mono border-l-2 border-slate-200 pl-2 py-0.5 space-y-0.5">
                    <div className="flex justify-between text-slate-500 text-[9px]">
                      <span>{log.name}</span>
                      <span>{log.time}</span>
                    </div>
                    <p className="text-slate-800 font-bold leading-tight">{log.action}</p>
                    <span className="text-[9px] text-indigo-500">{log.coords}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: IMMERSIVE SMARTPHONE DEVICE PREVIEW FRAME */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Smartphone Frame Outer shell */}
          <div className="w-full max-w-[420px] bg-slate-950 rounded-[40px] p-4.5 border-4 border-slate-800 shadow-2xl relative">
            
            {/* Top Speaker Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-800 h-4.5 w-32 rounded-full flex items-center justify-center z-30">
              <div className="bg-slate-900 h-1 w-10 rounded-full"></div>
            </div>

            {/* Inner Phone Screen */}
            <div className="bg-slate-50 rounded-[28px] overflow-hidden border border-slate-900 h-[680px] flex flex-col justify-between relative text-slate-800">
              
              {/* Device Status Bar */}
              <div className="bg-slate-900 text-white text-[9px] font-mono px-6 py-2.5 flex justify-between items-center z-20">
                <span>7:50 PM UTC</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] tracking-widest">{networkSpeed}</span>
                  {isOnline ? <Wifi size={11} className="text-emerald-400" /> : <WifiOff size={11} className="text-rose-500" />}
                  <span className="bg-slate-800 px-1 py-0.2 rounded">88%</span>
                </div>
              </div>

              {/* Inside Smartphone content window */}
              <div className="flex-1 overflow-y-auto relative bg-slate-50 text-slate-800">
                {isSimulatingLoad ? (
                  /* Performance Simulation Loading Screen */
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center space-y-3 z-30">
                    <Loader2 className="animate-spin text-slate-900" size={32} />
                    <p className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                      {networkSpeed === 'Slow 3G' ? 'SLOW NETWORK: THROTTLING DEVICE RENDER...' : 'LOADING PORTAL CORE...'}
                    </p>
                  </div>
                ) : null}

                {/* Simulated Push alert slide-in */}
                {notifications.slice(0, 1).map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="absolute top-2 left-3 right-3 bg-slate-900 text-white rounded-xl p-2.5 shadow-lg border border-slate-800 z-40 text-[10px]"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Bell size={10} />
                        {n.title}
                      </span>
                      <span className="text-[8px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-300 leading-tight">{n.body}</p>
                  </motion.div>
                ))}

                {/* APP HEADER */}
                <div className="bg-slate-900 text-white p-4 pb-5 rounded-b-2xl shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-black tracking-tight text-sm">
                        {COMPANY_PROFILE.shortName} MOBILE
                      </h4>
                      <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                        {selectedMobileApp.toUpperCase()} MODULE PORTAL
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[8px] font-mono uppercase">
                      {isOnline ? 'Online' : 'Offline Mode'}
                    </span>
                  </div>
                </div>

                {/* ACTIVE APP DISPATCHER */}
                <div className="p-4 space-y-4">
                  
                  {/* APP 1: FOUNDER MOBILE PORTAL */}
                  {selectedMobileApp === 'founder' && (
                    <div className="space-y-4">
                      {/* Financial Aggregates overview */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex flex-col justify-between h-20 shadow-sm">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Cash & Banks</span>
                          <p className="font-sans font-black text-xs mt-1">BDT {founderAggregates.totalCash.toLocaleString()}</p>
                          <span className="text-[8px] text-emerald-400">Secure Vault</span>
                        </div>
                        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex flex-col justify-between h-20 shadow-sm">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Daily Collection</span>
                          <p className="font-sans font-black text-xs mt-1">BDT {founderAggregates.dailyCollection.toLocaleString()}</p>
                          <span className="text-[8px] text-emerald-400">+12% vs Yesterday</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between h-20 shadow-xs">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Monthly Total</span>
                          <p className="font-sans font-black text-xs text-slate-900 mt-1">BDT {founderAggregates.monthlyCollection.toLocaleString()}</p>
                          <span className="text-[8px] text-indigo-500 font-bold">On Track</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between h-20 shadow-xs">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Dues Receivable</span>
                          <p className="font-sans font-black text-xs text-slate-900 mt-1">BDT {founderAggregates.outstandingReceivables.toLocaleString()}</p>
                          <span className="text-[8px] text-rose-500 font-bold">Overdue: 4%</span>
                        </div>
                      </div>

                      {/* Executive Alerts Feed */}
                      <div className="bg-rose-50 border border-rose-150 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px]">
                          <AlertTriangle size={13} />
                          <span>Executive Alerts ({founderAggregates.criticalAlertsCount})</span>
                        </div>
                        <div className="space-y-1.5 text-[10px]">
                          <div className="bg-white p-2 rounded border border-rose-100 text-slate-700">
                            <strong>[Cash Flow]</strong> Balance of Sector-10 account dipped below safety threshold of BDT 50L.
                          </div>
                          <div className="bg-white p-2 rounded border border-rose-100 text-slate-700">
                            <strong>[Project Alert]</strong> Construction at Dhanmondi Imperial delayed by 6 working calendar days due to rainfall.
                          </div>
                          <div className="bg-white p-2 rounded border border-rose-100 text-slate-700">
                            <strong>[Cost Overrun]</strong> Concrete procurement rates registered a 3% variance in BUET quality structural blocks.
                          </div>
                        </div>
                      </div>

                      {/* Construction Progress List */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Project Milestones Tracker</span>
                        <div className="space-y-2">
                          {projects.map((proj) => (
                            <div key={proj.id} className="bg-white p-3 rounded-xl border border-slate-100 space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-800 block truncate max-w-[180px]">{proj.nameEn}</span>
                                <span className="text-[10px] font-bold text-slate-600">{proj.completionPercent}% Complete</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-900 rounded-full" style={{ width: `${proj.completionPercent}%` }}></div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                                <span>Planned: {proj.completionPercent + 4}%</span>
                                <span className="text-rose-500">Variance: -4% Delay</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP 2: CUSTOMER MOBILE PORTAL */}
                  {selectedMobileApp === 'customer' && (
                    <div className="space-y-4">
                      {/* Customer Booking details card */}
                      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
                        <div>
                          <span className="text-[9px] font-mono text-emerald-400 uppercase block tracking-wider">Simulated Active Booking</span>
                          <h4 className="text-xs font-bold mt-0.5">{customerBooking.project}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Unit Code: {customerBooking.unit}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800 pt-2.5">
                          <div>
                            <span className="text-slate-500 block uppercase">Price:</span>
                            <span className="font-bold">BDT {customerBooking.totalCost.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase">Balance Due:</span>
                            <span className="font-bold text-rose-400">BDT {customerBooking.due.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="bg-slate-950 p-2 rounded text-[9px] font-mono border border-slate-800 flex justify-between">
                          <span>Handover Progress:</span>
                          <span className="text-emerald-400 font-bold">{customerBooking.handoverStatus}</span>
                        </div>
                      </div>

                      {/* Payment History & Receipts */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Payment Schedule & Installments</span>
                        <div className="space-y-1.5">
                          {customerBooking.installments.map((inst, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-150 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold block text-slate-800">{inst.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">Due on: {inst.date}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold block">BDT {inst.amount.toLocaleString()}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                  inst.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {inst.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* My Documents Agreement Vault */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-2">
                        <span className="text-[10px] font-bold text-slate-800 block">My Certified Agreements</span>
                        <div className="space-y-1.5 text-[10px]">
                          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                            <span className="font-mono">Registered_Bainanama_A402.pdf</span>
                            <button className="text-indigo-600 hover:underline">Download</button>
                          </div>
                          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                            <span className="font-mono">Money_Receipt_001_Signed.pdf</span>
                            <button className="text-indigo-600 hover:underline">Download</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP 3: SITE ENGINEER MOBILE PORTAL */}
                  {selectedMobileApp === 'engineer' && (
                    <div className="space-y-4">
                      {/* GPS Project check-in module */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-800 block">Attendance & Location Validation</span>
                          <span className="text-[9px] font-mono text-slate-400">GPS Required</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleGpsCheckIn}
                            disabled={gpsCheckStatus === 'Checked In'}
                            className="bg-emerald-500 text-slate-950 font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none"
                          >
                            <MapPin size={11} />
                            {gpsCheckStatus === 'Checking In' ? 'Validating...' : 'GPS Check-In'}
                          </button>
                          <button
                            onClick={handleGpsCheckOut}
                            disabled={gpsCheckStatus === 'Checked Out'}
                            className="bg-slate-100 text-slate-600 font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none"
                          >
                            <X size={11} />
                            Check-Out
                          </button>
                        </div>
                      </div>

                      {/* Daily Site Report log submit */}
                      <form onSubmit={handleSiteReportSubmit} className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-3">
                        <span className="text-[10px] font-bold text-slate-800 block">Submit Daily Site Activity Log</span>
                        
                        <div>
                          <label className="text-[8px] font-mono font-bold text-slate-400 uppercase">Project Select:</label>
                          <select
                            value={selectedProjectForReport}
                            onChange={(e) => setSelectedProjectForReport(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded px-2 py-1 focus:outline-none"
                          >
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>{p.nameEn}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] font-mono font-bold text-slate-400 uppercase">Work Description:</label>
                          <textarea
                            placeholder="Brick work layout, casting, plastering progress details..."
                            value={siteReportForm.description}
                            onChange={(e) => setSiteReportForm({ ...siteReportForm, description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded px-2 py-1.5 h-12 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] font-mono font-bold text-slate-400 uppercase">Subcontractor:</label>
                            <input
                              type="text"
                              placeholder="Mirpur Bricks Ltd"
                              value={siteReportForm.subcontractor}
                              onChange={(e) => setSiteReportForm({ ...siteReportForm, subcontractor: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono font-bold text-slate-400 uppercase">Workers Count:</label>
                            <input
                              type="number"
                              value={siteReportForm.workersCount}
                              onChange={(e) => setSiteReportForm({ ...siteReportForm, workersCount: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 text-white font-bold py-1.5 rounded-lg text-[10px] hover:bg-slate-800 transition-all cursor-pointer border-none"
                        >
                          {isOnline ? 'Post Live Activity Log' : 'Save Offline Draft'}
                        </button>
                      </form>

                      {/* Material entry */}
                      <form onSubmit={handleMaterialSubmit} className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-800 block">Material Consumption Logger</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <label className="text-[8px] font-mono text-slate-400">Steel Rod (Tons):</label>
                            <input
                              type="number"
                              value={materialEntry.rod}
                              onChange={(e) => setMaterialEntry({ ...materialEntry, rod: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono text-slate-400">Cement (Bags):</label>
                            <input
                              type="number"
                              value={materialEntry.cement}
                              onChange={(e) => setMaterialEntry({ ...materialEntry, cement: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono text-slate-400">Sand (Cft):</label>
                            <input
                              type="number"
                              value={materialEntry.sand}
                              onChange={(e) => setMaterialEntry({ ...materialEntry, sand: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono text-slate-400">Bricks (Pcs):</label>
                            <input
                              type="number"
                              value={materialEntry.bricks}
                              onChange={(e) => setMaterialEntry({ ...materialEntry, bricks: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 text-white font-bold py-1.5 rounded-lg text-[10px] hover:bg-indigo-500 border-none cursor-pointer"
                        >
                          Log Construction Materials Used
                        </button>
                      </form>

                      {/* Photo Upload Stream auto tag */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-3">
                        <span className="text-[10px] font-bold text-slate-800 block">Site Progress Camera Portal</span>
                        <div>
                          <label className="text-[8px] font-mono text-slate-400 block mb-0.5">Stage Tag:</label>
                          <select
                            value={photoCategory}
                            onChange={(e) => setPhotoCategory(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded px-2 py-1"
                          >
                            <option value="Foundation">Foundation Stage</option>
                            <option value="Structure">Structure Framework</option>
                            <option value="Brick Work">Brick Masonry</option>
                            <option value="Finishing">Interior Finishing</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Add brief description to photo..."
                            value={newPhotoDesc}
                            onChange={(e) => setNewPhotoDesc(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded px-2 py-1.5 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCapturePhoto}
                            className="w-full bg-slate-900 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 hover:bg-slate-800 border-none cursor-pointer"
                          >
                            <Camera size={13} />
                            Capture & Tag progress photo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP 4: SALES MOBILE PORTAL */}
                  {selectedMobileApp === 'sales' && (
                    <div className="space-y-4">
                      {/* Active Lead Follow up forms */}
                      <form onSubmit={handleLeadSubmit} className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-3">
                        <span className="text-[10px] font-bold text-slate-800 block">Register Active Field Prospect Lead</span>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <label className="text-[8px] font-mono text-slate-400 block mb-0.5">Contact Name:</label>
                            <input
                              type="text"
                              placeholder="Karim Uddin"
                              required
                              value={newLeadForm.name}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono text-slate-400 block mb-0.5">Mobile Phone:</label>
                            <input
                              type="text"
                              placeholder="+88017"
                              required
                              value={newLeadForm.phone}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[8px] font-mono text-slate-400 block mb-0.5">Budget Cap (BDT):</label>
                          <input
                            type="number"
                            value={newLeadForm.budget}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded text-[10px] px-2 py-1 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 text-white font-bold py-1.5 rounded-lg text-[10px] hover:bg-indigo-500 border-none cursor-pointer"
                        >
                          Submit Field Lead
                        </button>
                      </form>

                      {/* Lead Kanban stages scroll */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Leads Stage Tracker</span>
                        <div className="space-y-1.5 max-h-44 overflow-y-auto">
                          {leads.slice(0, 4).map((lead) => (
                            <div key={lead.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-slate-800 block truncate max-w-[120px]">{lead.customerName}</span>
                                <span className="text-[9px] text-slate-400 font-mono">Budget: {lead.budget.toLocaleString()} BDT</span>
                              </div>
                              <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">
                                {lead.stage}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP 5: CRM MOBILE PORTAL */}
                  {selectedMobileApp === 'crm' && (
                    <div className="space-y-4">
                      {/* Recovery collection panel */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-800 block">Due Tracking & Collection Recovery</span>
                          <span className="text-[9px] font-mono text-rose-500">Alert Panel</span>
                        </div>

                        <div className="space-y-2 text-[10px] leading-tight">
                          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Ahmad Junaed</span>
                              <span className="text-rose-600">BDT 15,00,000</span>
                            </div>
                            <p className="text-slate-500 text-[9px]">Uttara Skyline Unit A-402 installment is overdue by 12 calendar days.</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[8px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">Priority: High</span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Rafiqul Islam</span>
                              <span className="text-amber-600">BDT 8,00,000</span>
                            </div>
                            <p className="text-slate-500 text-[9px]">Dhanmondi Imperial Unit B-5 installment is due in 3 working days.</p>
                          </div>
                        </div>
                      </div>

                      {/* Communication log entry */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-3">
                        <span className="text-[10px] font-bold text-slate-800 block">Record Customer Recovery Communication</span>
                        <textarea
                          placeholder="Spoke with client. Promised payout check by next Monday..."
                          value={crmFollowUpText}
                          onChange={(e) => setCrmFollowUpText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded px-2 py-1.5 h-12 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (!crmFollowUpText) return;
                            addAuditLog(
                              'LOG_RECOVERY_COMMUNICATION',
                              'customer_communications',
                              `Logged recovery follow-up conversation: ${crmFollowUpText}`,
                              `বকেয়া আদায়ে যোগাযোগ বিবরণী নথিভুক্ত: ${crmFollowUpText}`
                            );
                            setCrmFollowUpText('');
                            // toast alert
                            setNotifications(prev => [
                              {
                                id: `n-${Date.now()}`,
                                title: 'Communication Saved',
                                body: 'Recovery note registered safely to client database CRM logs.',
                                type: 'Collection Alert',
                                time: 'Just now',
                                read: false
                              },
                              ...prev
                            ]);
                          }}
                          className="w-full bg-slate-900 text-white font-bold py-1.5 rounded-lg text-[10px] hover:bg-slate-800 border-none cursor-pointer"
                        >
                          Save Communication Note
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Home Nav simulator */}
              <div className="bg-slate-900 text-white px-6 py-3 border-t border-slate-800 flex justify-between items-center z-20">
                <button
                  onClick={() => handleAppChange('founder')}
                  className={`flex flex-col items-center gap-1 bg-transparent border-none text-[8px] font-mono cursor-pointer ${selectedMobileApp === 'founder' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  <TrendingUp size={14} />
                  Exec
                </button>
                <button
                  onClick={() => handleAppChange('engineer')}
                  className={`flex flex-col items-center gap-1 bg-transparent border-none text-[8px] font-mono cursor-pointer ${selectedMobileApp === 'engineer' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  <Briefcase size={14} />
                  Field
                </button>
                <button
                  onClick={() => handleAppChange('sales')}
                  className={`flex flex-col items-center gap-1 bg-transparent border-none text-[8px] font-mono cursor-pointer ${selectedMobileApp === 'sales' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  <Users size={14} />
                  Sales
                </button>
                <button
                  onClick={() => handleAppChange('crm')}
                  className={`flex flex-col items-center gap-1 bg-transparent border-none text-[8px] font-mono cursor-pointer ${selectedMobileApp === 'crm' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  <Database size={14} />
                  Recovery
                </button>
                <button
                  onClick={() => handleAppChange('customer')}
                  className={`flex flex-col items-center gap-1 bg-transparent border-none text-[8px] font-mono cursor-pointer ${selectedMobileApp === 'customer' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  <User size={14} />
                  Client
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: CENTRALIZED DYNAMIC PROGRESS PHOTO GALLERY & PLANNING TIMELINES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gallery timelines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-150 pb-2">
            <h3 className="font-display font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <ImageIcon className="text-emerald-500" size={16} />
              {tl('Project Site Progress Gallery & Timelines', 'প্রকল্প প্রগতি ছবি ও টাইমলাইন গ্যালারি')}
            </h3>
            
            {/* Filter tags */}
            <div className="flex gap-1">
              {['All', 'Foundation', 'Structure', 'Brick Work'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPhotoFilter(cat as any)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all border cursor-pointer ${
                    photoFilter === cat 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="border border-slate-150 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                <div className={`h-28 ${photo.url} flex items-center justify-center relative p-3 text-white`}>
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="relative z-10 text-center space-y-1">
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold text-[8px] font-mono rounded uppercase">
                      {photo.category}
                    </span>
                    <h4 className="font-bold text-[10px] leading-tight line-clamp-2">{photo.description}</h4>
                  </div>
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono text-white/80">
                    GPS: {photo.gpsCoords || 'None'}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 text-[10px] font-mono flex justify-between text-slate-500">
                  <span className="truncate max-w-[120px]">{photo.projectName}</span>
                  <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Pipeline Timelines (Planned vs Actual Progress) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
            <Activity className="text-indigo-600" size={16} />
            {tl('Planned Progress vs Actual Progress Pipeline', 'পরিকল্পিত প্রগতি বনাম বাস্তব প্রগতি টাইমলাইন')}
          </h3>

          <div className="space-y-4">
            {projects.map((proj) => {
              // Hypothetical timeline variance calculations
              const plannedPercent = Math.min(proj.completionPercent + 5, 100);
              const actualPercent = proj.completionPercent;
              const delayDays = proj.id === 'p1' ? 14 : 0;

              return (
                <div key={proj.id} className="space-y-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{proj.nameEn}</span>
                    {delayDays > 0 ? (
                      <span className="px-2 py-0.2 bg-rose-50 text-rose-700 text-[9px] font-mono rounded font-bold">
                        {delayDays} Days Delayed
                      </span>
                    ) : (
                      <span className="px-2 py-0.2 bg-emerald-50 text-emerald-700 text-[9px] font-mono rounded font-bold">
                        On Schedule
                      </span>
                    )}
                  </div>

                  {/* Dual comparison bar chart mock */}
                  <div className="space-y-1.5 text-[10px]">
                    {/* Planned progress pipeline */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-400 font-mono text-[9px]">
                        <span>PLANNED TARGET PROGRESS:</span>
                        <span>{plannedPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-300 rounded-full" style={{ width: `${plannedPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Actual construction pipeline */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-800 font-bold font-mono text-[9px]">
                        <span>ACTUAL RECONCILED PROGRESS:</span>
                        <span>{actualPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${delayDays > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${actualPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
