import { useState, useEffect } from "react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { supabase } from "@/core/supabase";
import { BookmarkIcon, MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("saved_jobs")
          .select("*, jobs(*)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSavedJobs(data || []);
      } catch (err) {
        console.warn("Saved jobs load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  return (
    <PortalLayout title="Kaydedilen İlanlar">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kaydedilen İlanlar</h1>
            <p className="text-sm text-gray-500 mt-1">
              Daha sonra başvurmak üzere kaydettiğiniz açık pozisyonlar.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            İlan Ara
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
            <BookmarkIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">Kayıtlı ilanınız bulunmuyor</h3>
            <p className="text-sm text-gray-500 mt-1">
              İlanların üzerindeki yer işareti ikonuna tıklayarak beğendiğiniz ilanları buraya kaydedebilirsiniz.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition"
            >
              İlanları İncele
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map((item) => {
              const job = item.jobs;
              if (!job) return null;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                      <p className="text-sm font-medium text-gray-600 mt-0.5">{job.company}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {job.location}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {job.salary}
                    </span>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{job.time}</span>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      İlana Git <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
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

export default SavedJobsPage;
