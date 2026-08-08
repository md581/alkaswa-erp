/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Map as MapIcon, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  TrendingUp, 
  MapPin, 
  FileText, 
  Compass, 
  Layers, 
  Maximize2,
  Trash,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Project, LandRecord, AuditLog } from '../types';
import { formatCurrency } from '../utils/translations';
import { dbService } from '../db/dbService';

// Custom interfaces for the comprehensive modules
export interface LandDetail {
  id: string;
  mouza: string;
  jlNumber: string;
  khatianNumber: string;
  dagNumber: string;
  landType: string; // Nala, Viti, Danga, Shail, Null, etc.
  areaKatha: number;
  areaDecimal: number;
  areaSqFt: number;
  district: string;
  upazila: string;
  union: string;
  block?: string;
  plot?: string;
  ownerName: string;
  ownerPhone: string;
  status: 'Acquired' | 'In Progress' | 'Disputed';
}

interface ProjectDevelopmentControlComponentProps {
  lang: 'en' | 'bn';
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

export function ProjectDevelopmentControlComponent({
  lang,
  projects,
  setProjects,
  addAuditLog
}: ProjectDevelopmentControlComponentProps) {
  const [selectedProjId, setSelectedProjId] = useState<string>(projects[0]?.id || '');
  const currentProj = projects.find(p => p.id === selectedProjId) || projects[0];

  // Sub-form state inside component for selected project
  const [formStage, setFormStage] = useState<'Land Acquisition' | 'Design' | 'Approval' | 'Construction' | 'Sales' | 'Handover' | 'Completion'>('Land Acquisition');
  const [formPercent, setFormPercent] = useState<number>(0);
  const [formBudget, setFormBudget] = useState<number>(100000000);
  const [formCost, setFormCost] = useState<number>(0);
  const [formProfit, setFormProfit] = useState<number>(0);
  const [formStart, setFormStart] = useState<string>('');
  const [formEnd, setFormEnd] = useState<string>('');
  const [formRisk, setFormRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');

  // Sync when currentProj changes
  useEffect(() => {
    if (currentProj) {
      setFormStage(currentProj.currentStage || 'Land Acquisition');
      setFormPercent(currentProj.completionPercent || 0);
      setFormBudget(currentProj.budgetBdt || 100000000);
      setFormCost(currentProj.actualCostBdt || 0);
      setFormProfit(currentProj.profitForecastBdt || 0);
      setFormStart(currentProj.timelineStart || '');
      setFormEnd(currentProj.timelineEnd || '');
      setFormRisk(currentProj.riskIndicator || 'Low');
    }
  }, [selectedProjId, currentProj]);

  const stagesList: ('Land Acquisition' | 'Design' | 'Approval' | 'Construction' | 'Sales' | 'Handover' | 'Completion')[] = [
    'Land Acquisition',
    'Design',
    'Approval',
    'Construction',
    'Sales',
    'Handover',
    'Completion'
  ];

  const stagesBnMap: Record<string, string> = {
    'Land Acquisition': 'ভূমি অধিগ্রহণ',
    'Design': 'নকশা প্রণয়ন',
    'Approval': 'অনুমোদন',
    'Construction': 'নির্মাণ কাজ',
    'Sales': 'বিক্রয়',
    'Handover': 'হস্তান্তর',
    'Completion': 'সম্পন্ন'
  };

  const handleSaveLifecycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProj) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProj.id) {
        return {
          ...p,
          currentStage: formStage,
          completionPercent: formPercent,
          budgetBdt: formBudget,
          actualCostBdt: formCost,
          profitForecastBdt: formProfit,
          timelineStart: formStart,
          timelineEnd: formEnd,
          riskIndicator: formRisk,
          status: formStage === 'Completion' ? 'Handed Over' : 
                  formStage === 'Handover' ? 'Handed Over' :
                  formStage === 'Construction' ? 'Under Construction' :
                  formStage === 'Design' ? 'Planning' : p.status
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    // Save to DB
    try {
      dbService.projects.update(currentProj.id, p => ({
        ...p,
        currentStage: formStage,
        completionPercent: formPercent,
        budgetBdt: formBudget,
        actualCostBdt: formCost,
        profitForecastBdt: formProfit,
        timelineStart: formStart,
        timelineEnd: formEnd,
        riskIndicator: formRisk,
        status: formStage === 'Completion' ? 'Handed Over' : 
                formStage === 'Handover' ? 'Handed Over' :
                formStage === 'Construction' ? 'Under Construction' :
                formStage === 'Design' ? 'Planning' : p.status
      }));
    } catch(err) {
      console.warn("DB offline mode, updating state only");
    }

    addAuditLog(
      'UPDATE',
      'projects',
      `Updated lifecycle development control for project: ${currentProj.nameEn} to stage: ${formStage}`,
      `প্রজেক্ট লাইফসাইকেল পরিবর্তন করা হয়েছে: ${currentProj.nameBn}, নতুন ধাপ: ${stagesBnMap[formStage]}`
    );

    alert(lang === 'en' ? 'Project development controls updated successfully!' : 'প্রকল্পের লাইফসাইকেল কন্ট্রোল সফলভাবে আপডেট করা হয়েছে!');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-display font-black text-lg text-slate-800">
          {lang === 'en' ? 'Project Development Control Engine' : 'প্রজেক্ট ডেভেলপমেন্ট কন্ট্রোল ইঞ্জিন'}
        </h3>
        <p className="text-xs text-slate-500">
          {lang === 'en' ? 'Track real-time multi-stage timelines, risk logs, dynamic profitability projections, and milestones.' : 'বাস্তব সময়ে টাইমলাইন, ঝুঁকি সূচক, ও লাভ প্রাক্কলন ট্র্যাক করুন।'}
        </p>
      </div>

      {/* Selector */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {lang === 'en' ? 'Select Project for Operational Tracking:' : 'অপারেশনাল ট্র্যাকিংয়ের জন্য প্রজেক্ট নির্বাচন করুন:'}
          </span>
          <select
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{lang === 'en' ? p.nameEn : p.nameBn}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-slate-500">
          {lang === 'en' ? 'Project ID:' : 'প্রজেক্ট আইডি:'} <span className="font-bold text-slate-800 uppercase">{currentProj?.id || 'N/A'}</span>
        </div>
      </div>

      {currentProj ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 lg:col-span-2">
            <h4 className="font-display font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              {lang === 'en' ? 'Operational Parameters' : 'অপারেশনাল প্যারামিটার সমূহ'}
            </h4>

            <form onSubmit={handleSaveLifecycle} className="space-y-4 text-xs text-slate-700 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {lang === 'en' ? 'Current Stage' : 'বর্তমান স্তর'}
                  </label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {stagesList.map(st => (
                      <option key={st} value={st}>{st} ({stagesBnMap[st]})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {lang === 'en' ? 'Risk Indicator' : 'ঝুঁকি স্তর'}
                  </label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                  >
                    <option value="Low">Low (নিম্ন)</option>
                    <option value="Medium">Medium (মাঝারি)</option>
                    <option value="High">High (উচ্চ)</option>
                    <option value="Critical">Critical (গুরুতর)</option>
                  </select>
                </div>
              </div>

              {/* Timeline dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {lang === 'en' ? 'Construction/Lifecycle Start Date' : 'নির্মাণ শুরুর তারিখ'}
                  </label>
                  <input
                    type="date"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {lang === 'en' ? 'Target Handover Date' : 'সম্ভাব্য হস্তান্তর তারিখ'}
                  </label>
                  <input
                    type="date"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Cost controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {lang === 'en' ? 'Estimated Budget (BDT)' : 'প্রাক্কলিত বাজেট (৳)'}
                  </label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {lang === 'en' ? 'Actual Cost Incurred (BDT)' : 'এ পর্যন্ত প্রকৃত ব্যয় (৳)'}
                  </label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {lang === 'en' ? 'Profit Forecast (BDT)' : 'প্রাক্কলিত লাভ (৳)'}
                  </label>
                  <input
                    type="number"
                    value={formProfit}
                    onChange={(e) => setFormProfit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Completion percent slider */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                  <span>{lang === 'en' ? 'Physical Completion Percentage' : 'ভৌত অগ্রগতি শতাংশ'}</span>
                  <span className="font-mono text-emerald-600 font-bold">{formPercent}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formPercent}
                    onChange={(e) => setFormPercent(Number(e.target.value))}
                    className="grow h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {lang === 'en' ? 'Save Lifecycle Parameters' : 'লাইফসাইকেল প্যারামিটার সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Visual timeline and metrics */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 text-left">
                {lang === 'en' ? 'Visual Progress Stepper' : 'অগ্রগতি নির্দেশক স্টেপার'}
              </h4>

              <div className="relative pl-6 space-y-4 text-left before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {stagesList.map((st, index) => {
                  const isCurrent = formStage === st;
                  const currentIndex = stagesList.indexOf(formStage);
                  const isPassed = index < currentIndex;

                  return (
                    <div key={st} className="relative flex items-start gap-3">
                      {/* Dot */}
                      <div className={`absolute -left-[23px] w-[11px] h-[11px] rounded-full border-2 bg-white transition-all ${
                        isCurrent ? 'border-emerald-500 bg-emerald-500 ring-4 ring-emerald-100' :
                        isPassed ? 'border-emerald-500 bg-emerald-500' :
                        'border-slate-300'
                      }`} />

                      <div>
                        <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-600' : isPassed ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                          {st}
                        </p>
                        <p className="text-[10px] text-slate-400 font-sans">
                          {stagesBnMap[st]}
                          {isCurrent && ` (${lang === 'en' ? 'Active - ' + formPercent + '% Completed' : 'সক্রিয় - ' + formPercent + '% সম্পন্ন'})`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operational KPIs */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 text-left">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                {lang === 'en' ? 'Project Financial Statement' : 'প্রকল্পের আর্থিক বিবরণী'}
              </h4>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{lang === 'en' ? 'Estimated Cost Budget' : 'প্রাক্কলিত ব্যয় বাজেট'}:</span>
                  <span className="font-bold text-white">৳{formBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{lang === 'en' ? 'Actual Cost Incurred' : 'এ পর্যন্ত প্রকৃত ব্যয়'}:</span>
                  <span className="font-bold text-amber-400">৳{formCost.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-[1px] my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{lang === 'en' ? 'Project Profit Forecast' : 'প্রাক্কলিত লাভ'}:</span>
                  <span className="font-black text-emerald-400 text-sm">৳{formProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">{lang === 'en' ? 'Risk Threshold Status' : 'ঝুঁকি থ্রেশহোল্ড অবস্থা'}:</span>
                  <span className={`px-2 py-0.5 rounded font-sans font-bold uppercase ${
                    formRisk === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                    formRisk === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                    formRisk === 'High' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                  }`}>
                    {formRisk}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs">
          {lang === 'en' ? 'No projects loaded in the system database.' : 'সিস্টেম ডাটাবেসে কোন প্রকল্প লোড করা হয়নি।'}
        </div>
      )}
    </div>
  );
}

interface ProjectLandManagementProps {
  lang: 'en' | 'bn';
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

export default function ProjectLandManagement({
  lang,
  projects,
  setProjects,
  addAuditLog,
}: ProjectLandManagementProps) {
  // Navigation tabs within this module
  const [tab, setTab] = useState<'projects' | 'lands' | 'owners' | 'mouza' | 'lifecycle'>('projects');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Pagination states
  const [projectPage, setProjectPage] = useState(1);
  const [landPage, setLandPage] = useState(1);
  const itemsPerPage = 5;

  // Modals / Form inputs
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [projectForm, setProjectForm] = useState({
    nameEn: '',
    nameBn: '',
    locationEn: '',
    locationBn: '',
    totalFloors: 10,
    landAreaKatha: 5,
    jvaRatioDeveloper: 60,
    jvaRatioLandowner: 40,
    status: 'Planning' as Project['status'],
    completionPercent: 0,
  });

  // Comprehensive simulated land list for Bangladesh Context
  const [lands, setLands] = useState<LandDetail[]>([
    {
      id: 'land-1',
      mouza: 'Bhatara',
      jlNumber: 'JL-12',
      khatianNumber: 'SA-402, RS-112',
      dagNumber: 'Dag-5402',
      landType: 'Viti (ভিটি)',
      areaKatha: 12.5,
      areaDecimal: 20.625,
      areaSqFt: 9000,
      district: 'Dhaka',
      upazila: 'Gulshan',
      union: 'Bhatara Union',
      block: 'Block A',
      plot: 'Plot 15',
      ownerName: 'Hazi Mohammad Solaiman',
      ownerPhone: '01711223344',
      status: 'Acquired',
    },
    {
      id: 'land-2',
      mouza: 'Dakkhinkhan',
      jlNumber: 'JL-45',
      khatianNumber: 'CS-89, RS-245',
      dagNumber: 'Dag-9124',
      landType: 'Nala (নালা)',
      areaKatha: 6.0,
      areaDecimal: 9.9,
      areaSqFt: 4320,
      district: 'Dhaka',
      upazila: 'Uttara',
      union: 'Dakkhinkhan',
      block: 'Block K',
      plot: 'Plot 324',
      ownerName: 'Mrs. Fatema Khatun',
      ownerPhone: '01819876543',
      status: 'In Progress',
    },
    {
      id: 'land-3',
      mouza: 'Joar Sahara',
      jlNumber: 'JL-03',
      khatianNumber: 'CS-510, RS-904',
      dagNumber: 'Dag-1104',
      landType: 'Danga (ডাঙ্গা)',
      areaKatha: 15.0,
      areaDecimal: 24.75,
      areaSqFt: 10800,
      district: 'Dhaka',
      upazila: 'Badda',
      union: 'Badda Union',
      block: 'Block D',
      plot: 'Plot 45',
      ownerName: 'Anisur Rahman Patwary',
      ownerPhone: '01911556677',
      status: 'Acquired',
    },
    {
      id: 'land-4',
      mouza: 'Khilkhet',
      jlNumber: 'JL-18',
      khatianNumber: 'CS-102, RS-452',
      dagNumber: 'Dag-1904',
      landType: 'Shail (শাইল)',
      areaKatha: 8.2,
      areaDecimal: 13.53,
      areaSqFt: 5904,
      district: 'Dhaka',
      upazila: 'Khilkhet',
      union: 'Dumni Union',
      block: 'Block E',
      plot: 'Plot 104',
      ownerName: 'Mst. Rokeya Begum',
      ownerPhone: '01552334455',
      status: 'Disputed',
    }
  ]);

  const [showLandForm, setShowLandForm] = useState(false);
  const [editingLand, setEditingLand] = useState<LandDetail | null>(null);

  const [landForm, setLandForm] = useState({
    mouza: '',
    jlNumber: '',
    khatianNumber: '',
    dagNumber: '',
    landType: 'Viti (ভিটি)',
    areaKatha: 5,
    district: 'Dhaka',
    upazila: '',
    union: '',
    block: '',
    plot: '',
    ownerName: '',
    ownerPhone: '',
    status: 'Acquired' as LandDetail['status'],
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalLandKatha = lands.reduce((acc, curr) => acc + curr.areaKatha, 0);
    const activeConstruction = projects.filter(p => p.status === 'Under Construction').length;
    const disputedLand = lands.filter(l => l.status === 'Disputed').length;

    return {
      totalProjects,
      totalLandKatha,
      activeConstruction,
      disputedLand,
    };
  }, [projects, lands]);

  // Handle Project Form submits
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      // Edit mode
      const updated = projects.map(p => {
        if (p.id === editingProject.id) {
          return {
            ...p,
            nameEn: projectForm.nameEn,
            nameBn: projectForm.nameBn,
            locationEn: projectForm.locationEn,
            locationBn: projectForm.locationBn,
            totalFloors: Number(projectForm.totalFloors),
            landAreaKatha: Number(projectForm.landAreaKatha),
            jvaRatioDeveloper: Number(projectForm.jvaRatioDeveloper),
            jvaRatioLandowner: Number(projectForm.jvaRatioLandowner),
            status: projectForm.status,
            completionPercent: Number(projectForm.completionPercent),
          };
        }
        return p;
      });
      setProjects(updated);
      addAuditLog(
        'UPDATE',
        'projects',
        `Edited project parameters for: ${projectForm.nameEn}`,
        `প্রকল্পের প্যারামিটার পরিবর্তন করেছেন: ${projectForm.nameBn}`
      );
    } else {
      // Create mode
      const newProj: Project = {
        id: `p-${Date.now()}`,
        nameEn: projectForm.nameEn,
        nameBn: projectForm.nameBn,
        locationEn: projectForm.locationEn,
        locationBn: projectForm.locationBn,
        totalFloors: Number(projectForm.totalFloors),
        landAreaKatha: Number(projectForm.landAreaKatha),
        jvaRatioDeveloper: Number(projectForm.jvaRatioDeveloper),
        jvaRatioLandowner: Number(projectForm.jvaRatioLandowner),
        status: projectForm.status,
        completionPercent: Number(projectForm.completionPercent),
      };
      setProjects([...projects, newProj]);
      addAuditLog(
        'INSERT',
        'projects',
        `Created new project: ${projectForm.nameEn}`,
        `নতুন প্রকল্প সৃষ্টি করেছেন: ${projectForm.nameBn}`
      );
    }

    // Reset
    setShowProjectForm(false);
    setEditingProject(null);
    setProjectForm({
      nameEn: '',
      nameBn: '',
      locationEn: '',
      locationBn: '',
      totalFloors: 10,
      landAreaKatha: 5,
      jvaRatioDeveloper: 60,
      jvaRatioLandowner: 40,
      status: 'Planning',
      completionPercent: 0,
    });
  };

  const startEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectForm({
      nameEn: p.nameEn,
      nameBn: p.nameBn,
      locationEn: p.locationEn,
      locationBn: p.locationBn,
      totalFloors: p.totalFloors,
      landAreaKatha: p.landAreaKatha,
      jvaRatioDeveloper: p.jvaRatioDeveloper,
      jvaRatioLandowner: p.jvaRatioLandowner,
      status: p.status,
      completionPercent: p.completionPercent,
    });
    setShowProjectForm(true);
  };

  const handleDeleteProject = (id: string, nameEn: string, nameBn: string) => {
    if (window.confirm(lang === 'en' ? `Are you sure you want to delete ${nameEn}?` : `${nameBn} মুছে ফেলতে আপনি কি নিশ্চিত?`)) {
      setProjects(projects.filter(p => p.id !== id));
      addAuditLog(
        'DELETE',
        'projects',
        `Deleted project record: ${nameEn}`,
        `প্রকল্পের তথ্য মুছে ফেলেছেন: ${nameBn}`
      );
    }
  };

  // Handle Land Form submits
  const handleLandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Katha calculations: 1 Katha = 1.65 Decimals = 720 Sq Ft
    const katha = Number(landForm.areaKatha);
    const decimal = parseFloat((katha * 1.65).toFixed(3));
    const sqFt = Math.round(katha * 720);

    if (editingLand) {
      const updated = lands.map(l => {
        if (l.id === editingLand.id) {
          return {
            ...l,
            mouza: landForm.mouza,
            jlNumber: landForm.jlNumber,
            khatianNumber: landForm.khatianNumber,
            dagNumber: landForm.dagNumber,
            landType: landForm.landType,
            areaKatha: katha,
            areaDecimal: decimal,
            areaSqFt: sqFt,
            district: landForm.district,
            upazila: landForm.upazila,
            union: landForm.union,
            block: landForm.block,
            plot: landForm.plot,
            ownerName: landForm.ownerName,
            ownerPhone: landForm.ownerPhone,
            status: landForm.status,
          };
        }
        return l;
      });
      setLands(updated);
      addAuditLog(
        'UPDATE',
        'land_records',
        `Updated land record details for Mouza: ${landForm.mouza}, Dag: ${landForm.dagNumber}`,
        `ভূমি রেকর্ড সংশোধন করেছেন: মৌজা - ${landForm.mouza}, দাগ - ${landForm.dagNumber}`
      );
    } else {
      const newLand: LandDetail = {
        id: `land-${Date.now()}`,
        mouza: landForm.mouza,
        jlNumber: landForm.jlNumber,
        khatianNumber: landForm.khatianNumber,
        dagNumber: landForm.dagNumber,
        landType: landForm.landType,
        areaKatha: katha,
        areaDecimal: decimal,
        areaSqFt: sqFt,
        district: landForm.district,
        upazila: landForm.upazila,
        union: landForm.union,
        block: landForm.block,
        plot: landForm.plot,
        ownerName: landForm.ownerName,
        ownerPhone: landForm.ownerPhone,
        status: landForm.status,
      };
      setLands([...lands, newLand]);
      addAuditLog(
        'INSERT',
        'land_records',
        `Sourced and recorded land parcel at ${landForm.mouza}, Khatian: ${landForm.khatianNumber}`,
        `নতুন ভূমি অধিগ্রহণ সম্পন্ন: মৌজা - ${landForm.mouza}, খতিয়ান - ${landForm.khatianNumber}`
      );
    }

    setShowLandForm(false);
    setEditingLand(null);
    setLandForm({
      mouza: '',
      jlNumber: '',
      khatianNumber: '',
      dagNumber: '',
      landType: 'Viti (ভিটি)',
      areaKatha: 5,
      district: 'Dhaka',
      upazila: '',
      union: '',
      block: '',
      plot: '',
      ownerName: '',
      ownerPhone: '',
      status: 'Acquired',
    });
  };

  const startEditLand = (l: LandDetail) => {
    setEditingLand(l);
    setLandForm({
      mouza: l.mouza,
      jlNumber: l.jlNumber,
      khatianNumber: l.khatianNumber,
      dagNumber: l.dagNumber,
      landType: l.landType,
      areaKatha: l.areaKatha,
      district: l.district,
      upazila: l.upazila,
      union: l.union,
      block: l.block || '',
      plot: l.plot || '',
      ownerName: l.ownerName,
      ownerPhone: l.ownerPhone,
      status: l.status,
    });
    setShowLandForm(true);
  };

  const handleDeleteLand = (id: string, mouza: string) => {
    if (window.confirm(lang === 'en' ? `Delete land record in ${mouza}?` : `${mouza} এর ভূমি রেকর্ডটি মুছতে চান?`)) {
      setLands(lands.filter(l => l.id !== id));
      addAuditLog(
        'DELETE',
        'land_records',
        `Deleted land record: Mouza ${mouza}`,
        `ভূমি রেকর্ড মুছে ফেলেছেন: মৌজা ${mouza}`
      );
    }
  };

  // Filter & Search Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameBn.includes(searchQuery) ||
        p.locationEn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

  const filteredLands = useMemo(() => {
    return lands.filter(l => {
      const matchesSearch = 
        l.mouza.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.khatianNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.dagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDistrict = filterDistrict === 'All' || l.district === filterDistrict;
      const matchesStatus = filterStatus === 'All' || l.status === filterStatus;

      return matchesSearch && matchesDistrict && matchesStatus;
    });
  }, [lands, searchQuery, filterDistrict, filterStatus]);

  // Paginated elements
  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, projectPage]);

  const paginatedLands = useMemo(() => {
    const start = (landPage - 1) * itemsPerPage;
    return filteredLands.slice(start, start + itemsPerPage);
  }, [filteredLands, landPage]);

  // Unique land owners list extracted dynamically
  const uniqueOwners = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; katha: number }>();
    lands.forEach(l => {
      const existing = map.get(l.ownerPhone);
      if (existing) {
        existing.count += 1;
        existing.katha += l.areaKatha;
      } else {
        map.set(l.ownerPhone, {
          name: l.ownerName,
          phone: l.ownerPhone,
          count: 1,
          katha: l.areaKatha
        });
      }
    });
    return Array.from(map.values());
  }, [lands]);

  // Unique Mouzas overview list extracted dynamically
  const uniqueMouzas = useMemo(() => {
    const map = new Map<string, { mouza: string; jl: string; count: number; katha: number; district: string }>();
    lands.forEach(l => {
      const key = `${l.mouza}-${l.jlNumber}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.katha += l.areaKatha;
      } else {
        map.set(key, {
          mouza: l.mouza,
          jl: l.jlNumber,
          count: 1,
          katha: l.areaKatha,
          district: l.district
        });
      }
    });
    return Array.from(map.values());
  }, [lands]);

  return (
    <div className="space-y-6">
      
      {/* 1. Statistics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {lang === 'en' ? 'Total Project Portfolio' : 'মোট প্রকল্প পোর্টফোলিও'}
            </span>
            <h3 className="text-2xl font-bold font-display text-slate-800 mt-1">{stats.totalProjects}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Multi-company partition active</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {lang === 'en' ? 'Sourced Land Bank' : 'মোট অর্জিত ভূমি ভাণ্ডার'}
            </span>
            <h3 className="text-2xl font-bold font-display text-slate-800 mt-1">{stats.totalLandKatha.toFixed(1)} Katha</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{(stats.totalLandKatha * 1.65).toFixed(1)} Decimal</p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <MapIcon size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {lang === 'en' ? 'Active Civil Sites' : 'সক্রিয় নির্মাণাধীন সাইট'}
            </span>
            <h3 className="text-2xl font-bold font-display text-slate-800 mt-1">{stats.activeConstruction}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Under high-density supervision</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600">
            <Compass size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
              {lang === 'en' ? 'Title/Deed Disputes' : 'আইনি বিরোধ বা ডেসপুট'}
            </span>
            <h3 className="text-2xl font-bold font-display text-rose-600 mt-1">{stats.disputedLand} Records</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Vetted by legal officers</p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle size={24} />
          </div>
        </div>

      </div>

      {/* Tab Switchers */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => { setTab('projects'); setSearchQuery(''); }}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
            tab === 'projects' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-projects"
        >
          {lang === 'en' ? '🏢 Projects Portfolio' : '🏢 প্রকল্পসমূহ'}
        </button>
        <button
          onClick={() => { setTab('lands'); setSearchQuery(''); }}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
            tab === 'lands' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-lands"
        >
          {lang === 'en' ? '🗺️ Land Sourcing Records' : '🗺️ ভূমি অধিগ্রহণ ও খতিয়ান'}
        </button>
        <button
          onClick={() => { setTab('owners'); setSearchQuery(''); }}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
            tab === 'owners' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-owners"
        >
          {lang === 'en' ? '👥 Landowners' : '👥 জমির আদি মালিক'}
        </button>
        <button
          onClick={() => { setTab('mouza'); setSearchQuery(''); }}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
            tab === 'mouza' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-mouzas"
        >
          {lang === 'en' ? '📍 Mouza & J.L. Overview' : '📍 মৌজা ও জে.এল. ওভারভিউ'}
        </button>
        <button
          onClick={() => { setTab('lifecycle'); setSearchQuery(''); }}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
            tab === 'lifecycle' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-lifecycle"
        >
          {lang === 'en' ? '⚙️ Project Lifecycle Control' : '⚙️ প্রজেক্ট লাইফসাইকেল কন্ট্রোল'}
        </button>
      </div>

      {/* Global Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              tab === 'projects' ? (lang === 'en' ? "Search projects name, location..." : "প্রকল্পের নাম, অবস্থান দিয়ে খুঁজুন...") :
              tab === 'lands' ? (lang === 'en' ? "Search Mouza, Dag, Khatian or Owner..." : "মৌজা, দাগ, খতিয়ান বা মালিক দিয়ে খুঁজুন...") :
              lang === 'en' ? "Search records..." : "অনুসন্ধান..."
            }
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
            id="toolbar-search-input"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {tab === 'lands' && (
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-emerald-500 text-slate-700"
              id="district-filter"
            >
              <option value="All">All Districts (সকল জেলা)</option>
              <option value="Dhaka">Dhaka (ঢাকা)</option>
              <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-emerald-500 text-slate-700"
            id="status-filter"
          >
            <option value="All">All Status (সকল অবস্থা)</option>
            {tab === 'projects' ? (
              <>
                <option value="Planning">Planning (পরিকল্পনা)</option>
                <option value="Under Construction">Under Construction (নির্মাণাধীন)</option>
                <option value="Finishing">Finishing (ফিনিশিং)</option>
                <option value="Handed Over">Handed Over (হস্তান্তরিত)</option>
              </>
            ) : (
              <>
                <option value="Acquired">Acquired (অর্জিত)</option>
                <option value="In Progress">In Progress (প্রক্রিয়াধীন)</option>
                <option value="Disputed">Disputed (বিরোধপূর্ণ)</option>
              </>
            )}
          </select>

          {tab === 'projects' && (
            <button
              onClick={() => {
                setEditingProject(null);
                setProjectForm({
                  nameEn: '', nameBn: '', locationEn: '', locationBn: '',
                  totalFloors: 10, landAreaKatha: 5, jvaRatioDeveloper: 60, jvaRatioLandowner: 40,
                  status: 'Planning', completionPercent: 0
                });
                setShowProjectForm(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl shadow-md shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
              id="create-project-btn"
            >
              <Plus size={14} />
              <span>{lang === 'en' ? 'Add Project' : 'নতুন প্রজেক্ট'}</span>
            </button>
          )}

          {tab === 'lands' && (
            <button
              onClick={() => {
                setEditingLand(null);
                setLandForm({
                  mouza: '', jlNumber: '', khatianNumber: '', dagNumber: '',
                  landType: 'Viti (ভিটি)', areaKatha: 5, district: 'Dhaka', upazila: '', union: '',
                  block: '', plot: '', ownerName: '', ownerPhone: '', status: 'Acquired'
                });
                setShowLandForm(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl shadow-md shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
              id="create-land-btn"
            >
              <Plus size={14} />
              <span>{lang === 'en' ? 'Source Land' : 'জমি অধিগ্রহণ'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Tab contents */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6">
        
        {/* TAB 1: PROJECTS PORTFOLIO */}
        {tab === 'projects' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider pb-3">
                    <th className="pb-3">{lang === 'en' ? 'Project Name' : 'প্রকল্পের নাম'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Location' : 'অবস্থান'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Area & Floors' : 'আয়তন ও তলা'}</th>
                    <th className="pb-3">{lang === 'en' ? 'JVA Split (Dev/Owner)' : 'জেভিএ অনুপাত'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Progress' : 'নির্মাণ অগ্রগতি'}</th>
                    <th className="pb-3 text-right">{lang === 'en' ? 'Actions' : 'পদক্ষেপ'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {paginatedProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">
                        <div>
                          <p>{proj.nameEn}</p>
                          <p className="text-slate-400 font-normal mt-0.5 text-[10px]">{proj.nameBn}</p>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        <div>
                          <p className="flex items-center gap-1">
                            <MapPin size={11} className="text-emerald-500" />
                            {proj.locationEn}
                          </p>
                          <p className="text-[10px] text-slate-400 pl-4">{proj.locationBn}</p>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-700">
                        <p className="font-mono text-[11px] font-bold">{proj.landAreaKatha} Katha</p>
                        <p className="text-[10px] text-slate-400">{proj.totalFloors} Stories</p>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        <span className="bg-slate-100 font-mono text-[10px] font-bold px-2 py-0.5 rounded text-slate-700">
                          {proj.jvaRatioDeveloper}% / {proj.jvaRatioLandowner}%
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proj.completionPercent}%` }} />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-700">{proj.completionPercent}%</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            proj.status === 'Under Construction' ? 'bg-cyan-50 text-cyan-600' :
                            proj.status === 'Finishing' ? 'bg-amber-50 text-amber-600' :
                            proj.status === 'Handed Over' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {proj.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => startEditProject(proj)}
                          className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.nameEn, proj.nameBn)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {lang === 'en' ? 'No projects matching search criteria.' : 'কোন প্রকল্প পাওয়া যায়নি।'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredProjects.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">
                  Showing {Math.min(filteredProjects.length, (projectPage - 1) * itemsPerPage + 1)} to {Math.min(filteredProjects.length, projectPage * itemsPerPage)} of {filteredProjects.length}
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={projectPage === 1}
                    onClick={() => setProjectPage(projectPage - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={projectPage * itemsPerPage >= filteredProjects.length}
                    onClick={() => setProjectPage(projectPage + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LAND RECORDS */}
        {tab === 'lands' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider pb-3">
                    <th className="pb-3">{lang === 'en' ? 'Mouza & J.L. No' : 'মৌজা ও জে এল নং'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Khatian & Dag No' : 'খতিয়ান ও দাগ নং'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Block & Plot' : 'ব্লক ও প্লট'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Total Area (K/D/S)' : 'মোট আয়তন'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Land Owner & Status' : 'ভূমির মালিক ও অবস্থা'}</th>
                    <th className="pb-3 text-right">{lang === 'en' ? 'Actions' : 'পদক্ষেপ'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {paginatedLands.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">
                        <div>
                          <p>{l.mouza}</p>
                          <p className="text-slate-400 font-mono text-[9px] font-semibold mt-0.5">{l.jlNumber}</p>
                          <p className="text-[10px] text-slate-500 font-normal">{l.union}, {l.upazila}, {l.district}</p>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-800">{l.khatianNumber}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">{l.dagNumber}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">{l.landType}</p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-700">{l.block || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400">{l.plot || 'N/A'}</p>
                      </td>
                      <td className="py-3.5 font-mono text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{l.areaKatha} Katha</p>
                          <p className="text-[10px] text-slate-500">{l.areaDecimal} Decimal</p>
                          <p className="text-[9px] text-slate-400">{l.areaSqFt.toLocaleString()} Sq Ft</p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div>
                          <p className="font-bold text-slate-800">{l.ownerName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{l.ownerPhone}</p>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase mt-1 inline-block ${
                            l.status === 'Acquired' ? 'bg-emerald-50 text-emerald-700' :
                            l.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => startEditLand(l)}
                          className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLand(l.id, l.mouza)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLands.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {lang === 'en' ? 'No land parcels match criteria.' : 'কোন ভূমি রেকর্ড পাওয়া যায়নি।'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredLands.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">
                  Showing {Math.min(filteredLands.length, (landPage - 1) * itemsPerPage + 1)} to {Math.min(filteredLands.length, landPage * itemsPerPage)} of {filteredLands.length}
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={landPage === 1}
                    onClick={() => setLandPage(landPage - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={landPage * itemsPerPage >= filteredLands.length}
                    onClick={() => setLandPage(landPage + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LANDOWNERS LIST */}
        {tab === 'owners' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-slate-800 mb-2">
              {lang === 'en' ? 'Dynamic Landowner Index' : 'জমির আদি মালিকদের তালিকা'}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider pb-3">
                    <th className="pb-3">{lang === 'en' ? 'Owner Name' : 'মালিকের নাম'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Phone Number' : 'মোবাইল নম্বর'}</th>
                    <th className="pb-3 text-center">{lang === 'en' ? 'Parcels Sourced' : 'অর্জিত খণ্ড সংখ্যা'}</th>
                    <th className="pb-3 text-right">{lang === 'en' ? 'Total Sourced (Katha)' : 'মোট অর্জিত আয়তন (কাঠা)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {uniqueOwners.map((owner, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">{owner.name}</td>
                      <td className="py-3.5 text-slate-500 font-mono">{owner.phone}</td>
                      <td className="py-3.5 text-center font-bold text-indigo-600 bg-indigo-50/20 rounded-md w-12 mx-auto">
                        {owner.count}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-800">
                        {owner.katha.toFixed(1)} Katha
                      </td>
                    </tr>
                  ))}
                  {uniqueOwners.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No landowners on record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MOUZA INDEX */}
        {tab === 'mouza' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-slate-800 mb-2">
              {lang === 'en' ? 'Registered Mouzas & J.L. Survey List' : 'নিবন্ধিত মৌজা ও জরিপ তালিকা'}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider pb-3">
                    <th className="pb-3">{lang === 'en' ? 'Mouza Name' : 'মৌজার নাম'}</th>
                    <th className="pb-3">{lang === 'en' ? 'J.L. Number' : 'জে এল নং'}</th>
                    <th className="pb-3">{lang === 'en' ? 'District' : 'জেলা'}</th>
                    <th className="pb-3 text-center">{lang === 'en' ? 'Active Deeds Sourced' : 'সক্রিয় দলিল সংখ্যা'}</th>
                    <th className="pb-3 text-right">{lang === 'en' ? 'Sum Area' : 'মোট জমির পরিমাণ'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {uniqueMouzas.map((mz, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">{mz.mouza}</td>
                      <td className="py-3.5 text-slate-500 font-mono font-bold">{mz.jl}</td>
                      <td className="py-3.5 text-slate-600">{mz.district}</td>
                      <td className="py-3.5 text-center font-bold text-emerald-600 bg-emerald-50/20 rounded-md w-12 mx-auto">
                        {mz.count}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-800">
                        {mz.katha.toFixed(1)} Katha
                      </td>
                    </tr>
                  ))}
                  {uniqueMouzas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No mouza surveyed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PROJECT DEVELOPMENT CONTROL & LIFECYCLE ENGINE */}
        {tab === 'lifecycle' && (
          <ProjectDevelopmentControlComponent
            lang={lang}
            projects={projects}
            setProjects={setProjects}
            addAuditLog={addAuditLog}
          />
        )}


      </div>

      {/* PROJECT CREATOR MODAL */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowProjectForm(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="font-display font-bold text-lg text-slate-800 mb-4">
              {editingProject ? (lang === 'en' ? 'Edit Project Parameters' : 'প্রকল্পের তথ্য পরিবর্তন') : (lang === 'en' ? 'Create New Real Estate Project' : 'নতুন প্রজেক্ট তৈরি')}
            </h3>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Project Name (EN) *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.nameEn}
                    onChange={(e) => setProjectForm({ ...projectForm, nameEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-name-en"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Project Name (BN) *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.nameBn}
                    onChange={(e) => setProjectForm({ ...projectForm, nameBn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-name-bn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Location (EN) *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.locationEn}
                    onChange={(e) => setProjectForm({ ...projectForm, locationEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-loc-en"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Location (BN) *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.locationBn}
                    onChange={(e) => setProjectForm({ ...projectForm, locationBn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-loc-bn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Total Floors *</label>
                  <input
                    type="number"
                    required
                    value={projectForm.totalFloors}
                    onChange={(e) => setProjectForm({ ...projectForm, totalFloors: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-floors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Katha Area *</label>
                  <input
                    type="number"
                    required
                    value={projectForm.landAreaKatha}
                    onChange={(e) => setProjectForm({ ...projectForm, landAreaKatha: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-katha"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Comp % *</label>
                  <input
                    type="number"
                    required
                    value={projectForm.completionPercent}
                    onChange={(e) => setProjectForm({ ...projectForm, completionPercent: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-comp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">JVA Developer %</label>
                  <input
                    type="number"
                    value={projectForm.jvaRatioDeveloper}
                    onChange={(e) => setProjectForm({ ...projectForm, jvaRatioDeveloper: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-dev-ratio"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">JVA Landowner %</label>
                  <input
                    type="number"
                    value={projectForm.jvaRatioLandowner}
                    onChange={(e) => setProjectForm({ ...projectForm, jvaRatioLandowner: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="proj-form-owner-ratio"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                    id="proj-form-status"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Handed Over">Handed Over</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/15"
                  id="proj-form-submit-btn"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LAND SOURCING MODAL */}
      {showLandForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowLandForm(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="font-display font-bold text-lg text-slate-800 mb-4">
              {editingLand ? 'Edit Land Record Details' : 'Source & Record New Land Deed'}
            </h3>

            <form onSubmit={handleLandSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Mouza Name *</label>
                  <input
                    type="text"
                    required
                    value={landForm.mouza}
                    onChange={(e) => setLandForm({ ...landForm, mouza: e.target.value })}
                    placeholder="e.g., Joar Sahara"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-mouza-input"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">J.L. Number *</label>
                  <input
                    type="text"
                    required
                    value={landForm.jlNumber}
                    onChange={(e) => setLandForm({ ...landForm, jlNumber: e.target.value })}
                    placeholder="e.g., JL-14"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-jl-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Khatian Number (CS/SA/RS) *</label>
                  <input
                    type="text"
                    required
                    value={landForm.khatianNumber}
                    onChange={(e) => setLandForm({ ...landForm, khatianNumber: e.target.value })}
                    placeholder="e.g., CS-12, RS-904"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-khatian-input"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Dag Number *</label>
                  <input
                    type="text"
                    required
                    value={landForm.dagNumber}
                    onChange={(e) => setLandForm({ ...landForm, dagNumber: e.target.value })}
                    placeholder="e.g., Dag-1240"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-dag-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Land Type</label>
                  <select
                    value={landForm.landType}
                    onChange={(e) => setLandForm({ ...landForm, landType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                    id="land-form-type-select"
                  >
                    <option value="Viti (ভিটি)">Viti (ভিটি)</option>
                    <option value="Nala (নালা)">Nala (নালা)</option>
                    <option value="Danga (ডাঙ্গা)">Danga (ডাঙ্গা)</option>
                    <option value="Shail (শাইল)">Shail (শাইল)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Size in Katha *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={landForm.areaKatha}
                    onChange={(e) => setLandForm({ ...landForm, areaKatha: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-katha-input"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">District</label>
                  <select
                    value={landForm.district}
                    onChange={(e) => setLandForm({ ...landForm, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                    id="land-form-dist-select"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Upazila *</label>
                  <input
                    type="text"
                    required
                    value={landForm.upazila}
                    onChange={(e) => setLandForm({ ...landForm, upazila: e.target.value })}
                    placeholder="e.g., Gulshan"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-upazila"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Union *</label>
                  <input
                    type="text"
                    required
                    value={landForm.union}
                    onChange={(e) => setLandForm({ ...landForm, union: e.target.value })}
                    placeholder="e.g., Dumni"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-union"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={landForm.status}
                    onChange={(e) => setLandForm({ ...landForm, status: e.target.value as LandDetail['status'] })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                    id="land-form-status-select"
                  >
                    <option value="Acquired">Acquired</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Disputed">Disputed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Sector Block (Optional)</label>
                  <input
                    type="text"
                    value={landForm.block}
                    onChange={(e) => setLandForm({ ...landForm, block: e.target.value })}
                    placeholder="e.g., Block G"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-block"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Plot Number (Optional)</label>
                  <input
                    type="text"
                    value={landForm.plot}
                    onChange={(e) => setLandForm({ ...landForm, plot: e.target.value })}
                    placeholder="e.g., Plot-145"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-plot"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Land Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={landForm.ownerName}
                    onChange={(e) => setLandForm({ ...landForm, ownerName: e.target.value })}
                    placeholder="e.g., Hazi Solaiman"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-owner-name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Owner Phone *</label>
                  <input
                    type="text"
                    required
                    value={landForm.ownerPhone}
                    onChange={(e) => setLandForm({ ...landForm, ownerPhone: e.target.value })}
                    placeholder="e.g., 01700000000"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="land-form-owner-phone"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLandForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/15"
                  id="land-form-submit-btn"
                >
                  Save Land Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
