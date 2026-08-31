import { Fragment, useEffect, useMemo, useState } from "react";
import {
  BookmarkIcon,
  BriefcaseIcon,
    MagnifyingGlassIcon,
  ShareIcon,
  XMarkIcon,
  CheckCircleIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  CheckIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import Divider from "@/components/core-ui/Divider";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { useAuth } from "@/providers";
import { Link } from "react-router-dom";
import { UserIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/core/supabase";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  workplace: "Remote" | "On-site" | "Hybrid";
  type: "Full-time" | "Part-time" | "Contract";
  experience: "1-3 years" | "3-5 years" | "5+ years";
  tags: string[];
  salary: string;
  salaryMin: number;
  salaryMax: number;
  time: string;
  applications: string;
  logoBg: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

const FALLBACK_JOBS: Job[] = [
  {
    id: 1,
    title: "Temizlik Görevlisi / Ofis & Tesis",
    company: "Akdeniz Kurumsal Temizlik",
    location: "İstanbul (Kadıköy)",
    workplace: "On-site",
    type: "Full-time",
    experience: "1-3 years",
    tags: ["Tam Zamanlı", "Kadıköy", "Yol + Yemek", "SGK"],
    salary: "28.000 TL - 34.000 TL/ay",
    salaryMin: 28000,
    salaryMax: 34000,
    time: "10dk önce",
    applications: "18 Başvuru",
    logoBg: "bg-emerald-600",
    description:
      "Kadıköy ve Ataşehir bölgesindeki iş merkezi ve ofislerimizin günlük temizlik, düzen ve hijyen standartlarını sağlayacak titiz temizlik personeli arıyoruz.",
    responsibilities: [
      "Ofis alanları, toplantı odaları ve ortak kullanım alanlarının günlük temizliği.",
      "Çöp kovalarının boşaltılması ve çöp torbalarının yenilenmesi.",
      "Hijyen malzemelerinin (sabun, havlu vb.) takibi ve eksiklerin tamamlanması.",
    ],
    requirements: [
      "Benzer pozisyonda veya temizlik sektöründe en az 6 ay deneyimli.",
      "Kişisel hijyenine ve temizliğe özen gösteren.",
      "Vardiyalı veya düzenli mesai saatlerine uyum sağlayabilecek.",
    ],
    benefits: [
      "Tam SGK + Asgari Ücret Üzeri Maaş",
      "Günlük Yemek Kartı (Ticket)",
      "Yol / Servis Desteği",
    ],
  },
  {
    id: 2,
    title: "İnşaat Ustası (Kalıp & Demir Ustası)",
    company: "Özdemir Yapı & İnşaat",
    location: "İstanbul (Esenyurt)",
    workplace: "On-site",
    type: "Full-time",
    experience: "3-5 years",
    tags: ["Tam Zamanlı", "Şantiye", "Yatakhane", "Maaş + Prim"],
    salary: "45.000 TL - 65.000 TL/ay",
    salaryMin: 45000,
    salaryMax: 65000,
    time: "25dk önce",
    applications: "24 Başvuru",
    logoBg: "bg-amber-600",
    description:
      "Esenyurt ve Beylikdüzü şantiyelerimizde kaba yapı, kalıp, demir ve beton döküm işlerinde çalışacak deneyimli inşaat ustaları ve kalfalar aranmaktadır.",
    responsibilities: [
      "Şantiye projesine uygun kalıp ve demir bağlama işlemlerinin yapılması.",
      "İskele kurulumu ve emniyet kemeri ile güvenli çalışma kurallarına uyulması.",
      "Kaba inşaat işlerinin zamanında ve eksiksiz teslim edilmesi.",
    ],
    requirements: [
      "Kalıp, demir veya duvar ustalığında en az 3 yıl saha deneyimi.",
      "İş sağlığı ve güvenliği kurallarına eksiksiz uyan.",
      "Ekip çalışmasına yatkın ve şantiye ortamına alışkın.",
    ],
    benefits: [
      "Yatakhane ve 3 Öğün Sıcak Yemek",
      "Dolgun Günlük Yevmiye / Aylık Maaş Garantisi",
      "Özel Şantiye Sağlık Sigortası",
    ],
  },
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<"apply" | "save">("apply");
  const [jobs, setJobs] = useState<Job[]>(FALLBACK_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job>(FALLBACK_JOBS[0]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("most-recent");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  // Modals & Drawers
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [applyModalJob, setApplyModalJob] = useState<Job | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form for New Job Post
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    company: "",
    location: "İstanbul / Remote",
    workplace: "Remote" as "Remote" | "On-site" | "Hybrid",
    type: "Full-time" as "Full-time" | "Part-time" | "Contract",
    experience: "3-5 years" as "1-3 years" | "3-5 years" | "5+ years",
    salary: "$90k - $120k/yr",
    description: "",
    tags: "React, TypeScript, Remote",
  });
  const [isPosting, setIsPosting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Fetch live jobs from Supabase
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted: Job[] = data.map((item) => ({
          id: Number(item.id),
          title: item.title,
          company: item.company,
          location: item.location,
          workplace: item.workplace || "Remote",
          type: item.type || "Full-time",
          experience: item.experience || "3-5 years",
          tags: item.tags || [],
          salary: item.salary,
          salaryMin: Number(item.salary_min) || 0,
          salaryMax: Number(item.salary_max) || 0,
          time: item.time || "Yeni",
          applications: item.applications || "0 Başvuru",
          logoBg: item.logo_bg || "bg-indigo-600",
          description: item.description || "",
          responsibilities: item.responsibilities || [],
          requirements: item.requirements || [],
          benefits: item.benefits || [],
        }));

        setJobs(formatted);
        if (formatted.length > 0) {
          setSelectedJob(formatted[0]);
        }
      }
    } catch (err) {
      console.warn("Supabase load fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 2. Handle Job Save (Supabase & Local)
  const handleToggleSaveJob = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthModalReason("save");
      setIsAuthModalOpen(true);
      return;
    }
    if (savedJobIds.includes(id)) {
      setSavedJobIds((prev) => prev.filter((item) => item !== id));
      await supabase
        .from("saved_jobs")
        .delete()
        .eq("job_id", id)
        ;
      showToast("İlan kaydedilenlerden kaldırıldı.");
    } else {
      setSavedJobIds((prev) => [...prev, id]);
      await supabase
        .from("saved_jobs")
        .insert({
          job_id: id,
          user_identifier: "guest_user",
        })
        ;
      showToast("İlan Supabase veritabanına kaydedildi!");
    }
  };

  const handleShare = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`"${job.title}" bağlantısı panoya kopyalandı!`);
    } else {
      showToast(`İlan paylaşıldı: ${job.title}`);
    }
  };

  const handleApplyClick = (job: Job) => {
    if (!isAuthenticated) {
      setAuthModalReason("apply");
      setIsAuthModalOpen(true);
      return;
    }
    if (appliedJobIds.includes(job.id)) {
      showToast("Bu ilana zaten başvurdunuz.");
      return;
    }
    setApplyModalJob(job);
  };

  // 3. Confirm Application to Supabase
  const handleConfirmApply = async () => {
    if (applyModalJob) {
      setAppliedJobIds((prev) => [...prev, applyModalJob.id]);
      const jobName = applyModalJob.title;
      const targetJobId = applyModalJob.id;
      setApplyModalJob(null);

      // Insert to Supabase applications table
      try {
        await supabase.from("applications").insert({
          job_id: targetJobId,
          user_id: user?.id || "",
          applicant_name: user?.full_name || "İş Arayan",
          applicant_email: user?.email || "",
          applicant_phone: user?.phone || "",
          applicant_title: user?.title || "Yazılım Geliştirici",
          applicant_bio: user?.bio || "",
          applicant_skills: user?.skills || [],
          applicant_experience: user?.experience_history || [],
          applicant_education: user?.education_history || [],
          status: "Beklemede",
        });
      } catch (err) {
        console.warn("Application insert error:", err);
      }

      showToast(`🎉 "${jobName}" ilanına başvurunuz Supabase'e iletildi!`);
    }
  };

  // 4. Create New Job Post into Supabase
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title.trim() || !newJobForm.company.trim()) {
      showToast("Lütfen ilan başlığı ve şirket adını doldurun.");
      return;
    }

    setIsPosting(true);
    const tagsArray = newJobForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const colors = [
      "bg-indigo-600",
      "bg-blue-600",
      "bg-purple-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-rose-600",
    ];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title: newJobForm.title,
          company: newJobForm.company,
          location: newJobForm.location,
          workplace: newJobForm.workplace,
          type: newJobForm.type,
          experience: newJobForm.experience,
          salary: newJobForm.salary,
          salary_min: 90000,
          salary_max: 120000,
          time: "Yeni",
          applications: "0 Başvuru",
          logo_bg: randomBg,
          description:
            newJobForm.description ||
            `${newJobForm.company} bünyesinde ${newJobForm.title} pozisyonunda görevlendirilmek üzere dinamik takım arkadaşı arıyoruz.`,
          tags: tagsArray.length > 0 ? tagsArray : [newJobForm.workplace, newJobForm.type],
          responsibilities: [
            "Proje gereksinimlerine uygun geliştirme yapmak",
            "Ekip ile koordineli çalışmak",
          ],
          requirements: ["İlgili alanda deneyim", "Güçlü iletişim becerileri"],
          benefits: ["Esnek çalışma saatleri", "Özel sağlık sigortası"],
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newJobFormatted: Job = {
          id: Number(data.id),
          title: data.title,
          company: data.company,
          location: data.location,
          workplace: data.workplace as any,
          type: data.type as any,
          experience: data.experience as any,
          tags: data.tags || [],
          salary: data.salary,
          salaryMin: 90000,
          salaryMax: 120000,
          time: "Yeni",
          applications: "0 Başvuru",
          logoBg: randomBg,
          description: data.description,
          responsibilities: data.responsibilities || [],
          requirements: data.requirements || [],
          benefits: data.benefits || [],
        };

        setJobs((prev) => [newJobFormatted, ...prev]);
        setSelectedJob(newJobFormatted);
      }

      setIsPostJobModalOpen(false);
      setNewJobForm({
        title: "",
        company: "",
        location: "İstanbul / Remote",
        workplace: "Remote",
        type: "Full-time",
        experience: "3-5 years",
        salary: "$90k - $120k/yr",
        description: "",
        tags: "React, TypeScript, Remote",
      });
      showToast("🚀 Yeni ilan Supabase veritabanına başarıyla kaydedildi!");
    } catch (err: any) {
      console.error(err);
      showToast("İlan eklenirken bir hata oluştu.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    if (window.innerWidth < 1280) {
      setIsMobileDetailOpen(true);
    }
  };

  const toggleFilter = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedExperiences([]);
    setSelectedLocations([]);
    setSelectedSort("most-recent");
  };

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = job.title.toLowerCase().includes(q);
          const matchesCompany = job.company.toLowerCase().includes(q);
          const matchesLocation = job.location.toLowerCase().includes(q);
          const matchesTags = job.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesTags) {
            return false;
          }
        }

        if (selectedLocations.length > 0) {
          if (!selectedLocations.includes(job.workplace)) {
            return false;
          }
        }

        if (selectedTypes.length > 0) {
          if (!selectedTypes.includes(job.type)) {
            return false;
          }
        }

        if (selectedExperiences.length > 0) {
          if (!selectedExperiences.includes(job.experience)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "a-z") {
          return a.title.localeCompare(b.title);
        }
        if (selectedSort === "top-salary") {
          return b.salaryMax - a.salaryMax;
        }
        if (selectedSort === "trending") {
          return parseInt(b.applications) - parseInt(a.applications);
        }
        return b.id - a.id; // newest first
      });
  }, [
    jobs,
    searchQuery,
    selectedLocations,
    selectedTypes,
    selectedExperiences,
    selectedSort,
  ]);

  const activeJob =
    filteredJobs.find((j) => j.id === selectedJob.id) ||
    filteredJobs[0] ||
    selectedJob;

  return (
    <PortalLayout title="İş İlanları">
      {/* Toast Notification */}
      <Transition
        show={!!toastMessage}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-gray-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur flex items-center gap-3 border border-gray-700">
          <CheckCircleIcon className="h-6 w-6 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </Transition>

      {/* Desktop Filter Aside */}
      <aside className="sticky top-24 hidden w-72 shrink-0 xl:block">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200/80 p-5 space-y-6">
          {/* Post Job Quick Button */}
          {/* Post Job Button removed for job seeker */}

          <div className="flex items-center justify-between pt-2">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-indigo-600" />
              Filtreler
            </h4>
            {(selectedTypes.length > 0 ||
              selectedExperiences.length > 0 ||
              selectedLocations.length > 0 ||
              searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Temizle
              </button>
            )}
          </div>

          <Divider />

          {/* Sort Options */}
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Sıralama
            </h5>
            <div className="space-y-2">
              {[
                { id: "most-recent", name: "En Yeni İlanlar" },
                { id: "top-salary", name: "En Yüksek Maaş" },
                { id: "trending", name: "Popüler & Çok Başvurulan" },
                { id: "a-z", name: "A'dan Z'ye" },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-sm ${
                    selectedSort === item.id
                      ? "bg-indigo-50 text-indigo-900 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>{item.name}</span>
                  <input
                    type="radio"
                    name="desktop-sort"
                    checked={selectedSort === item.id}
                    onChange={() => setSelectedSort(item.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                </label>
              ))}
            </div>
          </div>

          <Divider />

          {/* Work Location */}
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Çalışma Yeri
            </h5>
            <div className="space-y-2">
              {["Remote", "Hybrid", "On-site"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(item)}
                    onChange={() =>
                      toggleFilter(selectedLocations, setSelectedLocations, item)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <Divider />

          {/* Job Type */}
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Çalışma Şekli
            </h5>
            <div className="space-y-2">
              {["Full-time", "Part-time", "Contract"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(item)}
                    onChange={() =>
                      toggleFilter(selectedTypes, setSelectedTypes, item)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <Divider />

          {/* Experience */}
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Deneyim
            </h5>
            <div className="space-y-2">
              {["1-3 years", "3-5 years", "5+ years"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedExperiences.includes(item)}
                    onChange={() =>
                      toggleFilter(
                        selectedExperiences,
                        setSelectedExperiences,
                        item
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Center Main Content: Search Bar & Job Postings */}
      <main className="flex-1 min-w-0 pb-16">
        {/* Mobile Header Bar & Search / Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full h-12 rounded-xl border border-gray-300 pl-10 pr-10 text-gray-900 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 shadow-sm transition bg-white placeholder:text-gray-400"
                placeholder="Meslek, pozisyon veya şehir ara (örn: Temizlik, İnşaat, Garson, Şoför)..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Mobile post job button removed */}

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="xl:hidden flex items-center gap-1.5 h-12 px-3.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition shrink-0"
            >
              <FunnelIcon className="h-5 w-5 text-indigo-600" />
              {(selectedTypes.length > 0 ||
                selectedExperiences.length > 0 ||
                selectedLocations.length > 0) && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                  {selectedTypes.length +
                    selectedExperiences.length +
                    selectedLocations.length}
                </span>
              )}
            </button>
          </div>

          {/* Result Count and Active Filters Tag Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="text-gray-600 font-medium flex items-center gap-2">
              <span className="text-gray-900 font-bold">
                {filteredJobs.length}
              </span>{" "}
              ilan listeleniyor
              {isLoading && (
                <span className="text-xs text-indigo-600 animate-pulse flex items-center gap-1">
                  <SparklesIcon className="h-3.5 w-3.5" /> Supabase'den yükleniyor...
                </span>
              )}
            </div>

            {/* Active Quick Badges */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {selectedLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                >
                  {loc}
                  <XMarkIcon
                    onClick={() =>
                      toggleFilter(selectedLocations, setSelectedLocations, loc)
                    }
                    className="h-3.5 w-3.5 cursor-pointer hover:text-indigo-900"
                  />
                </span>
              ))}
              {selectedTypes.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {t}
                  <XMarkIcon
                    onClick={() =>
                      toggleFilter(selectedTypes, setSelectedTypes, t)
                    }
                    className="h-3.5 w-3.5 cursor-pointer hover:text-blue-900"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && !isLoading && (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-base font-semibold text-gray-900">
              Aramanıza uygun ilan bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Filtreleri veya arama terimini değiştirerek tekrar deneyebilirsiniz.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        )}

        {/* Jobs List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isSelected = activeJob?.id === job.id;
            const isSaved = savedJobIds.includes(job.id);
            const isApplied = appliedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                onClick={() => handleSelectJob(job)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.99] ${
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div>
                  {/* Top Header: Company Avatar & Action Buttons */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0 ${job.logoBg}`}
                      >
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition truncate">
                          {job.title}
                        </h4>
                        <p className="text-sm font-medium text-gray-600 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{job.company}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 text-xs flex items-center gap-0.5">
                            <MapPinIcon className="h-3.5 w-3.5 inline" />
                            {job.location}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Bookmark & Applied Status */}
                    <div className="flex items-center gap-1">
                      {isApplied && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                          <CheckIcon className="h-3.5 w-3.5" /> Başvuruldu
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSaveJob(e, job.id)}
                        className={`p-2 rounded-lg transition ${
                          isSaved
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                        title={isSaved ? "Kaydedildi" : "Kaydet"}
                      >
                        {isSaved ? (
                          <BookmarkSolidIcon className="h-5 w-5" />
                        ) : (
                          <BookmarkIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-lg bg-gray-100/80 px-2.5 py-1 text-xs font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 3 && (
                      <span className="inline-flex items-center rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                        +{job.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Salary & Posted Time Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-sm">
                    <span className="text-xs font-bold font-mono">₺</span>
                    <span>{job.salary}</span>
                  </div>
                  <span className="text-gray-400 flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {job.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Desktop Sticky Right Sidebar (Job Details) */}
      {activeJob && (
        <aside className="sticky top-24 hidden w-96 shrink-0 xl:block">
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-200/90 shadow-sm p-6 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto">
            {/* Header / Actions */}
            <div className="flex items-start justify-between gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm ${activeJob.logoBg}`}
              >
                {activeJob.company.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleShare(e, activeJob)}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition"
                  title="Paylaş"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleToggleSaveJob(e, activeJob.id)}
                  className={`p-2.5 rounded-xl border transition ${
                    savedJobIds.includes(activeJob.id)
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Kaydet"
                >
                  {savedJobIds.includes(activeJob.id) ? (
                    <BookmarkSolidIcon className="h-5 w-5" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {activeJob.title}
              </h2>
              <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1.5">
                <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                <span>{activeJob.company}</span>
                <span className="text-gray-300">•</span>
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <span>{activeJob.location}</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {activeJob.applications}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                  {activeJob.workplace}
                </span>
              </div>
            </div>

            <Divider />

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Çalışma Şekli</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {activeJob.type}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Deneyim</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {activeJob.experience}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Yayınlanma</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {activeJob.time}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Tahmini Maaş</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {activeJob.salary}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                Pozisyon Hakkında
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {activeJob.description}
              </p>
            </div>

            {/* Responsibilities */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                Sorumluluklar
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {activeJob.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                Aranan Nitelikler
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {activeJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                Yan Haklar & Avantajlar
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {activeJob.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Apply Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleApplyClick(activeJob)}
                disabled={appliedJobIds.includes(activeJob.id)}
                className={`w-full rounded-xl py-3.5 px-4 text-sm font-bold shadow-sm transition active:scale-[0.98] ${
                  appliedJobIds.includes(activeJob.id)
                    ? "bg-emerald-600 text-white cursor-default"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 shadow-md"
                }`}
              >
                {appliedJobIds.includes(activeJob.id)
                  ? "✓ Başvurunuz Alındı"
                  : "Hemen Başvur (Apply Now)"}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MOBILE / TABLET DETAIL BOTTOM SHEET (DRAWER) */}
      <Transition.Root show={isMobileDetailOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 xl:hidden"
          onClose={setIsMobileDetailOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 transform"
              enterFrom="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
              enterTo="translate-y-0 sm:scale-100 opacity-100"
              leave="ease-in duration-200 transform"
              leaveFrom="translate-y-0 sm:scale-100 opacity-100"
              leaveTo="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
            >
              <Dialog.Panel className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in">
                <div className="p-4 pb-2 flex flex-col items-center shrink-0 border-b border-gray-100 relative">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-3" />
                  <div className="w-full flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      İlan Detayları
                    </span>
                    <button
                      onClick={() => setIsMobileDetailOpen(false)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100 transition"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto p-5 space-y-5 flex-1 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm ${activeJob.logoBg}`}
                      >
                        {activeJob.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">
                          {activeJob.title}
                        </h2>
                        <p className="text-sm font-medium text-gray-600">
                          {activeJob.company} • {activeJob.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => handleShare(e, activeJob)}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 active:bg-gray-100"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => handleToggleSaveJob(e, activeJob.id)}
                        className={`p-2 rounded-xl border ${
                          savedJobIds.includes(activeJob.id)
                            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {savedJobIds.includes(activeJob.id) ? (
                          <BookmarkSolidIcon className="h-5 w-5" />
                        ) : (
                          <BookmarkIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {activeJob.applications}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {activeJob.workplace}
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {activeJob.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Deneyim</span>
                      <span className="font-semibold text-gray-900">
                        {activeJob.experience}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Yayınlanma</span>
                      <span className="font-semibold text-gray-900">
                        {activeJob.time}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-gray-200/60 flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Maaş Aralığı:</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {activeJob.salary}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Pozisyon Tanımı
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
                      {activeJob.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Sorumluluklar
                    </h3>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {activeJob.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Aranan Nitelikler
                    </h3>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {activeJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Yan Haklar
                    </h3>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {activeJob.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDetailOpen(false);
                      handleApplyClick(activeJob);
                    }}
                    disabled={appliedJobIds.includes(activeJob.id)}
                    className={`flex-1 py-3.5 px-4 rounded-2xl text-sm font-bold shadow-lg transition active:scale-95 ${
                      appliedJobIds.includes(activeJob.id)
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200"
                    }`}
                  >
                    {appliedJobIds.includes(activeJob.id)
                      ? "✓ Başvurunuz Alındı"
                      : "Hemen Başvur"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* MOBILE FILTER MODAL */}
      <Transition.Root show={isMobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 xl:hidden"
          onClose={setIsMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 transform"
              enterFrom="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
              enterTo="translate-y-0 sm:scale-100 opacity-100"
              leave="ease-in duration-200 transform"
              leaveFrom="translate-y-0 sm:scale-100 opacity-100"
              leaveTo="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
            >
              <Dialog.Panel className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FunnelIcon className="h-5 w-5 text-indigo-600" />
                    Filtreleme & Sıralama
                  </h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto p-5 space-y-6 flex-1 text-sm">
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                      Sıralama
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "most-recent", name: "En Yeni" },
                        { id: "top-salary", name: "En Yüksek Maaş" },
                        { id: "trending", name: "Popüler" },
                        { id: "a-z", name: "A-Z" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedSort(item.id)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center ${
                            selectedSort === item.id
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "border-gray-200 text-gray-700 bg-gray-50"
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                      Çalışma Yeri
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {["Remote", "Hybrid", "On-site"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleFilter(
                              selectedLocations,
                              setSelectedLocations,
                              item
                            )
                          }
                          className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition ${
                            selectedLocations.includes(item)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-gray-200 text-gray-700 bg-gray-50"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                      Çalışma Tipi
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {["Full-time", "Part-time", "Contract"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleFilter(
                              selectedTypes,
                              setSelectedTypes,
                              item
                            )
                          }
                          className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition ${
                            selectedTypes.includes(item)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-gray-200 text-gray-700 bg-gray-50"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                      Deneyim Seviyesi
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {["1-3 years", "3-5 years", "5+ years"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleFilter(
                              selectedExperiences,
                              setSelectedExperiences,
                              item
                            )
                          }
                          className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition ${
                            selectedExperiences.includes(item)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-gray-200 text-gray-700 bg-gray-50"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800"
                  >
                    Temizle
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-200"
                  >
                    {filteredJobs.length} İlanı Göster
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* POST NEW JOB MODAL */}
      <Transition.Root show={isPostJobModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsPostJobModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 transform"
              enterFrom="scale-95 opacity-0"
              enterTo="scale-100 opacity-100"
              leave="ease-in duration-200 transform"
              leaveFrom="scale-100 opacity-100"
              leaveTo="scale-95 opacity-0"
            >
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <PlusIcon className="h-5 w-5 text-indigo-600" />
                    Yeni İş İlanı Yayınla
                  </h3>
                  <button
                    onClick={() => setIsPostJobModalOpen(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateJob} className="mt-4 space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Pozisyon / İlan Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Senior Frontend Developer"
                      value={newJobForm.title}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, title: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Şirket Adı *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Oxobee Tech"
                        value={newJobForm.company}
                        onChange={(e) =>
                          setNewJobForm({ ...newJobForm, company: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Lokasyon
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: İstanbul / Remote"
                        value={newJobForm.location}
                        onChange={(e) =>
                          setNewJobForm({ ...newJobForm, location: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Çalışma
                      </label>
                      <select
                        value={newJobForm.workplace}
                        onChange={(e) =>
                          setNewJobForm({
                            ...newJobForm,
                            workplace: e.target.value as any,
                          })
                        }
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Tip
                      </label>
                      <select
                        value={newJobForm.type}
                        onChange={(e) =>
                          setNewJobForm({
                            ...newJobForm,
                            type: e.target.value as any,
                          })
                        }
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Deneyim
                      </label>
                      <select
                        value={newJobForm.experience}
                        onChange={(e) =>
                          setNewJobForm({
                            ...newJobForm,
                            experience: e.target.value as any,
                          })
                        }
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-indigo-600"
                      >
                        <option value="1-3 years">1-3 Yıl</option>
                        <option value="3-5 years">3-5 Yıl</option>
                        <option value="5+ years">5+ Yıl</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Maaş Bilgisi
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 80.000 TL - 120.000 TL"
                      value={newJobForm.salary}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, salary: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Etiketler (Virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, Remote, Tailwind"
                      value={newJobForm.tags}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, tags: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      İş Açıklaması
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Pozisyon hakkında genel bilgiler ve aranan nitelikler..."
                      value={newJobForm.description}
                      onChange={(e) =>
                        setNewJobForm({
                          ...newJobForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPostJobModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isPosting}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
                    >
                      {isPosting ? "Kaydediliyor..." : "İlanı Canlıya Yayınla"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* APPLY CONFIRMATION MODAL */}
      <Transition.Root show={!!applyModalJob} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setApplyModalJob(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 transform"
              enterFrom="scale-95 opacity-0"
              enterTo="scale-100 opacity-100"
              leave="ease-in duration-200 transform"
              leaveFrom="scale-100 opacity-100"
              leaveTo="scale-95 opacity-0"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  <BriefcaseIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  İlana Başvurmak İstiyor Musunuz?
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  <strong className="text-gray-900 font-semibold">
                    {applyModalJob?.company}
                  </strong>{" "}
                  şirketinin{" "}
                  <strong className="text-gray-900 font-semibold">
                    {applyModalJob?.title}
                  </strong>{" "}
                  pozisyonuna başvurunuz Supabase canlı veritabanına iletilecektir.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => setApplyModalJob(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmApply}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95"
                  >
                    Başvuruyu Onayla
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* AUTH REQUIRED MODAL FOR GUESTS */}
      <Transition.Root show={isAuthModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsAuthModalOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <UserIcon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {authModalReason === "apply" ? "Başvuru Yapmak İçin Giriş Yapın" : "İlanı Kaydetmek İçin Giriş Yapın"}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {authModalReason === "apply"
                    ? "İş ilanlarına başvurabilmek ve profilinizi işverenlere iletebilmek için lütfen giriş yapın veya ücretsiz hesap oluşturun."
                    : "İlanları kaydedebilmek ve daha sonra başvurmak üzere listenizde tutabilmek için giriş yapmalısınız."}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition active:scale-95"
                >
                  <ArrowRightEndOnRectangleIcon className="h-4 w-4" />
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center rounded-xl bg-white border border-gray-300 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Ücretsiz Kayıt Ol
                </Link>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>
    </PortalLayout>
  );
};

export default HomePage;
