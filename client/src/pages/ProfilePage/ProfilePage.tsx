import { useState, useEffect } from "react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import {
  MapPinIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/providers";
import { supabase } from "@/core/supabase";

const ProfilePage = () => {
  const { user, isEmployer, updateCurrentUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Job Seeker Profile Form State
  const [seekerForm, setSeekerForm] = useState({
    full_name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    linkedin_url: "",
    portfolio_url: "",
    skills: [] as string[],
    experience_history: [] as Array<{ role: string; company: string; period: string; description: string }>,
    education_history: [] as Array<{ school: string; department: string; year: string }>,
  });
  const [newSkillInput, setNewSkillInput] = useState("");

  // Employer Profile Form State
  const [employerForm, setEmployerForm] = useState({
    company_name: "",
    company_sector: "",
    company_size: "10-50",
    phone: "",
    company_website: "",
    company_address: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      if (isEmployer) {
        setEmployerForm({
          company_name: user.company_name || user.full_name || "",
          company_sector: user.company_sector || "Yazılım & Bilişim",
          company_size: user.company_size || "10-50 Çalışan",
          phone: user.phone || "",
          company_website: user.company_website || "",
          company_address: user.company_address || user.location || "İstanbul, Türkiye",
          bio: user.bio || "",
        });
      } else {
        setSeekerForm({
          full_name: user.full_name || "",
          title: user.title || "Full Stack Developer",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "İstanbul, Türkiye",
          bio: user.bio || "",
          linkedin_url: user.linkedin_url || "",
          portfolio_url: user.portfolio_url || "",
          skills: user.skills && Array.isArray(user.skills) && user.skills.length > 0 ? user.skills : ["React", "TypeScript", "Node.js", "TailwindCSS"],
          experience_history: user.experience_history && user.experience_history.length > 0 ? user.experience_history : [
            { role: "Frontend Developer", company: "Tech Studio", period: "2022 - Günümüz", description: "Modern React web uygulamaları geliştirme." },
          ],
          education_history: user.education_history && user.education_history.length > 0 ? user.education_history : [
            { school: "İstanbul Teknik Üniversitesi", department: "Bilgisayar Mühendisliği", year: "2018 - 2022" },
          ],
        });
      }
    }
  }, [user, isEmployer]);

  // Handle Save Job Seeker Profile
  const handleSaveSeeker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (user?.id && user.id !== "super_admin_oxonom") {
        const { error } = await supabase.from("profiles").update({
          full_name: seekerForm.full_name,
          title: seekerForm.title,
          phone: seekerForm.phone,
          location: seekerForm.location,
          bio: seekerForm.bio,
          linkedin_url: seekerForm.linkedin_url,
          portfolio_url: seekerForm.portfolio_url,
          skills: seekerForm.skills,
          experience_history: seekerForm.experience_history,
          education_history: seekerForm.education_history,
        }).eq("id", user.id);

        if (error) throw error;
      }

      updateCurrentUser(seekerForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Employer Profile
  const handleSaveEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (user?.id && user.id !== "super_admin_oxonom") {
        const { error } = await supabase.from("profiles").update({
          full_name: employerForm.company_name,
          company_name: employerForm.company_name,
          company_sector: employerForm.company_sector,
          company_size: employerForm.company_size,
          phone: employerForm.phone,
          company_website: employerForm.company_website,
          company_address: employerForm.company_address,
          bio: employerForm.bio,
        }).eq("id", user.id);

        if (error) throw error;
      }

      updateCurrentUser({
        company_name: employerForm.company_name,
        company_sector: employerForm.company_sector,
        company_size: employerForm.company_size,
        phone: employerForm.phone,
        company_website: employerForm.company_website,
        company_address: employerForm.company_address,
        bio: employerForm.bio,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skill Add / Remove
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !seekerForm.skills.includes(newSkillInput.trim())) {
      setSeekerForm({
        ...seekerForm,
        skills: [...seekerForm.skills, newSkillInput.trim()],
      });
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSeekerForm({
      ...seekerForm,
      skills: seekerForm.skills.filter((s) => s !== skill),
    });
  };

  // Experience Add / Remove
  const handleAddExperience = () => {
    setSeekerForm({
      ...seekerForm,
      experience_history: [
        ...seekerForm.experience_history,
        { role: "", company: "", period: "", description: "" },
      ],
    });
  };

  const handleRemoveExperience = (index: number) => {
    setSeekerForm({
      ...seekerForm,
      experience_history: seekerForm.experience_history.filter((_, i) => i !== index),
    });
  };

  return (
    <PortalLayout title={isEmployer ? "Firma Profilim" : "Özgeçmiş ve Profilim"}>
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-indigo-200">
              {isEmployer
                ? (employerForm.company_name?.substring(0, 2).toUpperCase() || "FR")
                : (seekerForm.full_name?.substring(0, 2).toUpperCase() || "AD")}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEmployer ? employerForm.company_name : seekerForm.full_name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isEmployer ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {isEmployer ? "İşveren / İK Hesabı" : "İş Arayan Hesabı"}
                </span>
              </div>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                {isEmployer ? employerForm.company_sector : seekerForm.title}
              </p>
              <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                {isEmployer ? employerForm.company_address : seekerForm.location}
              </p>
            </div>
          </div>

          {saved && (
            <div className="mt-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-600" />
              Profil bilgileriniz başarıyla güncellendi!
            </div>
          )}

          {/* ========================================================================= */}
          {/* EMPLOYER PROFILE FORM */}
          {/* ========================================================================= */}
          {isEmployer ? (
            <form onSubmit={handleSaveEmployer} className="mt-6 space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Firma / Kurum Adı *</label>
                  <input
                    type="text"
                    required
                    value={employerForm.company_name}
                    onChange={(e) => setEmployerForm({ ...employerForm, company_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Örn: Oxobee Yazılım A.Ş."
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Faaliyet Sektörü</label>
                  <input
                    type="text"
                    value={employerForm.company_sector}
                    onChange={(e) => setEmployerForm({ ...employerForm, company_sector: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Örn: Bilişim, E-Ticaret, Fintek"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">İletişim Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={employerForm.phone}
                    onChange={(e) => setEmployerForm({ ...employerForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="+90 555 000 00 00"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Çalışan Sayısı</label>
                  <select
                    value={employerForm.company_size}
                    onChange={(e) => setEmployerForm({ ...employerForm, company_size: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                  >
                    <option value="1-10">1 - 10 Çalışan</option>
                    <option value="10-50">10 - 50 Çalışan</option>
                    <option value="50-250">50 - 250 Çalışan</option>
                    <option value="250+">250+ Çalışan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Firma Web Sitesi</label>
                  <input
                    type="url"
                    value={employerForm.company_website}
                    onChange={(e) => setEmployerForm({ ...employerForm, company_website: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="https://sirketiniz.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Firma Adresi / Şehir</label>
                  <input
                    type="text"
                    value={employerForm.company_address}
                    onChange={(e) => setEmployerForm({ ...employerForm, company_address: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Levent, İstanbul"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Firma Hakkında & Tanıtım</label>
                <textarea
                  rows={4}
                  value={employerForm.bio}
                  onChange={(e) => setEmployerForm({ ...employerForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                  placeholder="Şirketinizin vizyonu, projeleri ve sunduğu çalışma ortamı hakkında bilgi verin..."
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Firma Bilgilerini Kaydet"}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* JOB SEEKER PROFILE FORM */
            /* ========================================================================= */
            <form onSubmit={handleSaveSeeker} className="mt-6 space-y-6 text-xs">
              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={seekerForm.full_name}
                    onChange={(e) => setSeekerForm({ ...seekerForm, full_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Uzmanlık / Mesleki Ünvan *</label>
                  <input
                    type="text"
                    required
                    value={seekerForm.title}
                    onChange={(e) => setSeekerForm({ ...seekerForm, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Örn: Senior Frontend Developer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={seekerForm.phone}
                    onChange={(e) => setSeekerForm({ ...seekerForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="+90 555 000 00 00"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Şehir / Lokasyon</label>
                  <input
                    type="text"
                    value={seekerForm.location}
                    onChange={(e) => setSeekerForm({ ...seekerForm, location: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="İstanbul, Türkiye"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Hakkımda / Ön Yazı</label>
                <textarea
                  rows={3}
                  value={seekerForm.bio}
                  onChange={(e) => setSeekerForm({ ...seekerForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                  placeholder="Deneyimleriniz, yetenekleriniz ve kariyer hedefleriniz hakkında kısa bir özet..."
                />
              </div>

              {/* Skills Tag Management */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <label className="block font-bold text-gray-700 uppercase mb-2">Yetenekler & Uzmanlıklar</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Yetenek yazıp ekleyin (Örn: React, Figma, Python)"
                    className="flex-1 rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seekerForm.skills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-xs"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-indigo-400 hover:text-indigo-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience History */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 uppercase flex items-center gap-1.5">
                    <BriefcaseIcon className="h-4 w-4 text-indigo-600" />
                    Çalışma Geçmişi ve Deneyimler
                  </label>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-xs"
                  >
                    <PlusIcon className="h-4 w-4" /> Deneyim Ekle
                  </button>
                </div>

                {seekerForm.experience_history.map((exp, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(i)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                      title="Sil"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                      <input
                        type="text"
                        placeholder="Pozisyon (Örn: Senior Frontend)"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...seekerForm.experience_history];
                          updated[i].role = e.target.value;
                          setSeekerForm({ ...seekerForm, experience_history: updated });
                        }}
                        className="rounded-lg border border-gray-300 p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Şirket Adı"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...seekerForm.experience_history];
                          updated[i].company = e.target.value;
                          setSeekerForm({ ...seekerForm, experience_history: updated });
                        }}
                        className="rounded-lg border border-gray-300 p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Çalışma Süresi (Örn: 2021 - 2023)"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...seekerForm.experience_history];
                          updated[i].period = e.target.value;
                          setSeekerForm({ ...seekerForm, experience_history: updated });
                        }}
                        className="rounded-lg border border-gray-300 p-2 text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Görev ve sorumluluklarınız..."
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...seekerForm.experience_history];
                        updated[i].description = e.target.value;
                        setSeekerForm({ ...seekerForm, experience_history: updated });
                      }}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Social / Portfolio Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">LinkedIn Profil URL</label>
                  <input
                    type="url"
                    value={seekerForm.linkedin_url}
                    onChange={(e) => setSeekerForm({ ...seekerForm, linkedin_url: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="https://linkedin.com/in/profiliniz"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Portfolyo / GitHub URL</label>
                  <input
                    type="url"
                    value={seekerForm.portfolio_url}
                    onChange={(e) => setSeekerForm({ ...seekerForm, portfolio_url: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="https://github.com/profiliniz"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Özgeçmiş ve Profilimi Kaydet"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default ProfilePage;
