import { Fragment, useMemo, useState } from "react";
import {
  BookmarkIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  XMarkIcon,
  CheckCircleIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import Divider from "@/components/core-ui/Divider";
import PortalLayout from "@/components/layouts/portal/PortalLayout";

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

const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior UX/UI Designer",
    company: "Google",
    location: "Mountain View, California",
    workplace: "Hybrid",
    type: "Full-time",
    experience: "5+ years",
    tags: ["Hybrid", "Full-time", "5+ years", "Figma", "Design Systems"],
    salary: "$140k - $180k/yr",
    salaryMin: 140000,
    salaryMax: 180000,
    time: "5min ago",
    applications: "140+ Applications",
    logoBg: "bg-blue-600",
    description:
      "Google UX ekibine katılarak milyarlarca kullanıcının günlük olarak etkileşime girdiği yeni nesil web ve mobil arayüzleri tasarlayacak kıdemli bir Ürün Tasarımcısı arıyoruz.",
    responsibilities: [
      "Kullanıcı odaklı wireframe, prototip ve yüksek kaliteli UI tasarımları oluşturmak.",
      "Tasarım sistemini ölçeklemek ve frontend mühendisleri ile yakın iş birliği içinde çalışmak.",
      "Kullanılabilirlik testleri ve kullanıcı araştırmaları yürütmek.",
    ],
    requirements: [
      "Figma, design systems ve prototipleme araçlarında en az 5 yıl deneyim.",
      "Modern web ve mobil platform standartlarına (iOS/Android) hakimiyet.",
      "Güçlü bir tasarım portfolyosu.",
    ],
    benefits: [
      "Kapsamlı sağlık ve hayat sigortası",
      "Yıllık eğitim ve kişisel gelişim bütçesi",
      "Esnek çalışma modeli ve hisse opsiyonları",
    ],
  },
  {
    id: 2,
    title: "Full Stack Engineer (React & Node)",
    company: "Meta",
    location: "Menlo Park, California",
    workplace: "Remote",
    type: "Full-time",
    experience: "3-5 years",
    tags: ["Remote", "Full-time", "3-5 years", "React", "Node.js", "TypeScript"],
    salary: "$150k - $190k/yr",
    salaryMin: 150000,
    salaryMax: 190000,
    time: "12min ago",
    applications: "85+ Applications",
    logoBg: "bg-indigo-600",
    description:
      "Meta ürün ekibinde yüksek performanslı, ölçeklenebilir sosyal medya ve iletişim araçlarının mimarisini geliştirecek yetenekli bir Full Stack Mühendisi aranıyor.",
    responsibilities: [
      "React, TypeScript ve Node.js mimarisinde ölçeklenebilir servisler geliştirmek.",
      "RESTful ve GraphQL API entegrasyonlarını optimize etmek.",
      "Mikroservis mimarisinde güvenilir ve hızlı çözümler üretmek.",
    ],
    requirements: [
      "Modern React eko-sisteminde ve Node.js backend geliştirilmesinde 4+ yıl deneyim.",
      "NoSQL (MongoDB) ve SQL veritabanı optimizasyonu bilgisi.",
      "CI/CD ve bulut altyapısı (AWS/GCP) tecrübesi.",
    ],
    benefits: [
      "Tamamen uzaktan çalışma (Remote)",
      "Yüksek prim ve performans bonusları",
      "Ev ofis kurulum desteği",
    ],
  },
  {
    id: 3,
    title: "Senior Product Manager",
    company: "Amazon",
    location: "Seattle, Washington",
    workplace: "On-site",
    type: "Full-time",
    experience: "5+ years",
    tags: ["On-site", "Full-time", "5+ years", "Agile", "Roadmap", "E-commerce"],
    salary: "$160k - $210k/yr",
    salaryMin: 160000,
    salaryMax: 210000,
    time: "25min ago",
    applications: "210+ Applications",
    logoBg: "bg-amber-600",
    description:
      "Amazon Prime ekibinde ürün vizyonunu belirleyecek, veri odaklı kararlarla müşteri deneyimini bir üst seviyeye taşıyacak Kıdemli Ürün Yöneticisi arıyoruz.",
    responsibilities: [
      "Ürün yol haritasını (roadmap) hazırlamak ve sprint önceliklerini yönetmek.",
      "Kullanıcı geri bildirimlerini ve analitik verileri analiz ederek aksiyon planları oluşturmak.",
      "Tasarım, mühendislik ve pazarlama ekipleri arasında köprü vazifesi görmek.",
    ],
    requirements: [
      "Büyük ölçekli dijital ürünlerde en az 5 yıl ürün yönetimi deneyimi.",
      "Veri analitiği araçlarına (SQL, Tableau vb.) hakimiyet.",
      "Mükemmel analitik düşünme ve iletişim becerisi.",
    ],
    benefits: [
      "Kapsamlı sağlık paketi",
      "Amazon hisse senedi planı",
      "Kariyer rotasyonu ve liderlik programları",
    ],
  },
  {
    id: 4,
    title: "Data Scientist & AI Specialist",
    company: "Microsoft",
    location: "Redmond, Washington",
    workplace: "Hybrid",
    type: "Full-time",
    experience: "3-5 years",
    tags: ["Hybrid", "Full-time", "3-5 years", "Python", "PyTorch", "LLMs"],
    salary: "$145k - $185k/yr",
    salaryMin: 145000,
    salaryMax: 185000,
    time: "45min ago",
    applications: "92+ Applications",
    logoBg: "bg-emerald-600",
    description:
      "Microsoft Azure AI ekibinde en yeni derin öğrenme modelleri ve LLM çözümleri geliştirecek, yapay zeka projelerine yön verecek bir Veri Bilimci arıyoruz.",
    responsibilities: [
      "Büyük dil modelleri (LLM) ve üretken yapay zeka algoritmaları geliştirmek.",
      "Veri boru hatlarını (data pipelines) tasarlamak ve model performansını izlemek.",
      "İş birimlerine yönelik analitik öngörüler ve raporlar sunmak.",
    ],
    requirements: [
      "Python, Pandas, PyTorch ve Scikit-learn ile 3+ yıl pratik tecrübe.",
      "Makine öğrenimi ve derin öğrenme teorilerine güçlü hakimiyet.",
      "Yüksek lisans veya ilgili mühendislik derecesi.",
    ],
    benefits: [
      "Yıllık teknoloji ve cihaz fonu",
      "Esnek çalışma saatleri",
      "Özel spor salonu ve sağlık üyelikleri",
    ],
  },
  {
    id: 5,
    title: "iOS Mobile Developer (Swift)",
    company: "Apple",
    location: "Cupertino, California",
    workplace: "On-site",
    type: "Full-time",
    experience: "3-5 years",
    tags: ["On-site", "Full-time", "3-5 years", "Swift", "SwiftUI", "iOS SDK"],
    salary: "$155k - $195k/yr",
    salaryMin: 155000,
    salaryMax: 195000,
    time: "1 hour ago",
    applications: "115+ Applications",
    logoBg: "bg-gray-800",
    description:
      "Milyonlarca Apple kullanıcısına akıcı ve kusursuz mobil deneyim sunacak, SwiftUI ve modern iOS mimarilerine hakim Mobil Yazılım Geliştirici arıyoruz.",
    responsibilities: [
      "Swift ve SwiftUI ile yüksek performanslı iOS uygulamaları geliştirmek.",
      "Apple Human Interface Guidelines prensiplerini mükemmel uygulamak.",
      "Bellek optimizasyonu, offline-first mimari ve animasyonları kusursuzlaştırmak.",
    ],
    requirements: [
      "App Store'da yayınlanmış en az 2 aktif uygulama.",
      "Swift, Combine ve CoreData/SwiftData konularında derin bilgi.",
      "Birim testleri ve UI test otomasyonları deneyimi.",
    ],
    benefits: [
      "Apple ürün indirimleri",
      "Cupertino kampüs olanakları ve gurme yemekler",
      "Cömert ebeveynlik ve dinlenme izinleri",
    ],
  },
  {
    id: 6,
    title: "DevOps & Cloud Architect",
    company: "Netflix",
    location: "Los Gatos, California",
    workplace: "Remote",
    type: "Full-time",
    experience: "5+ years",
    tags: ["Remote", "Full-time", "5+ years", "Kubernetes", "AWS", "Terraform"],
    salary: "$175k - $225k/yr",
    salaryMin: 175000,
    salaryMax: 225000,
    time: "2 hours ago",
    applications: "64+ Applications",
    logoBg: "bg-red-600",
    description:
      "Kesintisiz küresel video akış altyapımızı yönetecek, mikroservis orkestrasyonunu ve bulut güvenliğini en üst standartta tutacak Kıdemli DevOps Mimarı arıyoruz.",
    responsibilities: [
      "Kubernetes küme yönetimini ve CI/CD süreçlerini otomatize etmek.",
      "Terraform ile Infrastructure as Code (IaC) altyapısını kurmak.",
      "Sistem izleme (Grafana, Prometheus) ve olağanüstü durum kurtarma planlarını yürütmek.",
    ],
    requirements: [
      "AWS veya GCP üzerinde büyük ölçekli altyapı yönetiminde 5+ yıl deneyim.",
      "Docker, Kubernetes, Helm ve GitHub Actions uzmanlığı.",
      "Sıfır kesinti (Zero-downtime) dağıtım stratejilerine hakimiyet.",
    ],
    benefits: [
      "Sınırsız ücretli izin politikası",
      "En üst düzey donanım ve ekipman desteği",
      "Tam esnek çalışma saatleri",
    ],
  },
  {
    id: 7,
    title: "Frontend Developer (React / Tailwind)",
    company: "Spotify",
    location: "Stockholm / Remote",
    workplace: "Remote",
    type: "Part-time",
    experience: "1-3 years",
    tags: ["Remote", "Part-time", "1-3 years", "React", "TailwindCSS", "Vite"],
    salary: "$65k - $85k/yr",
    salaryMin: 65000,
    salaryMax: 85000,
    time: "3 hours ago",
    applications: "310+ Applications",
    logoBg: "bg-green-600",
    description:
      "Müzik ve podcast arayüzlerimizi geliştirecek, modern web teknolojileri ve bileşen tabanlı mimariye meraklı dinamik bir Frontend Geliştirici arıyoruz.",
    responsibilities: [
      "React ve TailwindCSS ile modern, duyarlı (responsive) sayfalar oluşturmak.",
      "Web performansını ve erişilebilirlik (a11y) standartlarını artırmak.",
      "Müzik çalar etkileşimlerini ve mikro animasyonları kodlamak.",
    ],
    requirements: [
      "Modern JavaScript / TypeScript ve React temellerine hakimiyet.",
      "Responsive web tasarımı ve CSS/TailwindCSS tecrübesi.",
      "Temiz, modüler ve sürdürülebilir kod yazma disiplini.",
    ],
    benefits: [
      "Ücretsiz Spotify Premium ve etkinlik biletleri",
      "Mentorluk ve hızlandırılmış kariyer gelişim programı",
      "Yarı zamanlı (Part-time) esnek çalışma",
    ],
  },
  {
    id: 8,
    title: "Cybersecurity Analyst",
    company: "Stripe",
    location: "San Francisco, California",
    workplace: "Hybrid",
    type: "Full-time",
    experience: "3-5 years",
    tags: ["Hybrid", "Full-time", "3-5 years", "SOC", "Penetration Testing", "Security"],
    salary: "$135k - $170k/yr",
    salaryMin: 135000,
    salaryMax: 170000,
    time: "5 hours ago",
    applications: "47+ Applications",
    logoBg: "bg-purple-600",
    description:
      "Finansal ödeme ağlarımızın güvenliğini sağlamak, siber tehditleri proaktif olarak tespit edip önlemek üzere Güvenlik Analisti takım arkadaşı arıyoruz.",
    responsibilities: [
      "Güvenlik açıklarını tespit etmek için sızma testleri ve kod denetimleri yapmak.",
      "SIEM ve SOC altyapısını izleyerek şüpheli hareketleri raporlamak.",
      "Güvenlik protokollerini ve şifreleme mekanizmalarını denetlemek.",
    ],
    requirements: [
      "Siber güvenlik alanında 3+ yıl deneyim ve CEH / CISSP / OSCP sertifikaları.",
      "Ağ protokolleri, web güvenliği ve bulut zafiyetleri konusunda uzmanlık.",
      "Hızlı kriz yönetimi ve analitik problem çözme kabiliyeti.",
    ],
    benefits: [
      "Sektör lideri yan haklar ve özel sağlık sigortası",
      "Sürekli sertifikasyon ve konferans katılım fonu",
      "Yemek ve ulaşım yardımı",
    ],
  },
];

