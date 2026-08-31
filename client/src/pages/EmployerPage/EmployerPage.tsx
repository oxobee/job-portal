import { Fragment, useEffect, useState } from "react";
import {
  BriefcaseIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  DocumentTextIcon,
    
  EyeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { supabase } from "@/core/supabase";
import { useAuth } from "@/providers";
import { Link } from "react-router-dom";

export interface EmployerJob {
  id: number;
  title: string;
  company: string;
  location: string;
  workplace: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  tags: string[];
  applications?: string;
  employer_id?: string;
  created_at?: string;
}

export interface CandidateApplication {
  id: string;
  job_id: number;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_title?: string;
  applicant_bio?: string;
  applicant_skills?: string[];
  applicant_experience?: any[];
  applicant_education?: any[];
  is_disabled?: boolean;
  disability_type?: string;
  applicant_references?: any[];
  applicant_document_url?: string;
  status: string;
  created_at: string;
  jobs?: EmployerJob;
}

const EmployerPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"jobs" | "applicants">("jobs");
  const [myJobs, setMyJobs] = useState<EmployerJob[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Job Modal State
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    location: "İstanbul / Remote",
    workplace: "Aylık",
    type: "Tam Zamanlı",
    experience: "3-5 years",
    salary: "30.000 TL - 45.000 TL",
    description: "",
    tags: "Tam Zamanlı, Servis, Yemek, SGK",
  });

  // Edit Job Modal State
  const [editingJob, setEditingJob] = useState<EmployerJob | null>(null);

  // Candidate Profile Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const companyName = user?.company_name || user?.full_name || "Şirketim";

  // Fetch Employer Jobs and Applications
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch jobs posted by this employer (or all if employer_id matches user id/email)
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .or(`employer_id.eq.${user?.id},employer_id.eq.${user?.email},company.ilike.%${companyName}%`)
        .order("id", { ascending: false });

      const loadedJobs = jobsData || [];
      setMyJobs(loadedJobs);

      // 2. Fetch applications for these jobs
      const jobIds = loadedJobs.map((j) => j.id);
      if (jobIds.length > 0) {
        const { data: appsData } = await supabase
          .from("applications")
          .select("*, jobs(*)")
          .in("job_id", jobIds)
          .order("created_at", { ascending: false });

        setApplications(appsData || []);
      } else {
        const { data: allApps } = await supabase
          .from("applications")
          .select("*, jobs(*)")
          .order("created_at", { ascending: false });
        setApplications(allApps || []);
      }
    } catch (err) {
      console.warn("Employer load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Create New Job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArr = newJob.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { data, error } = await supabase.from("jobs").insert({
        title: newJob.title,
        company: companyName,
        location: newJob.location,
        workplace: newJob.workplace,
        type: newJob.type,
        experience: newJob.experience,
        salary: newJob.salary,
        description: newJob.description,
        tags: tagsArr,
        employer_id: user?.id || user?.email,
        time: "Yeni",
        applications: "0 Başvuru",
        logo_bg: "bg-indigo-600",
      }).select().single();

      if (error) throw error;
      if (data) setMyJobs((prev) => [data, ...prev]);
      setIsNewJobOpen(false);
      setNewJob({
        title: "",
        location: "İstanbul / Remote",
        workplace: "Remote",
        type: "Full-time",
        experience: "3-5 years",
        salary: "90.000 TL - 140.000 TL",
        description: "",
        tags: "React, Node.js, TypeScript",
      });
      showToast("İş ilanınız başarıyla yayınlandı!");
    } catch (err: any) {
      showToast("İlan eklenirken hata: " + err.message);
    }
  };

  // Update Job
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      const { error } = await supabase.from("jobs").update({
        title: editingJob.title,
        location: editingJob.location,
        workplace: editingJob.workplace,
        type: editingJob.type,
        experience: editingJob.experience,
        salary: editingJob.salary,
        description: editingJob.description,
        tags: Array.isArray(editingJob.tags) ? editingJob.tags : (editingJob.tags as any)?.split(",").map((t: string) => t.trim()),
      }).eq("id", editingJob.id);

      if (error) throw error;
      setMyJobs((prev) => prev.map((j) => (j.id === editingJob.id ? editingJob : j)));
      setEditingJob(null);
      showToast("İlan başarıyla güncellendi!");
    } catch (err: any) {
      showToast("Güncelleme hatası: " + err.message);
    }
  };

  // Delete Job
  const handleDeleteJob = async (id: number) => {
    if (!window.confirm("Bu ilanı yayından kaldırmak istediğinize emin misiniz?")) return;
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
      setMyJobs((prev) => prev.filter((j) => j.id !== id));
      showToast("İlan başarıyla kaldırıldı.");
    } catch (err: any) {
      showToast("Hata: " + err.message);
    }
  };

  // Update Application Status
  const handleUpdateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", appId);
      if (error) throw error;
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
      if (selectedCandidate && selectedCandidate.id === appId) {
        setSelectedCandidate({ ...selectedCandidate, status: newStatus });
      }
      showToast(`Başvuru durumu "${newStatus}" olarak güncellendi.`);
    } catch (err: any) {
      showToast("Durum güncellenemedi: " + err.message);
    }
  };

  return (
    <PortalLayout title="İşveren Yönetim Paneli">
      {/* Toast Notification */}
      <Transition
        show={!!toastMsg}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-gray-900 px-4 py-3 text-white shadow-2xl flex items-center gap-3 border border-gray-700">
          <CheckCircleIcon className="h-6 w-6 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      </Transition>

      <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
        {/* Company Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              {companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                <BuildingOfficeIcon className="h-4 w-4" />
                İşveren / İK Portalı
              </div>
              <h1 className="text-2xl md:text-3xl font-black">{companyName}</h1>
              <p className="text-indigo-200 text-xs mt-1">
                {user?.company_sector ? `${user.company_sector} • ` : ""}
                {user?.company_address || user?.location || "Türkiye"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/profile"
              className="flex-1 md:flex-initial text-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold transition"
            >
              Firma Profilini Düzenle
            </Link>
            <button
              onClick={() => setIsNewJobOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              Yeni İlan Yayınla
            </button>
          </div>
        </div>

        {/* Tab Navigation & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition ${
                activeTab === "jobs"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80"
              }`}
            >
              <BriefcaseIcon className="h-5 w-5" />
              <span>Yayınladığım İlanlar</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "jobs" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {myJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("applicants")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition ${
                activeTab === "applicants"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80"
              }`}
            >
              <UsersIcon className="h-5 w-5" />
              <span>Gelen Aday Başvuruları</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "applicants" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {applications.length}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: POSTED JOBS */}
        {/* ========================================================================= */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Aktif İlanlarınız</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Şirketiniz adına yayında olan açık iş pozisyonları ve başvuru sayıları.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor...</div>
            ) : myJobs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 rounded-3xl p-8 bg-gray-50/50">
                <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">Henüz bir ilan yayınlamadınız</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Açık pozisyonlarınızı yayınlayarak binlerce yetenekli adayın hemen başvurmasını sağlayın.
                </p>
                <button
                  onClick={() => setIsNewJobOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition"
                >
                  <PlusIcon className="h-4 w-4" />
                  İlk İlanınızı Yayınlayın
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Yayında
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.workplace} ({job.type})</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700">{job.salary}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab("applicants");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <UsersIcon className="h-4 w-4" />
                        Başvuruları Gör
                      </button>
                      <button
                        onClick={() => setEditingJob(job)}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                        title="Düzenle"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition"
                        title="Sil"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: APPLICANTS & CANDIDATE PROFILE CARDS */}
        {/* ========================================================================= */}
        {activeTab === "applicants" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Aday Başvuruları</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  İlanlarınıza başvuran adayların profillerini, yeteneklerini ve deneyimlerini inceleyin.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 rounded-3xl p-8 bg-gray-50/50">
                <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">Henüz başvuru yapılmadı</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Adaylar ilanlarınıza başvurdukça profilleri ve detaylı CV kartları burada listelenecektir.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-3">Aday Bilgisi</th>
                      <th className="p-3">Başvurulan Pozisyon</th>
                      <th className="p-3">İletişim</th>
                      <th className="p-3">Durum</th>
                      <th className="p-3 text-right">Aday Kartı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-3">
                          <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <span>{app.applicant_name}</span>
                            {app.is_disabled && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center gap-0.5">
                                ♿ Engelli
                              </span>
                            )}
                          </div>
                          <div className="text-indigo-600 font-medium text-xs">{app.applicant_title || "Yazılım / Tasarım"}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-800">{app.jobs?.title || "İlan"}</div>
                          <div className="text-gray-400 text-[11px]">{new Date(app.created_at).toLocaleDateString("tr-TR")}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-gray-700 flex items-center gap-1">
                            <EnvelopeIcon className="h-3.5 w-3.5 text-gray-400" />
                            {app.applicant_email}
                          </div>
                          {app.applicant_phone && (
                            <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <PhoneIcon className="h-3 w-3 text-gray-400" />
                              {app.applicant_phone}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={app.status || "Beklemede"}
                            onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                            className="rounded-lg border border-gray-200 py-1 px-2 text-xs font-semibold bg-white focus:border-indigo-600"
                          >
                            <option value="Beklemede">⏳ Beklemede</option>
                            <option value="İncelendi">👁️ İncelendi</option>
                            <option value="Mülakata Çağrıldı">📞 Mülakata Çağrıldı</option>
                            <option value="Kabul Edildi">✅ Kabul Edildi</option>
                            <option value="Reddedildi">❌ Reddedildi</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedCandidate(app)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-xs transition"
                          >
                            <EyeIcon className="h-4 w-4" />
                            Profili İncele
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CANDIDATE DETAIL PROFILE CARD MODAL */}
      {/* ========================================================================= */}
      <Transition.Root show={!!selectedCandidate} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedCandidate(null)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-black flex items-center justify-center shadow-md">
                    {selectedCandidate?.applicant_name?.substring(0, 2).toUpperCase() || "AD"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCandidate?.applicant_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-semibold text-indigo-600">{selectedCandidate?.applicant_title || "İş Arayan"}</p>
                        {selectedCandidate?.is_disabled && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center gap-1">
                            ♿ Engelli Aday ({selectedCandidate?.disability_type || "Belirtildi"})
                          </span>
                        )}
                      </div>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedCandidate?.jobs?.title} Pozisyonu Başvurusu</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {selectedCandidate && (
                <div className="mt-6 space-y-6 text-xs">
                  {/* Contact Info Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-indigo-600" />
                      <span className="font-semibold text-gray-800">{selectedCandidate.applicant_email}</span>
                    </div>
                    {selectedCandidate.applicant_phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-indigo-600" />
                        <span className="font-semibold text-gray-800">{selectedCandidate.applicant_phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio / Summary */}
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Ön Yazı / Hakkında</h4>
                    <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-gray-700 leading-relaxed text-xs">
                      {selectedCandidate.applicant_bio || "Aday tarafından henüz bir ön yazı eklenmemiştir."}
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedCandidate.applicant_skills && selectedCandidate.applicant_skills.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Yetenekler & Uzmanlıklar</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.applicant_skills.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience History */}
                  {selectedCandidate.applicant_experience && selectedCandidate.applicant_experience.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Çalışma Geçmişi / Deneyim</h4>
                      <div className="space-y-2">
                        {selectedCandidate.applicant_experience.map((exp: any, i: number) => (
                          <div key={i} className="p-3 bg-white border border-gray-200 rounded-xl">
                            <div className="font-bold text-gray-900">{exp.role || exp.title}</div>
                            <div className="text-gray-500 font-medium">{exp.company} • {exp.period || exp.years}</div>
                            {exp.description && <p className="text-gray-600 mt-1 text-[11px]">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* References (Referanslar) */}
                  {selectedCandidate.applicant_references && selectedCandidate.applicant_references.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Referanslar (Geçmiş Çalışma İrtibatları)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedCandidate.applicant_references.map((ref: any, i: number) => (
                          <div key={i} className="p-3 bg-white border border-gray-200 rounded-xl space-y-0.5">
                            <div className="font-bold text-gray-900">{ref.name}</div>
                            <div className="text-gray-500 font-medium">{ref.company}</div>
                            <div className="text-indigo-600 font-bold flex items-center gap-1 mt-1">
                              <PhoneIcon className="h-3 w-3" /> {ref.phone}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Document / Certificate */}
                  {selectedCandidate.applicant_document_url && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">Adayın Yüklediği Belge / CV</span>
                          <span className="text-[11px] text-emerald-700">{selectedCandidate.applicant_document_url}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-white text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[11px]">
                        Dosya Eki Mevcut
                      </span>
                    </div>
                  )}

                  {/* Education */}
                  {selectedCandidate.applicant_education && selectedCandidate.applicant_education.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Eğitim Bilgileri</h4>
                      <div className="space-y-2">
                        {selectedCandidate.applicant_education.map((edu: any, i: number) => (
                          <div key={i} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
                            <AcademicCapIcon className="h-5 w-5 text-indigo-600 shrink-0" />
                            <div>
                              <div className="font-bold text-gray-900">{edu.school || edu.university}</div>
                              <div className="text-gray-500">{edu.degree || edu.department} • {edu.year}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions & Status Change */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">Durum:</span>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                        {selectedCandidate.status || "Beklemede"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateApplicationStatus(selectedCandidate.id, "Mülakata Çağrıldı")}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-xs"
                      >
                        📞 Mülakata Çağır
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(selectedCandidate.id, "Kabul Edildi")}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-xs"
                      >
                        ✅ Kabul Et
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(selectedCandidate.id, "Reddedildi")}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition"
                      >
                        ❌ Reddet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* ========================================================================= */}
      {/* NEW JOB MODAL */}
      {/* ========================================================================= */}
      <Transition.Root show={isNewJobOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsNewJobOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                  Yeni İş İlanı Yayınla
                </h3>
                <button onClick={() => setIsNewJobOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Pozisyon / İlan Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Temizlik Görevlisi, İnşaat Ustası, Garson, Şoför"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Şirket Adı</label>
                    <input
                      type="text"
                      disabled
                      value={companyName}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-xs bg-gray-50 text-gray-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Lokasyon</label>
                    <input
                      type="text"
                      placeholder="Örn: İstanbul / Remote"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma Şekli</label>
                    <select
                      value={newJob.workplace}
                      onChange={(e) => setNewJob({ ...newJob, workplace: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    >
                      <option value="Aylık">Aylık</option>
                      <option value="Günlük / Yevmiyeli">Günlük / Yevmiyeli</option>
                      <option value="Saatlik">Saatlik</option>
                      <option value="Haftalık">Haftalık</option>
                      <option value="Uzaktan Çalışma">Uzaktan Çalışma</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma Türü</label>
                    <select
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    >
                      <option value="Tam Zamanlı">Tam Zamanlı</option>
                      <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                      <option value="Yevmiyeli / Dönemsel">Yevmiyeli / Dönemsel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Deneyim</label>
                    <select
                      value={newJob.experience}
                      onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    >
                      <option value="1-3 years">1-3 Yıl</option>
                      <option value="3-5 years">3-5 Yıl</option>
                      <option value="5+ years">5+ Yıl</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Maaş Bilgisi</label>
                  <input
                    type="text"
                    placeholder="Örn: 30.000 TL - 45.000 TL/ay"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Etiketler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    placeholder="Tam Zamanlı, Servis, Yemek, SGK"
                    value={newJob.tags}
                    onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">İş Tanımı ve Aranan Nitelikler</label>
                  <textarea
                    rows={3}
                    placeholder="Pozisyon hakkında açıklamalar..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewJobOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md shadow-indigo-200"
                  >
                    İlanı Yayınla
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* ========================================================================= */}
      {/* EDIT JOB MODAL */}
      {/* ========================================================================= */}
      <Transition.Root show={!!editingJob} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditingJob(null)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">İlanı Düzenle</h3>
                <button onClick={() => setEditingJob(null)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {editingJob && (
                <form onSubmit={handleUpdateJob} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">İlan Başlığı</label>
                    <input
                      type="text"
                      required
                      value={editingJob.title}
                      onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Lokasyon</label>
                    <input
                      type="text"
                      value={editingJob.location}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma Şekli</label>
                      <select
                        value={editingJob.workplace}
                        onChange={(e) => setEditingJob({ ...editingJob, workplace: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      >
                        <option value="Aylık">Aylık</option>
                        <option value="Günlük / Yevmiyeli">Günlük / Yevmiyeli</option>
                        <option value="Saatlik">Saatlik</option>
                        <option value="Haftalık">Haftalık</option>
                        <option value="Uzaktan Çalışma">Uzaktan Çalışma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma Türü</label>
                      <select
                        value={editingJob.type}
                        onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      >
                        <option value="Tam Zamanlı">Tam Zamanlı</option>
                        <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                        <option value="Yevmiyeli / Dönemsel">Yevmiyeli / Dönemsel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Maaş</label>
                      <input
                        type="text"
                        value={editingJob.salary}
                        onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">İş Tanımı ve Açıklama</label>
                    <textarea
                      rows={3}
                      value={editingJob.description || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingJob(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md shadow-indigo-200"
                    >
                      Güncelle
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>
    </PortalLayout>
  );
};

export default EmployerPage;
