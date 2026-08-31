import { useState, useEffect } from "react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import {
  MapPinIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  BriefcaseIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  UserGroupIcon,
  HeartIcon,
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
    is_disabled: false,
    disability_type: "",
    document_name: "",
    document_url: "",
    skills: [] as string[],
    experience_history: [] as Array<{ role: string; company: string; period: string; description: string }>,
    references_list: [] as Array<{ name: string; company: string; phone: string; note?: string }>,
    education_history: [] as Array<{ school: string; department: string; year: string }>,
  });
  const [newSkillInput, setNewSkillInput] = useState("");

  // Employer Profile Form State
  const [employerForm, setEmployerForm] = useState({
    company_name: "",
    company_sector: "",
    company_size: "10-50 Çalışan",
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
          company_sector: user.company_sector || "İnşaat & Taahhüt",
          company_size: user.company_size || "10-50 Çalışan",
          phone: user.phone || "",
          company_website: user.company_website || "",
          company_address: user.company_address || user.location || "İstanbul, Türkiye",
          bio: user.bio || "",
        });
      } else {
        setSeekerForm({
          full_name: user.full_name || "",
          title: user.title || "İnşaat & Kalıp Ustası",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "İstanbul (Esenyurt)",
          bio: user.bio || "",
          is_disabled: !!user.is_disabled,
          disability_type: user.disability_type || "",
          document_name: user.document_name || "",
          document_url: user.document_url || "",
          skills: user.skills && Array.isArray(user.skills) && user.skills.length > 0
            ? user.skills
            : ["Kalıp Bağlama", "Gazaltı Kaynağı", "Forklift Operatörlüğü", "B Sınıfı Ehliyet"],
          experience_history: user.experience_history && user.experience_history.length > 0
            ? user.experience_history
            : [
                {
                  role: "Kalıpçı Ustası",
                  company: "Özdemir İnşaat & Yapı",
                  period: "2020 - 2023",
                  description: "Şantiyede kolon, perde ve döşeme kalıp bağlama işleri.",
                },
              ],
          references_list: user.references_list && user.references_list.length > 0
            ? user.references_list
            : [
                {
                  name: "Hasan Usta (Şantiye Şefi)",
                  company: "Özdemir İnşaat",
                  phone: "0532 111 22 33",
                  note: "Eski şantiye şefim",
                },
              ],
          education_history: user.education_history && user.education_history.length > 0
            ? user.education_history
            : [
                { school: "Mesleki Eğitim Merkezi", department: "Yapı ve İnşaat Bölümü", year: "2016" },
              ],
        });
      }
    }
  }, [user, isEmployer]);

  // Save Job Seeker Profile
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
          is_disabled: seekerForm.is_disabled,
          disability_type: seekerForm.disability_type,
          document_name: seekerForm.document_name,
          document_url: seekerForm.document_url,
          skills: seekerForm.skills,
          experience_history: seekerForm.experience_history,
          references_list: seekerForm.references_list,
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

  // Save Employer Profile
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

  // Reference Add / Remove
  const handleAddReference = () => {
    setSeekerForm({
      ...seekerForm,
      references_list: [
        ...seekerForm.references_list,
        { name: "", company: "", phone: "", note: "" },
      ],
    });
  };

  const handleRemoveReference = (index: number) => {
    setSeekerForm({
      ...seekerForm,
      references_list: seekerForm.references_list.filter((_, i) => i !== index),
    });
  };

  // Mock / Local Document Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSeekerForm({
        ...seekerForm,
        document_name: file.name,
        document_url: URL.createObjectURL(file),
      });
    }
  };

  return (
    <PortalLayout title={isEmployer ? "Firma Profilim" : "İş Arayan Profilim ve Özgeçmiş"}>
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
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEmployer ? employerForm.company_name : seekerForm.full_name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isEmployer ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {isEmployer ? "İşveren / İK Hesabı" : "İş Arayan Hesabı"}
                </span>

                {!isEmployer && seekerForm.is_disabled && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 flex items-center gap-1">
                    ♿ Engelli Aday
                  </span>
                )}
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
                    placeholder="Örn: Özdemir İnşaat & Taahhüt"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Faaliyet Sektörü</label>
                  <input
                    type="text"
                    value={employerForm.company_sector}
                    onChange={(e) => setEmployerForm({ ...employerForm, company_sector: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Örn: İnşaat, Temizlik, Lojistik, Restoran"
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
                    placeholder="Esenyurt, İstanbul"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Firma Tanıtımı & Açıklama</label>
                <textarea
                  rows={3}
                  value={employerForm.bio}
                  onChange={(e) => setEmployerForm({ ...employerForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                  placeholder="Firmanızın projeleri, çalışma şartları ve aradığı iş gücü hakkında bilgi verin..."
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
            /* JOB SEEKER PROFILE FORM (İŞÇİ / MAVİ YAKA) */
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
                    placeholder="Adınız ve Soyadınız"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Mesleğiniz / Yaptığınız İş *</label>
                  <input
                    type="text"
                    required
                    value={seekerForm.title}
                    onChange={(e) => setSeekerForm({ ...seekerForm, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Örn: Kalıp Ustası, Temizlik Elemanı, Kaynakçı, Şoför"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">İletişim Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={seekerForm.phone}
                    onChange={(e) => setSeekerForm({ ...seekerForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="0555 000 00 00"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Bulunduğunuz Şehir / İlçe *</label>
                  <input
                    type="text"
                    required
                    value={seekerForm.location}
                    onChange={(e) => setSeekerForm({ ...seekerForm, location: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Örn: İstanbul (Esenyurt), Ankara (Ostim)"
                  />
                </div>
              </div>

              {/* Disability Status (Engelli Aday Alanı) */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_disabled"
                    checked={seekerForm.is_disabled}
                    onChange={(e) => setSeekerForm({ ...seekerForm, is_disabled: e.target.checked })}
                    className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                  />
                  <label htmlFor="is_disabled" className="font-bold text-purple-950 text-xs cursor-pointer flex items-center gap-1.5">
                    <HeartIcon className="h-4 w-4 text-purple-600" />
                    Engelli Durumum Var (Engelli istihdamı kapsamında değerlendirilmek istiyorum)
                  </label>
                </div>

                {seekerForm.is_disabled && (
                  <div className="pt-2 pl-7 space-y-2">
                    <label className="block font-bold text-purple-900 text-[11px]">
                      Engel Türü ve Durumu *
                    </label>
                    <input
                      type="text"
                      required={seekerForm.is_disabled}
                      value={seekerForm.disability_type}
                      onChange={(e) => setSeekerForm({ ...seekerForm, disability_type: e.target.value })}
                      placeholder="Örn: Ortopedik (%40), İşitme engeli, Süreğen / Kronik vb."
                      className="w-full rounded-xl border border-purple-200 p-2.5 text-xs bg-white focus:border-purple-600"
                    />
                    <p className="text-[11px] text-purple-700">
                      * Bu bilgi başvurularınızda işverenlere özel rozet ile iletilecek ve engelli kadrolarında öncelik sağlayacaktır.
                    </p>
                  </div>
                )}
              </div>

              {/* Bio / Summary */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Kendinizden ve İş Tecrübenizden Kısaca Bahsedin</label>
                <textarea
                  rows={3}
                  value={seekerForm.bio}
                  onChange={(e) => setSeekerForm({ ...seekerForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                  placeholder="Yaptığınız işler, bildiğiniz aletler veya çalışma prensipleriniz hakkında kısa bilgi..."
                />
              </div>

              {/* Skills Tag Management (Mavi Yaka / İşçi Yetenekleri) */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-gray-700 uppercase">
                    Yaptığınız İşler, Belgeler ve Yetenekler *
                  </label>
                  <span className="text-[11px] text-gray-400">En az 1 yetenek ekleyin</span>
                </div>
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
                    placeholder="Örn: Kalıp Bağlama, Gazaltı Kaynağı, Forklift, Boya & Badana, Sıhhi Tesisat"
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
                        className="text-indigo-400 hover:text-indigo-700 text-sm font-bold"
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
                    Geçmiş Çalışma Yerleri ve Deneyimler *
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
                  <div key={i} className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 relative shadow-xs">
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
                        placeholder="Yaptığınız İş (Örn: Kalıpçı Ustası)"
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
                        placeholder="Firma / Şantiye / İş Yeri Adı"
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
                        placeholder="Çalışılan Yıllar (Örn: 2020 - 2023)"
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
                      placeholder="Yaptığınız işin detayları ve sorumluluklarınız..."
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

              {/* References Section (Referanslar) */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-gray-700 uppercase flex items-center gap-1.5">
                      <UserGroupIcon className="h-4 w-4 text-indigo-600" />
                      Referanslar (Geçmişte Birlikte Çalıştığınız Kişiler)
                    </label>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Sizi işverene tavsiye edebilecek usta, şef veya eski işvereninizin iletişim bilgileri.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReference}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-xs"
                  >
                    <PlusIcon className="h-4 w-4" /> Referans Ekle
                  </button>
                </div>

                {seekerForm.references_list.map((ref, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 relative shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(i)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                      title="Sil"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                      <input
                        type="text"
                        placeholder="Referans Adı Soyadı (Örn: Hasan Usta)"
                        value={ref.name}
                        onChange={(e) => {
                          const updated = [...seekerForm.references_list];
                          updated[i].name = e.target.value;
                          setSeekerForm({ ...seekerForm, references_list: updated });
                        }}
                        className="rounded-lg border border-gray-300 p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Firma / Şantiye Adı"
                        value={ref.company}
                        onChange={(e) => {
                          const updated = [...seekerForm.references_list];
                          updated[i].company = e.target.value;
                          setSeekerForm({ ...seekerForm, references_list: updated });
                        }}
                        className="rounded-lg border border-gray-300 p-2 text-xs"
                      />
                      <input
                        type="tel"
                        placeholder="Telefon Numarası"
                        value={ref.phone}
                        onChange={(e) => {
                          const updated = [...seekerForm.references_list];
                          updated[i].phone = e.target.value;
                          setSeekerForm({ ...seekerForm, references_list: updated });
                        }}
                        className="rounded-lg border border-gray-300 p-2 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Document / CV Dropzone Area (Belge Yükleme Alanı - Opsiyonel) */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="block font-bold text-gray-700 uppercase">
                  CV / Ustalık Belgesi / Sertifika Yükleme (İsteğe Bağlı)
                </label>
                <p className="text-[11px] text-gray-400">
                  Varsa ustalık belgesi, SRC, forklift ehliyeti veya CV dosyanızı yükleyebilirsiniz (Zorunlu değildir).
                </p>

                {seekerForm.document_name ? (
                  <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-gray-800 text-xs">{seekerForm.document_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSeekerForm({ ...seekerForm, document_name: "", document_url: "" })}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white transition">
                    <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-700">Belge Yüklemek İçin Tıklayın veya Sürükleyin</span>
                    <span className="text-[10px] text-gray-400 mt-1">PDF, DOCX, JPG veya PNG formatları desteklenir</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Profilimi ve Bilgilerimi Kaydet"}
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
