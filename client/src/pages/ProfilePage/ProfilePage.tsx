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
  EyeSlashIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/providers";
import { supabase } from "@/core/supabase";

const ProfilePage = () => {
  const { user, isEmployer, updateCurrentUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
    user_photos: [] as string[],
    skills: [] as string[],
    experience_history: [] as Array<{ role: string; company: string; period: string; description: string }>,
    references_list: [] as Array<{ name: string; company: string; phone: string; note?: string }>,
    education_history: [] as Array<{ school: string; department: string; year: string }>,
  });
  const [newSkillInput, setNewSkillInput] = useState("");

  // Employer Profile Form State
  const [employerForm, setEmployerForm] = useState({
    company_name: "",
    tax_office: "",
    tax_number: "",
    company_legal_type: "Limited Şirket (Ltd. Şti.)",
    authorized_person: "",
    company_sector: "İnşaat & Taahhüt",
    company_size: "10-50 Çalışan",
    phone: "",
    hide_phone: false,
    company_website: "",
    company_address: "",
    company_logo: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      if (isEmployer) {
        setEmployerForm({
          company_name: user.company_name || user.full_name || "",
          tax_office: (user as any).tax_office || "Kadıköy Vergi Dairesi",
          tax_number: (user as any).tax_number || "1234567890",
          company_legal_type: (user as any).company_legal_type || "Limited Şirket (Ltd. Şti.)",
          authorized_person: (user as any).authorized_person || user.full_name || "",
          company_sector: user.company_sector || "İnşaat & Taahhüt",
          company_size: user.company_size || "10-50 Çalışan",
          phone: user.phone || "",
          hide_phone: !!(user as any).hide_phone,
          company_website: user.company_website || "",
          company_address: user.company_address || user.location || "İstanbul, Türkiye",
          company_logo: (user as any).company_logo || (user as any).logo_url || "",
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
          document_name: (user as any).document_name || "",
          document_url: (user as any).document_url || "",
          user_photos: user.user_photos && Array.isArray(user.user_photos) ? user.user_photos : [],
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
          references_list: (user as any).references_list && (user as any).references_list.length > 0
            ? (user as any).references_list
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

  // Handle Photo Upload (Min 1, Max 5)
  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentPhotos = [...seekerForm.user_photos];
    const availableSlots = 5 - currentPhotos.length;

    if (availableSlots <= 0) {
      setPhotoError("En fazla 5 fotoğraf yükleyebilirsiniz.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    let loadedCount = 0;
    const newPhotos: string[] = [];

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newPhotos.push(reader.result as string);
        }
        loadedCount++;
        if (loadedCount === filesToProcess.length) {
          setSeekerForm((prev) => ({
            ...prev,
            user_photos: [...prev.user_photos, ...newPhotos],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoError(null);
    setSeekerForm((prev) => ({
      ...prev,
      user_photos: prev.user_photos.filter((_, i) => i !== index),
    }));
  };

  // Save Job Seeker Profile
  const handleSaveSeeker = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError(null);

    // Validate Photo Requirement (Min 1, Max 5)
    if (!seekerForm.user_photos || seekerForm.user_photos.length === 0) {
      setPhotoError("⚠️ Lütfen profilinizi kaydedebilmek için en az 1 vesikalık/profil fotoğrafı yükleyin (En fazla 5 fotoğraf).");
      return;
    }

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
          user_photos: seekerForm.user_photos,
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
          tax_office: employerForm.tax_office,
          tax_number: employerForm.tax_number,
          company_legal_type: employerForm.company_legal_type,
          authorized_person: employerForm.authorized_person,
          company_sector: employerForm.company_sector,
          company_size: employerForm.company_size,
          phone: employerForm.phone,
          hide_phone: employerForm.hide_phone,
          company_website: employerForm.company_website,
          company_address: employerForm.company_address,
          company_logo: employerForm.company_logo,
          logo_url: employerForm.company_logo,
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
        company_logo: employerForm.company_logo,
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

  // File Upload for CV/Document
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

  // Employer Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmployerForm({
          ...employerForm,
          company_logo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <PortalLayout title={isEmployer ? "Firma Profilim ve Yasal Bilgiler" : "İş Arayan Profilim ve Özgeçmiş"}>
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            {isEmployer && employerForm.company_logo ? (
              <img
                src={employerForm.company_logo}
                alt={employerForm.company_name}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-md"
              />
            ) : !isEmployer && seekerForm.user_photos.length > 0 ? (
              <img
                src={seekerForm.user_photos[0]}
                alt={seekerForm.full_name}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-indigo-200">
                {isEmployer
                  ? (employerForm.company_name?.substring(0, 2).toUpperCase() || "FR")
                  : (seekerForm.full_name?.substring(0, 2).toUpperCase() || "AD")}
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEmployer ? employerForm.company_name : seekerForm.full_name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isEmployer ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {isEmployer ? "İş Veren Hesabı" : "İş Arayan Hesabı"}
                </span>

                {!isEmployer && seekerForm.is_disabled && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 flex items-center gap-1">
                    ♿ Engelli Aday
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                {isEmployer ? `${employerForm.company_legal_type} • ${employerForm.company_sector}` : seekerForm.title}
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
              Profil bilgileriniz başarıyla kaydedildi!
            </div>
          )}

          {/* ========================================================================= */}
          {/* EMPLOYER PROFILE FORM */}
          {/* ========================================================================= */}
          {isEmployer ? (
            <form onSubmit={handleSaveEmployer} className="mt-6 space-y-6 text-xs">
              {/* Logo Upload Section */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="block font-bold text-gray-700 uppercase flex items-center gap-1.5">
                  <PhotoIcon className="h-4 w-4 text-indigo-600" />
                  Firma Logosu
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {employerForm.company_logo ? (
                    <img
                      src={employerForm.company_logo}
                      alt="Logo"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                      Logo Yok
                    </div>
                  )}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      placeholder="Logo Resim URL'si (veya aşağıdan yükleyin)"
                      value={employerForm.company_logo}
                      onChange={(e) => setEmployerForm({ ...employerForm, company_logo: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs bg-white focus:border-indigo-600"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer transition text-xs">
                      <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                      Bilgisayardan Logo Seç
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Legal Info Fields */}
              <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-4">
                <h3 className="font-bold text-indigo-950 uppercase tracking-wider text-xs">
                  🏛️ Yasal ve Resmi Şirket Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Firma Ticari Ünvanı *</label>
                    <input
                      type="text"
                      required
                      value={employerForm.company_name}
                      onChange={(e) => setEmployerForm({ ...employerForm, company_name: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="Örn: Özdemir İnşaat Taahhüt San. ve Tic. Ltd. Şti."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Şirket Türü</label>
                    <select
                      value={employerForm.company_legal_type}
                      onChange={(e) => setEmployerForm({ ...employerForm, company_legal_type: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                    >
                      <option value="Limited Şirket (Ltd. Şti.)">Limited Şirket (Ltd. Şti.)</option>
                      <option value="Anonim Şirket (A.Ş.)">Anonim Şirket (A.Ş.)</option>
                      <option value="Şahıs Şirketi">Şahıs Şirketi</option>
                      <option value="Kolektif / Komandit">Kolektif / Komandit</option>
                      <option value="Şahıs / Bireysel İşveren">Şahıs / Bireysel İşveren</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Vergi Dairesi</label>
                    <input
                      type="text"
                      value={employerForm.tax_office}
                      onChange={(e) => setEmployerForm({ ...employerForm, tax_office: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="Örn: Kadıköy Vergi Dairesi"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Vergi Numarası (VKN / TCKN)</label>
                    <input
                      type="text"
                      value={employerForm.tax_number}
                      onChange={(e) => setEmployerForm({ ...employerForm, tax_number: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white font-mono"
                      placeholder="10 Haneli VKN"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Şirket Yetkilisi Adı Soyadı</label>
                    <input
                      type="text"
                      value={employerForm.authorized_person}
                      onChange={(e) => setEmployerForm({ ...employerForm, authorized_person: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="Yetkili Adı Soyadı"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Faaliyet Sektörü</label>
                    <input
                      type="text"
                      value={employerForm.company_sector}
                      onChange={(e) => setEmployerForm({ ...employerForm, company_sector: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 bg-white"
                      placeholder="Örn: İnşaat, Temizlik, Lojistik, Restoran"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Phone Privacy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">İletişim Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={employerForm.phone}
                    onChange={(e) => setEmployerForm({ ...employerForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="0555 000 00 00"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Firma Adresi / Şehir *</label>
                  <input
                    type="text"
                    required
                    value={employerForm.company_address}
                    onChange={(e) => setEmployerForm({ ...employerForm, company_address: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                    placeholder="Esenyurt, İstanbul"
                  />
                </div>
              </div>

              {/* Phone Privacy Checkbox */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hide_phone"
                  checked={employerForm.hide_phone}
                  onChange={(e) => setEmployerForm({ ...employerForm, hide_phone: e.target.checked })}
                  className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-600 cursor-pointer mt-0.5"
                />
                <label htmlFor="hide_phone" className="text-xs font-bold text-amber-900 cursor-pointer flex items-center gap-1.5 flex-wrap">
                  <EyeSlashIcon className="h-4 w-4 text-amber-600" />
                  Telefon Numaramı İlanlarda Gizle
                  <span className="text-[11px] font-normal text-amber-800 block w-full mt-0.5">
                    (İş arayanlar numaranızı <code>0532 *** ** 12</code> olarak yıldızlı görür. Adaylara sadece siz telefonla ulaşabilirsiniz.)
                  </span>
                </label>
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
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Firma ve Yasal Bilgileri Kaydet"}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* JOB SEEKER PROFILE FORM (İŞÇİ / MAVİ YAKA) WITH PHOTO UPLOAD */
            /* ========================================================================= */
            <form onSubmit={handleSaveSeeker} className="mt-6 space-y-6 text-xs">
              {/* Photo Error Banner */}
              {photoError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 font-bold text-xs flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>{photoError}</span>
                </div>
              )}

              {/* MULTIPLE PHOTO UPLOAD DROPZONE (MIN 1, MAX 5) */}
              <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-950 uppercase flex items-center gap-2 text-xs">
                    <PhotoIcon className="h-5 w-5 text-indigo-600" />
                    Profil ve Yüz Fotoğraflarınız <span className="text-red-500">* (En Az 1, En Fazla 5 Fotoğraf)</span>
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700">
                    {seekerForm.user_photos.length} / 5 Fotoğraf Yüklendi
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700">
                  İşverenlerin sizi daha hızlı tanıması ve işe alım sürecini başlatması için <strong>en az 1 adet net vesikalık veya boy fotoğrafı</strong> eklemelisiniz.
                </p>

                {/* Uploaded Photos Grid */}
                {seekerForm.user_photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {seekerForm.user_photos.map((photoUrl, i) => (
                      <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-sm bg-white">
                        <img src={photoUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-95 hover:bg-red-700 transition shadow-md"
                          title="Fotoğrafı Sil"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-1 left-1.5 text-[9px] font-black text-white bg-black/60 px-1.5 py-0.5 rounded">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone Input */}
                {seekerForm.user_photos.length < 5 && (
                  <label className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white transition text-center mt-2 shadow-xs">
                    <ArrowUpTrayIcon className="h-7 w-7 text-indigo-600 mb-1" />
                    <span className="text-xs font-bold text-indigo-950">Fotoğraf Seçin veya Sürükleyip Bırakın</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG veya JPEG formatları desteklenir</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotosUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

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

              {/* Disability Status */}
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

              {/* Skills */}
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

              {/* References Section */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-gray-700 uppercase flex items-center gap-1.5">
                      <UserGroupIcon className="h-4 w-4 text-indigo-600" />
                      Referanslar (Geçmişte Birlikte Çalıştığınız Kişiler)
                    </label>
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

              {/* Document / CV Dropzone Area */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="block font-bold text-gray-700 uppercase">
                  CV / Ustalık Belgesi / Sertifika Yükleme (İsteğe Bağlı)
                </label>

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
                  {isSubmitting ? "Kaydediliyor..." : "Profilimi ve Fotoğraflarımı Kaydet"}
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
