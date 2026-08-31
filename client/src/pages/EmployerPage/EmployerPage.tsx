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
      EyeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BellIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon,
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
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  tags: string[];
  applications?: string;
  employer_id?: string;
  employer_logo?: string;
  hide_phone?: boolean;
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

  // New Job Modal State (With 4 mandatory sections)
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    location: "İstanbul (Esenyurt)",
    workplace: "Aylık",
    type: "Tam Zamanlı",
    experience: "1-3 Yıl",
    salary: "30.000 TL - 45.000 TL/ay",
    description: "",
    responsibilities: "Günlük verilen görevlerin eksiksiz yapılması\nŞantiye ve iş güvenliği kurallarına uyulması\nEkip ile koordineli çalışma",
    requirements: "En az 1 yıl saha deneyimi\nDisiplinli ve takım çalışmasına uygun\nAskerliğini yapmış veya tecilli",
    benefits: "Tam SGK + Asgari Ücret Üzeri Maaş\nGünlük Yemek Kartı / Sıcak Yemek\nServis veya Yol Ücreti",
    tags: "Tam Zamanlı, Servis, Yemek, SGK",
  });

  // Edit Job Modal State
  const [editingJob, setEditingJob] = useState<EmployerJob | null>(null);

  // Candidate Profile Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);

  // Notification Modal State
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState<CandidateApplication | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: "Tebrikler, Başvurunuz Kabul Edildi!",
    message: "Başvurunuz incelendi ve olumlu sonuçlandı. Lütfen belirtilen gün ve saatte görüşmeye geliniz.",
    interview_date: "",
    interview_address: user?.company_address || "Şirket / Şantiye Merkezimiz",
    include_date: true,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const companyName = user?.company_name || user?.full_name || "Şirketim";

  // Fetch Employer Jobs and Applications
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .or(`employer_id.eq.${user?.id},employer_id.eq.${user?.email},company.ilike.%${companyName}%`)
        .order("id", { ascending: false });

      const loadedJobs = jobsData || [];
      setMyJobs(loadedJobs);

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

  // Create New Job with 4 structured sections
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArr = newJob.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const respArr = newJob.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean);
      const reqArr = newJob.requirements.split("\n").map((s) => s.trim()).filter(Boolean);
      const benArr = newJob.benefits.split("\n").map((s) => s.trim()).filter(Boolean);

      const { data, error } = await supabase.from("jobs").insert({
        title: newJob.title,
        company: companyName,
        location: newJob.location,
        workplace: newJob.workplace,
        type: newJob.type,
        experience: newJob.experience,
        salary: newJob.salary,
        description: newJob.description,
        responsibilities: respArr,
        requirements: reqArr,
        benefits: benArr,
        tags: tagsArr,
        employer_id: user?.id || user?.email,
        employer_logo: (user as any)?.company_logo || (user as any)?.logo_url || "",
        hide_phone: !!(user as any)?.hide_phone,
        time: "Yeni",
        applications: "0 Başvuru",
        logo_bg: "bg-indigo-600",
      }).select().single();

      if (error) throw error;
      if (data) setMyJobs((prev) => [data, ...prev]);
      setIsNewJobOpen(false);
      showToast("İş ilanınız 4 bölümüyle başarıyla yayınlandı!");
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
        responsibilities: Array.isArray(editingJob.responsibilities) ? editingJob.responsibilities : (editingJob.responsibilities as any)?.split("\n").map((s: string) => s.trim()),
        requirements: Array.isArray(editingJob.requirements) ? editingJob.requirements : (editingJob.requirements as any)?.split("\n").map((s: string) => s.trim()),
        benefits: Array.isArray(editingJob.benefits) ? editingJob.benefits : (editingJob.benefits as any)?.split("\n").map((s: string) => s.trim()),
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

  // Open Notification Sender Modal
  const handleOpenNotificationModal = (candidate: CandidateApplication, defaultTitle: string) => {
    setTargetCandidate(candidate);
    setNotificationForm({
      title: defaultTitle,
      message: defaultTitle.includes("Kabul")
        ? "Tebrikler! Başvurduğunuz iş ilanına kabul edildiniz. Lütfen aşağıda belirtilen saat ve adreste hazır bulununuz."
        : "Başvurunuz için teşekkür ederiz. Sizi ilk yüz yüze görüşmeye davet etmek istiyoruz.",
      interview_date: "",
      interview_address: user?.company_address || "Şirket / Şantiye Adresi",
      include_date: true,
    });
    setNotificationModalOpen(true);
  };

  // Send Notification to Candidate
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCandidate) return;

    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: targetCandidate.user_id || targetCandidate.applicant_email,
        employer_id: user?.id || user?.email,
        employer_name: companyName,
        job_title: targetCandidate.jobs?.title || "İş İlanı",
        title: notificationForm.title,
        message: notificationForm.message,
        interview_date: notificationForm.include_date ? notificationForm.interview_date : "",
        interview_address: notificationForm.interview_address,
        contact_phone: user?.phone || "",
        is_phone_hidden: !!(user as any)?.hide_phone,
        is_read: false,
      });

      if (error) throw error;

      // Update candidate status to approved / invited
      const newStatus = notificationForm.title.includes("Kabul") ? "Kabul Edildi" : "Mülakata Çağrıldı";
      handleUpdateApplicationStatus(targetCandidate.id, newStatus);

      setNotificationModalOpen(false);
      showToast(`🔔 "${targetCandidate.applicant_name}" adayına bildirim başarıyla iletildi!`);
    } catch (err: any) {
      showToast("Bildirim gönderilemedi: " + err.message);
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
            {(user as any)?.company_logo ? (
              <img
                src={(user as any).company_logo}
                alt={companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                {companyName.substring(0, 2).toUpperCase()}
              </div>
            )}
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
              Firma ve Yasal Bilgiler
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

        {/* TAB 1: POSTED JOBS */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Yayındaki İlanlarınız</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Açık pozisyonlarınız ve başvuru sayıları.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor...</div>
            ) : myJobs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 rounded-3xl p-8 bg-gray-50/50">
                <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">Henüz bir ilan yayınlamadınız</h3>
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
                        onClick={() => setActiveTab("applicants")}
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

        {/* TAB 2: APPLICANTS & DIRECT CALL & NOTIFICATION SENDING */}
        {activeTab === "applicants" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Aday Başvuruları</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  İlanlarınıza başvuran adayları arayabilir, kabul edip bildirim gönderebilirsiniz.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-300 rounded-3xl p-8 bg-gray-50/50">
                <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">Henüz başvuru yapılmadı</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-3">Aday Bilgisi</th>
                      <th className="p-3">Başvurulan Pozisyon</th>
                      <th className="p-3">Doğrudan İletişim</th>
                      <th className="p-3">Durum</th>
                      <th className="p-3 text-right">İşlemler</th>
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
                          <div className="text-indigo-600 font-medium text-xs">{app.applicant_title || "İş Arayan"}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-800">{app.jobs?.title || "İlan"}</div>
                          <div className="text-gray-400 text-[11px]">{new Date(app.created_at).toLocaleDateString("tr-TR")}</div>
                        </td>
                        <td className="p-3">
                          {app.applicant_phone ? (
                            <a
                              href={`tel:${app.applicant_phone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
                            >
                              <PhoneIcon className="h-3.5 w-3.5 text-emerald-600" />
                              {app.applicant_phone} (Ara)
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
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
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleOpenNotificationModal(app, "Tebrikler, Başvurunuz Kabul Edildi!")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-xs"
                            title="Adaya Bildirim Gönder"
                          >
                            <BellIcon className="h-3.5 w-3.5" />
                            Bildirim Gönder
                          </button>
                          <button
                            onClick={() => setSelectedCandidate(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-xs"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            Kartı İncele
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

      {/* CANDIDATE DETAIL PROFILE CARD MODAL */}
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
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-1.5 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {selectedCandidate && (
                <div className="mt-6 space-y-6 text-xs">
                  {/* Direct Call Button Bar */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-emerald-600" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Aday Telefon Numarası</span>
                        <span className="text-sm font-bold text-emerald-950 font-mono">{selectedCandidate.applicant_phone || "Belirtilmedi"}</span>
                      </div>
                    </div>
                    {selectedCandidate.applicant_phone && (
                      <a
                        href={`tel:${selectedCandidate.applicant_phone}`}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        Hemen Telefonla Ara
                      </a>
                    )}
                  </div>

                  {/* Bio / Summary */}
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Hakkında / İş Deneyimi Özeti</h4>
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

                  {/* Actions & Notification */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedCandidate(null);
                        handleOpenNotificationModal(selectedCandidate, "Tebrikler, Başvurunuz Kabul Edildi!");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <BellIcon className="h-4 w-4" />
                      Kabul Et & Bildirim Gönder
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCandidate(null);
                        handleOpenNotificationModal(selectedCandidate, "Mülakat ve Görüşme Daveti");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <CalendarDaysIcon className="h-4 w-4" />
                      Mülakata Çağır
                    </button>
                    <button
                      onClick={() => handleUpdateApplicationStatus(selectedCandidate.id, "Reddedildi")}
                      className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* SEND NOTIFICATION MODAL */}
      <Transition.Root show={notificationModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setNotificationModalOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-indigo-600" />
                  Adaya Bildirim Gönder
                </h3>
                <button onClick={() => setNotificationModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {targetCandidate && (
                <form onSubmit={handleSendNotification} className="mt-4 space-y-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">Alıcı Aday:</span>
                    <span className="font-bold text-gray-900 text-sm">{targetCandidate.applicant_name}</span>
                    <span className="text-gray-500 text-xs ml-2">({targetCandidate.jobs?.title})</span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Bildirim Başlığı *</label>
                    <input
                      type="text"
                      required
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600 font-bold text-indigo-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Bildirim Mesajı *</label>
                    <textarea
                      rows={3}
                      required
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                      placeholder="Adaya iletilecek özel mesaj..."
                    />
                  </div>

                  {/* Optional Interview Date & Time */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include_date"
                        checked={notificationForm.include_date}
                        onChange={(e) => setNotificationForm({ ...notificationForm, include_date: e.target.checked })}
                        className="h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="include_date" className="font-bold text-indigo-950 text-xs cursor-pointer">
                        Görüşme Tarih ve Saati Ekle (Opsiyonel)
                      </label>
                    </div>

                    {notificationForm.include_date && (
                      <div className="space-y-2 pt-1 pl-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Tarih ve Saat</label>
                          <input
                            type="datetime-local"
                            value={notificationForm.interview_date}
                            onChange={(e) => setNotificationForm({ ...notificationForm, interview_date: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 p-2 text-xs bg-white focus:border-indigo-600"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Görüşme / Şantiye Adresi</label>
                          <input
                            type="text"
                            value={notificationForm.interview_address}
                            onChange={(e) => setNotificationForm({ ...notificationForm, interview_address: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 p-2 text-xs bg-white focus:border-indigo-600"
                            placeholder="Esenyurt Şantiyesi, No: 12"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNotificationModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                      Bildirimi Gönder
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* NEW JOB MODAL (WITH 4 MANDATORY SECTIONS) */}
      <Transition.Root show={isNewJobOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsNewJobOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Pozisyon / İlan Başlığı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Kalıp Ustası, Temizlik Personeli"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Şehir / İlçe *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: İstanbul (Esenyurt)"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma Periyodu</label>
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
                    <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma Şekli</label>
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
                      <option value="Deneyimsiz">Deneyimsiz</option>
                      <option value="1-3 Yıl">1-3 Yıl</option>
                      <option value="3-5 Yıl">3-5 Yıl</option>
                      <option value="5+ Yıl Usta">5+ Yıl Usta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Maaş / Ücret Bilgisi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 30.000 TL - 45.000 TL/ay veya 1.500 TL/günlük"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                {/* 4 STRUCTURED SECTIONS */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-bold text-indigo-950 uppercase mb-1">1. Pozisyon Hakkında (İş Tanımı) *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Pozisyonun genel tanımı ve şantiye/işyeri hakkında bilgi..."
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-950 uppercase mb-1">2. Sorumluluklar (Her satıra bir madde yazın)</label>
                    <textarea
                      rows={2}
                      placeholder="Kalıp bağlama ve demir montajı yapılması&#10;İş güvenliği kurallarına uyulması"
                      value={newJob.responsibilities}
                      onChange={(e) => setNewJob({ ...newJob, responsibilities: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-950 uppercase mb-1">3. Aranan Nitelikler (Her satıra bir madde yazın)</label>
                    <textarea
                      rows={2}
                      placeholder="En az 2 yıl kalıpçılık tecrübesi&#10;Takım çalışmasına yatkın"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-950 uppercase mb-1">4. Yan Haklar & Avantajlar (Her satıra bir madde yazın)</label>
                    <textarea
                      rows={2}
                      placeholder="Tam SGK + Dolgun Maaş&#10;Sıcak Yemek / Yemek Kartı&#10;Yatakhane ve Servis"
                      value={newJob.benefits}
                      onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
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

      {/* EDIT JOB MODAL */}
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma Periyodu</label>
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
                    <label className="block font-bold text-gray-700 uppercase mb-1">İş Tanımı</label>
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