const HomePage = () => {
  const [selectedJob, setSelectedJob] = useState<Job>(INITIAL_JOBS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("most-recent");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  // Mobile / Modal states
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [applyModalJob, setApplyModalJob] = useState<Job | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleSaveJob = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (savedJobIds.includes(id)) {
      setSavedJobIds((prev) => prev.filter((item) => item !== id));
      showToast("İlan kaydedilenlerden kaldırıldı.");
    } else {
      setSavedJobIds((prev) => [...prev, id]);
      showToast("İlan başarıyla kaydedildi!");
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
    if (appliedJobIds.includes(job.id)) {
      showToast("Bu ilana zaten başvurdunuz.");
      return;
    }
    setApplyModalJob(job);
  };

  const handleConfirmApply = () => {
    if (applyModalJob) {
      setAppliedJobIds((prev) => [...prev, applyModalJob.id]);
      const jobName = applyModalJob.title;
      setApplyModalJob(null);
      showToast(`🎉 "${jobName}" ilanına başvurunuz başarıyla iletildi!`);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    // On small screens, open the app-like bottom sheet / detail drawer
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
    return INITIAL_JOBS.filter((job) => {
      // Search query match
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

      // Workplace / Location filter
      if (selectedLocations.length > 0) {
        if (!selectedLocations.includes(job.workplace)) {
          return false;
        }
      }

      // Job Type filter
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(job.type)) {
          return false;
        }
      }

      // Experience filter
      if (selectedExperiences.length > 0) {
        if (!selectedExperiences.includes(job.experience)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === "a-z") {
        return a.title.localeCompare(b.title);
      }
      if (selectedSort === "top-salary") {
        return b.salaryMax - a.salaryMax;
      }
      if (selectedSort === "trending") {
        return parseInt(b.applications) - parseInt(a.applications);
      }
      return a.id - b.id; // most-recent default
    });
  }, [
    searchQuery,
    selectedLocations,
    selectedTypes,
    selectedExperiences,
    selectedSort,
  ]);

  // If selected job was filtered out, select first available
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
          <div className="flex items-center justify-between">
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
                placeholder="Pozisyon, şirket veya yetenek ara (örn: React, Designer)..."
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

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="xl:hidden flex items-center gap-2 h-12 px-4 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition shrink-0"
            >
              <FunnelIcon className="h-5 w-5 text-indigo-600" />
              <span className="hidden sm:inline">Filtrele</span>
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
            <div className="text-gray-600 font-medium">
              <span className="text-gray-900 font-bold">
                {filteredJobs.length}
              </span>{" "}
              ilan listeleniyor
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
        {filteredJobs.length === 0 && (
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
                    <CurrencyDollarIcon className="h-4 w-4" />
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

      {/* MOBILE / TABLET APP-LIKE DETAIL BOTTOM SHEET (DRAWER) */}
      <Transition.Root show={isMobileDetailOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 xl:hidden"
          onClose={setIsMobileDetailOpen}
        >
          {/* Backdrop */}
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
                {/* Mobile Drawer Grabber / Header */}
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

                {/* Mobile Scrollable Content */}
                <div className="overflow-y-auto p-5 space-y-5 flex-1 text-sm">
                  {/* Job Header */}
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

                  {/* Badges */}
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

                  {/* Key Info Cards */}
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

                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Pozisyon Tanımı
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
                      {activeJob.description}
                    </p>
                  </div>

                  {/* Responsibilities */}
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

                  {/* Requirements */}
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

                  {/* Benefits */}
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

                {/* Sticky Action Footer (App style) */}
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
                  {/* Sort */}
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

                  {/* Location */}
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

                  {/* Job Type */}
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

                  {/* Experience */}
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
                  pozisyonuna mevcut profiliniz ve özgeçmişiniz ile başvurulacaktır.
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
    </PortalLayout>
  );
};

export default HomePage;
