import { useState, useEffect } from "react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { supabase } from "@/core/supabase";
import { BriefcaseIcon, MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const MyJobsPage = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyApplications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*, jobs(*)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        console.warn("My jobs load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, []);

  return (
    <PortalLayout title="İlanlarım ve Başvurularım">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Başvurularım & İlanlarım</h1>
            <p className="text-sm text-gray-500 mt-1">
              Başvuru yaptığınız pozisyonların güncel durumlarını buradan takip edebilirsiniz.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            Yeni İlan Ara
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
            <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">Henüz bir ilana başvurmadınız</h3>
            <p className="text-sm text-gray-500 mt-1">
              Ana sayfadaki binlerce açık pozisyon arasından size en uygun olanlara hemen başvurun.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition"
            >
              İlanları Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => {
              const job = app.jobs;
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shrink-0">
                      {job?.company?.substring(0, 2).toUpperCase() || "JP"}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{job?.title || "Pozisyon"}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                        <span>{job?.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {job?.location}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircleIcon className="h-4 w-4" />
                      Başvuru İletildi
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default MyJobsPage;
