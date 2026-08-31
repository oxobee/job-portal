import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { MapPinIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const ProfilePage = () => {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Uğur Uğurlu",
    title: "Senior Full Stack Developer",
    email: "ugur@example.com",
    phone: "+90 555 000 00 00",
    location: "İstanbul, Türkiye",
    bio: "Modern web ve mobil teknolojileri, React, Node.js, TypeScript ve bulut mimarileri konusunda 6+ yıllık deneyimli yazılım mühendisi.",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PortalLayout title="Profilim ve Özgeçmiş">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white text-3xl font-black flex items-center justify-center shadow-lg shadow-indigo-200">
              UU
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{formData.fullName}</h2>
              <p className="text-sm font-semibold text-indigo-600">{formData.title}</p>
              <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                {formData.location}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            {saved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-600" />
                Profil bilgileriniz başarıyla güncellendi!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ünvan / Pozisyon</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Telefon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hakkımda / Özet</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ProfilePage;
