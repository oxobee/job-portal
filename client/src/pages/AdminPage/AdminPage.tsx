import { Fragment, useEffect, useState } from "react";
import {
  BriefcaseIcon,
  UsersIcon,
  GlobeAltIcon,
  ChartBarIcon,
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { supabase } from "@/core/supabase";

export interface SiteSettings {
  id: number;
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
}

export interface AdminJob {
  id: number;
  title: string;
  company: string;
  location: string;
  workplace: string;
  type: string;
  experience: string;
  salary: string;
  salary_min?: number;
  salary_max?: number;
  time?: string;
  applications?: string;
  logo_bg?: string;
  description?: string;
  tags?: string[];
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: "super_admin" | "hr_recruiter" | "job_seeker";
  status: "active" | "banned";
  phone?: string;
  created_at?: string;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<"settings" | "jobs" | "users" | "applications">("settings");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SiteSettings>({
    id: 1,
    site_name: "Job Portal",
    site_description: "En iyi kariyer ve iş fırsatları platformu",
    logo_url: "",
    favicon_url: "",
    og_title: "Job Portal - Kariyer ve İş Fırsatları",
    og_description: "Türkiye ve dünyadan binlerce güncel iş ilanına hemen başvurun.",
    og_image_url: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Jobs State
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({
    title: "",
    company: "",
    location: "İstanbul / Remote",
    workplace: "Remote",
    type: "Full-time",
    experience: "3-5 years",
    salary: "30.000 TL - 45.000 TL",
    description: "",
    tags: "Tam Zamanlı, Servis, Yemek, SGK",
  });

  // Users State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "job_seeker" as "super_admin" | "hr_recruiter" | "job_seeker",
    status: "active" as "active" | "banned",
    phone: "",
  });

  // Applications State
  const [applications, setApplications] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1. Fetch Site Settings
  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (data) {
        setSettings(data);
        if (data.site_name) document.title = data.site_name;
        if (data.favicon_url) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = data.favicon_url;
        }
      }
    } catch (e) {
      console.warn("Settings load error:", e);
    }
  };

  // 2. Fetch Jobs
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const { data } = await supabase.from("jobs").select("*").order("id", { ascending: false });
      if (data) setJobs(data);
    } catch (e) {
      console.warn("Jobs load error:", e);
    } finally {
      setJobsLoading(false);
    }
  };

  // 3. Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (data) setUsers(data);
    } catch (e) {
      console.warn("Users load error:", e);
    } finally {
      setUsersLoading(false);
    }
  };

  // 4. Fetch Applications
  const fetchApplications = async () => {
    try {
      const { data } = await supabase.from("applications").select("*, jobs(*)").order("created_at", { ascending: false });
      if (data) setApplications(data);
    } catch (e) {
      console.warn("Applications load error:", e);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchJobs();
    fetchUsers();
    fetchApplications();
  }, []);

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const { error } = await supabase.from("site_settings").upsert({
        id: 1,
        site_name: settings.site_name,
        site_description: settings.site_description,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        og_title: settings.og_title,
        og_description: settings.og_description,
        og_image_url: settings.og_image_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      showToast("✅ Site, Logo ve OG Meta Ayarları başarıyla kaydedildi!");
      document.title = settings.site_name;
    } catch (err: any) {
      showToast("Hata: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Delete Single Job
  const handleDeleteJob = async (id: number) => {
    if (!window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setSelectedJobIds((prev) => prev.filter((i) => i !== id));
      showToast("İlan başarıyla silindi.");
    } catch (err: any) {
      showToast("İlan silinirken hata oluştu: " + err.message);
    }
  };

  // Bulk Delete Jobs
  const handleBulkDeleteJobs = async () => {
    if (selectedJobIds.length === 0) return;
    if (!window.confirm(`Seçilen ${selectedJobIds.length} adet ilanı toplu olarak silmek istiyor musunuz?`)) return;

    try {
      const { error } = await supabase.from("jobs").delete().in("id", selectedJobIds);
      if (error) throw error;
      setJobs((prev) => prev.filter((j) => !selectedJobIds.includes(j.id)));
      showToast(`Seçilen ${selectedJobIds.length} ilan başarıyla silindi.`);
      setSelectedJobIds([]);
    } catch (err: any) {
      showToast("Toplu silme hatası: " + err.message);
    }
  };

  // Update Job Handler
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      const { error } = await supabase.from("jobs").update({
        title: editingJob.title,
        company: editingJob.company,
        location: editingJob.location,
        workplace: editingJob.workplace,
        type: editingJob.type,
        experience: editingJob.experience,
        salary: editingJob.salary,
        description: editingJob.description,
        tags: Array.isArray(editingJob.tags) ? editingJob.tags : (editingJob.tags as any)?.split(",").map((t: string) => t.trim()),
      }).eq("id", editingJob.id);

      if (error) throw error;
      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? editingJob : j)));
      setEditingJob(null);
      showToast("İlan başarıyla güncellendi!");
    } catch (err: any) {
      showToast("Güncelleme hatası: " + err.message);
    }
  };

  // Create New Job from Admin
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArr = newJobData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { data, error } = await supabase.from("jobs").insert({
        title: newJobData.title,
        company: newJobData.company,
        location: newJobData.location,
        workplace: newJobData.workplace,
        type: newJobData.type,
        experience: newJobData.experience,
        salary: newJobData.salary,
        description: newJobData.description,
        tags: tagsArr,
        time: "Yeni",
        applications: "0 Başvuru",
        logo_bg: "bg-indigo-600",
      }).select().single();

      if (error) throw error;
      if (data) setJobs((prev) => [data, ...prev]);
      setIsNewJobModalOpen(false);
      setNewJobData({
        title: "",
        company: "",
        location: "İstanbul / Remote",
        workplace: "Remote",
        type: "Full-time",
        experience: "3-5 years",
        salary: "$90k - $120k/yr",
        description: "",
        tags: "React, Node.js, Remote",
      });
      showToast("Yeni ilan başarıyla eklendi!");
    } catch (err: any) {
      showToast("İlan eklenirken hata: " + err.message);
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("Kullanıcı silindi.");
    } catch (err: any) {
      showToast("Kullanıcı silinirken hata: " + err.message);
    }
  };

  // Update User Handler
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: editingUser.full_name,
        role: editingUser.role,
        status: editingUser.status,
        phone: editingUser.phone,
        password: editingUser.password,
      }).eq("id", editingUser.id);

      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
      showToast("Kullanıcı güncellendi!");
    } catch (err: any) {
      showToast("Kullanıcı güncelleme hatası: " + err.message);
    }
  };

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from("profiles").insert({
        full_name: newUserData.full_name,
        email: newUserData.email.toLowerCase().trim(),
        password: newUserData.password || "Password2026!",
        role: newUserData.role,
        status: newUserData.status,
        phone: newUserData.phone,
      }).select().single();

      if (error) throw error;
      if (data) setUsers((prev) => [data, ...prev]);
      setIsNewUserModalOpen(false);
      setNewUserData({
        full_name: "",
        email: "",
        password: "",
        role: "job_seeker",
        status: "active",
        phone: "",
      });
      showToast("Yeni kullanıcı oluşturuldu!");
    } catch (err: any) {
      showToast("Kullanıcı ekleme hatası: " + err.message);
    }
  };

  // Filtered lists
  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.location.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <PortalLayout title="Süper Admin Paneli">
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
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheckIcon className="h-5 w-5 text-indigo-400" />
              Süper Yönetici Kontrol Merkezi
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Süper Admin Paneli</h1>
            <p className="text-indigo-200 text-sm mt-1">
              Site kimliği, logo, favicon, OG meta etiketleri, iş ilanları ve kullanıcıları tek ekrandan yönetin.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2.5 text-center border border-white/10">
              <span className="text-xs text-indigo-200 block">Toplam İlan</span>
              <span className="text-xl font-extrabold text-white">{jobs.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2.5 text-center border border-white/10">
              <span className="text-xs text-indigo-200 block">Kullanıcılar</span>
              <span className="text-xl font-extrabold text-white">{users.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2.5 text-center border border-white/10">
              <span className="text-xs text-indigo-200 block">Başvurular</span>
              <span className="text-xl font-extrabold text-white">{applications.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
          {[
            { id: "settings", name: "Site & SEO / Logo / OG Ayarları", icon: GlobeAltIcon },
            { id: "jobs", name: "İş İlanları Yönetimi", icon: BriefcaseIcon, count: jobs.length },
            { id: "users", name: "Kullanıcı Yönetimi", icon: UsersIcon, count: users.length },
            { id: "applications", name: "Başvurular & Raporlar", icon: ChartBarIcon, count: applications.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: SITE & LOGO & OG SETTINGS */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Site ve SEO Meta Bilgileri</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Logonuzu, favicon ikonunuzu ve sosyal medya paylaşımlarında çıkan Open Graph görsel/metinlerini belirleyin.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Site Adı (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.site_name}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                      placeholder="Örn: Job Portal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Site Sloganı / Kısa Açıklama
                    </label>
                    <input
                      type="text"
                      value={settings.site_description}
                      onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                      placeholder="Örn: En iyi kariyer fırsatları"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <PhotoIcon className="h-4 w-4" /> Logo ve Favicon Görselleri
                  </h3>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700">Logo URL / Dosya Yolu</label>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Önerilen Ebat: 512x512px (Kare) veya 250x60px (Yatay SVG/PNG)
                      </span>
                    </div>
                    <input
                      type="text"
                      value={settings.logo_url}
                      onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="https://alanadiniz.com/logo.png veya /assets/logo.svg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700">Favicon URL / Dosya Yolu</label>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Önerilen Ebat: 32x32px veya 64x64px (.ico / .png)
                      </span>
                    </div>
                    <input
                      type="text"
                      value={settings.favicon_url}
                      onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="https://alanadiniz.com/favicon.ico veya /favicon.ico"
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200/80 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    <GlobeAltIcon className="h-4 w-4" /> Open Graph (OG) Sosyal Medya Paylaşım Etiketleri
                  </h3>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700">OG Başlığı (og:title)</label>
                      <span className="text-[11px] text-gray-500 font-medium">Önerilen: 60 Karakter</span>
                    </div>
                    <input
                      type="text"
                      value={settings.og_title}
                      onChange={(e) => setSettings({ ...settings, og_title: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="Sosyal medyada paylaşılınca çıkacak başlık"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700">OG Açıklaması (og:description)</label>
                      <span className="text-[11px] text-gray-500 font-medium">Önerilen: 150-160 Karakter</span>
                    </div>
                    <textarea
                      rows={2}
                      value={settings.og_description}
                      onChange={(e) => setSettings({ ...settings, og_description: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="Sosyal medyada paylaşılınca çıkacak açıklama metni..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700">OG Paylaşım Görseli URL (og:image)</label>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Standart Ebat: 1200 x 630 px (JPG / PNG)
                      </span>
                    </div>
                    <input
                      type="text"
                      value={settings.og_image_url}
                      onChange={(e) => setSettings({ ...settings, og_image_url: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="https://alanadiniz.com/og-image.jpg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                >
                  {isSavingSettings ? "Kaydediliyor..." : "Ayarları Kaydet ve Uygula"}
                </button>
              </form>
            </div>

            {/* Live Social Media Preview Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5 text-indigo-600" />
                  Sosyal Medya Paylaşım Kartı Önizlemesi
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Siteniz WhatsApp, X (Twitter), Facebook ve LinkedIn üzerinde paylaşıldığında aşağıdaki kart gibi görünecektir:
                </p>

                <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm">
                  <div className="h-44 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center relative overflow-hidden">
                    {settings.og_image_url ? (
                      <img
                        src={settings.og_image_url}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center text-white p-4">
                        <GlobeAltIcon className="h-10 w-10 mx-auto mb-1 text-indigo-200" />
                        <span className="text-xs font-bold">1200 x 630 px Görsel Alanı</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                      isbul-app.vercel.app
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
                      {settings.og_title || settings.site_name}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {settings.og_description || settings.site_description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Dimensions Guide Card */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 text-xs text-indigo-950 space-y-3">
                <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  📐 Tavsiye Edilen Görsel Ebatları Rehberi
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-indigo-600">•</span>
                    <span><strong>Logo (Kare):</strong> 512 x 512 px (PNG / WebP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-indigo-600">•</span>
                    <span><strong>Logo (Yatay Menü):</strong> 250 x 60 px (SVG / PNG)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-indigo-600">•</span>
                    <span><strong>Favicon:</strong> 32 x 32 px veya 64 x 64 px (.ico / .png)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-indigo-600">•</span>
                    <span><strong>OG Paylaşım Görseli:</strong> 1200 x 630 px (1.91:1 Oran, Max 5MB)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOBS MANAGEMENT */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">İş İlanları Yönetimi</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  İlanları tekli veya toplu olarak silebilir, düzenleyebilir veya yeni ilan yayınlayabilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedJobIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteJobs}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-200 hover:bg-red-500 transition active:scale-95"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Seçilenleri Sil ({selectedJobIds.length})
                  </button>
                )}
                <button
                  onClick={() => setIsNewJobModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95"
                >
                  <PlusIcon className="h-4 w-4" />
                  Yeni İlan Ekle
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="İlan başlığı, şirket veya lokasyonda ara..."
                className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-2.5 text-xs focus:border-indigo-600"
              />
              <span className="text-xs font-medium text-gray-500">
                {filteredJobs.length} ilan listelendi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJobIds(filteredJobs.map((j) => j.id));
                          } else {
                            setSelectedJobIds([]);
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </th>
                    <th className="p-3">Pozisyon & Şirket</th>
                    <th className="p-3">Lokasyon & Tür</th>
                    <th className="p-3">Maaş</th>
                    <th className="p-3">Başvuru</th>
                    <th className="p-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobsLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        İlan bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => {
                      const isSelected = selectedJobIds.includes(job.id);
                      return (
                        <tr key={job.id} className={`hover:bg-gray-50/80 transition ${isSelected ? "bg-indigo-50/30" : ""}`}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedJobIds((prev) => prev.filter((i) => i !== job.id));
                                } else {
                                  setSelectedJobIds((prev) => [...prev, job.id]);
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-gray-900 text-sm">{job.title}</div>
                            <div className="text-gray-500 font-medium">{job.company}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-gray-700">{job.location}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-[10px] font-semibold rounded text-gray-600">
                              {job.workplace} • {job.type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-emerald-700">{job.salary}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-semibold text-[11px]">
                              {job.applications || "0"}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => setEditingJob(job)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Düzenle"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Sil"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Kullanıcı Yönetimi</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Süper Admin, İK Yöneticisi ve İş Arayan kullanıcılarını ekleyebilir, rollerini değiştirebilir veya silebilirsiniz.
                </p>
              </div>

              <button
                onClick={() => setIsNewUserModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95"
              >
                <PlusIcon className="h-4 w-4" />
                Yeni Kullanıcı Oluştur
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Kullanıcı adı, e-posta veya rolde ara..."
                className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-2.5 text-xs focus:border-indigo-600"
              />
              <span className="text-xs font-medium text-gray-500">
                {filteredUsers.length} kullanıcı
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-3">Kullanıcı Adı & E-posta</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">Telefon</th>
                    <th className="p-3">Kayıt Tarihi</th>
                    <th className="p-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        Kullanıcı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{u.full_name || "İsimsiz"}</div>
                          <div className="text-gray-500 font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              u.role === "super_admin"
                                ? "bg-purple-100 text-purple-800"
                                : u.role === "hr_recruiter"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role === "super_admin"
                              ? "Süper Admin"
                              : u.role === "hr_recruiter"
                              ? "İK / İşveren"
                              : "İş Arayan"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {u.status === "active" ? "Aktif" : "Yasaklı"}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{u.phone || "-"}</td>
                        <td className="p-3 text-gray-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("tr-TR") : "-"}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Düzenle"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: APPLICATIONS */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Gelen İş Başvuruları Raporu</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Kullanıcıların canlı siteden ilanlara yaptığı tüm başvuruların listesi.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-3">Başvuran Kişi</th>
                    <th className="p-3">İlan Başlığı & Şirket</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">Başvuru Tarihi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        Henüz başvuru kaydı bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition">
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{app.applicant_name || "Misafir Kullanıcı"}</div>
                          <div className="text-gray-400 text-[11px]">{app.applicant_email || "-"}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-indigo-700">{app.jobs?.title || "Genel Başvuru"}</div>
                          <div className="text-gray-500">{app.jobs?.company || "-"}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            {app.status || "iletildi"}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">
                          {app.created_at ? new Date(app.created_at).toLocaleString("tr-TR") : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* NEW JOB MODAL */}
      <Transition.Root show={isNewJobModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsNewJobModalOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                  Yeni İlan Ekle
                </h3>
                <button onClick={() => setIsNewJobModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Pozisyon / İlan Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Temizlik Görevlisi, İnşaat Ustası, Şoför"
                    value={newJobData.title}
                    onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Şirket Adı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Oxobee Tech"
                      value={newJobData.company}
                      onChange={(e) => setNewJobData({ ...newJobData, company: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Lokasyon</label>
                    <input
                      type="text"
                      placeholder="Örn: İstanbul / Remote"
                      value={newJobData.location}
                      onChange={(e) => setNewJobData({ ...newJobData, location: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma</label>
                    <select
                      value={newJobData.workplace}
                      onChange={(e) => setNewJobData({ ...newJobData, workplace: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Tür</label>
                    <select
                      value={newJobData.type}
                      onChange={(e) => setNewJobData({ ...newJobData, type: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Deneyim</label>
                    <select
                      value={newJobData.experience}
                      onChange={(e) => setNewJobData({ ...newJobData, experience: e.target.value })}
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
                    value={newJobData.salary}
                    onChange={(e) => setNewJobData({ ...newJobData, salary: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Etiketler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    placeholder="Tam Zamanlı, Servis, Yemek, SGK"
                    value={newJobData.tags}
                    onChange={(e) => setNewJobData({ ...newJobData, tags: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">İş Açıklaması</label>
                  <textarea
                    rows={3}
                    placeholder="İlan detayları..."
                    value={newJobData.description}
                    onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewJobModalOpen(false)}
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Şirket Adı</label>
                      <input
                        type="text"
                        required
                        value={editingJob.company}
                        onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
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
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Çalışma</label>
                      <select
                        value={editingJob.workplace}
                        onChange={(e) => setEditingJob({ ...editingJob, workplace: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Tür</label>
                      <select
                        value={editingJob.type}
                        onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
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
                    <label className="block font-bold text-gray-700 uppercase mb-1">Açıklama</label>
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

      {/* EDIT USER MODAL */}
      <Transition.Root show={!!editingUser} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditingUser(null)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Kullanıcıyı Düzenle</h3>
                <button onClick={() => setEditingUser(null)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {editingUser && (
                <form onSubmit={handleUpdateUser} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Ad Soyad</label>
                    <input
                      type="text"
                      required
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">E-posta (Değiştirilemez)</label>
                    <input
                      type="email"
                      disabled
                      value={editingUser.email}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-xs bg-gray-50 text-gray-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Kullanıcı Rolü</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      >
                        <option value="job_seeker">İş Arayan</option>
                        <option value="hr_recruiter">İK / İşveren</option>
                        <option value="super_admin">Süper Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Hesap Durumu</label>
                      <select
                        value={editingUser.status}
                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      >
                        <option value="active">Aktif</option>
                        <option value="banned">Yasaklı</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Yeni Şifre Belirle</label>
                    <input
                      type="text"
                      placeholder="Şifreyi değiştirmek için yazın..."
                      value={editingUser.password || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md shadow-indigo-200"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* CREATE USER MODAL */}
      <Transition.Root show={isNewUserModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsNewUserModalOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Yeni Kullanıcı Oluştur</h3>
                <button onClick={() => setIsNewUserModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad ve Soyad"
                    value={newUserData.full_name}
                    onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">E-posta Adresi *</label>
                  <input
                    type="email"
                    required
                    placeholder="ornek@alanadi.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Şifre *</label>
                  <input
                    type="text"
                    required
                    placeholder="En az 6 karakter"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Rol</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    >
                      <option value="job_seeker">İş Arayan</option>
                      <option value="hr_recruiter">İK / İşveren</option>
                      <option value="super_admin">Süper Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Durum</label>
                    <select
                      value={newUserData.status}
                      onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value as any })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    >
                      <option value="active">Aktif</option>
                      <option value="banned">Yasaklı</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewUserModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md shadow-indigo-200"
                  >
                    Kullanıcıyı Oluştur
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>
    </PortalLayout>
  );
};

export default AdminPage;
