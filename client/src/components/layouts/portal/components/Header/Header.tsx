import { Fragment, useMemo, useState, useEffect } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BellIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  } from "@heroicons/react/24/outline";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { useAuth } from "@/providers";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/core-ui/Logo";
import { supabase } from "@/core/supabase";
import { playNotificationSound } from "@/core/sound";

export interface AppNotification {
  id: string;
  user_id: string;
  employer_name: string;
  job_title: string;
  title: string;
  message: string;
  interview_date?: string;
  interview_address?: string;
  contact_phone?: string;
  is_phone_hidden?: boolean;
  is_read: boolean;
  created_at: string;
}

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const { isAuthenticated, isSuperAdmin, isEmployer, isJobSeeker, user, logout } = useAuth();
  const location = useLocation();
  const [siteName, setSiteName] = useState("Job Portal");
  const [customLogoUrl, setCustomLogoUrl] = useState("");

  // Fetch site info
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const { data } = await supabase.from("site_settings").select("site_name, logo_url").eq("id", 1).single();
        if (data) {
          if (data.site_name) setSiteName(data.site_name);
          if (data.logo_url) setCustomLogoUrl(data.logo_url);
        }
      } catch (e) {}
    };
    fetchSiteInfo();
  }, []);

  // Fetch notifications for current user
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${user.id},user_id.eq.${user.email}`)
        .order("created_at", { ascending: false });

      if (data) {
        // If there is a new unread notification, play sound
        const unreadCount = data.filter((n) => !n.is_read).length;
        if (unreadCount > 0 && notifications.length > 0 && unreadCount > notifications.filter((n) => !n.is_read).length) {
          playNotificationSound();
        }
        setNotifications(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated]);

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {}
  };

  const handleOpenNotification = (notif: AppNotification) => {
    setSelectedNotification(notif);
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
  };

  const navigation = useMemo(() => {
    if (!isAuthenticated) {
      return [{ name: "İş İlanları", href: "/", icon: HomeIcon }];
    }

    if (isEmployer) {
      return [
        { name: "İlanlarım & Başvurular", href: "/employer", icon: BriefcaseIcon },
        { name: "Firma ve Yasal Bilgiler", href: "/profile", icon: BuildingOfficeIcon },
      ];
    }

    if (isJobSeeker) {
      return [
        { name: "İş İlanları", href: "/", icon: HomeIcon },
        { name: "Başvurularım", href: "/my-jobs", icon: BriefcaseIcon },
        { name: "Kaydedilenler", href: "/saved-jobs", icon: BookmarkIcon },
      ];
    }

    // Super admin default
    return [
      { name: "İş İlanları", href: "/", icon: HomeIcon },
      { name: "Süper Admin", href: "/admin", icon: ShieldCheckIcon },
    ];
  }, [isAuthenticated, isEmployer, isJobSeeker]);

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs">
      <nav
        className="mx-auto flex items-center justify-between p-4 px-6 lg:px-8 max-w-7xl"
        aria-label="Global"
      >
        <div className="flex lg:flex-1 items-center gap-3">
          {customLogoUrl ? (
            <Link to={isEmployer ? "/employer" : "/"} className="flex items-center gap-2">
              <img src={customLogoUrl} alt={siteName} className="h-8 max-w-[180px] object-contain" />
            </Link>
          ) : (
            <Link to={isEmployer ? "/employer" : "/"}>
              <Logo />
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={() => {
                playNotificationSound();
                setNotificationsOpen(true);
              }}
              className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
              aria-label="Bildirimler"
            >
              <BellIcon className="h-6 w-6" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          )}

          {isSuperAdmin && (
            <Link
              to="/admin"
              className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <ShieldCheckIcon className="h-4 w-4" /> Admin
            </Link>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-700 hover:bg-gray-100 active:scale-95 transition"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menüyü Aç"
          >
            <span className="sr-only">Menüyü Aç</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold leading-6 flex items-center gap-x-2 py-2 px-3 rounded-lg transition ${
                location.pathname === item.href
                  ? "text-indigo-600 bg-indigo-50/70 font-bold"
                  : item.href === "/admin"
                  ? "text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              }`}
            >
              {item.icon && <item.icon className="h-5 w-5" />}
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop User / Auth Actions */}
        {isAuthenticated ? (
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-4">
            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => {
                playNotificationSound();
                setNotificationsOpen(true);
              }}
              className="relative p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
              title="Bildirimler"
            >
              <BellIcon className="h-6 w-6" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {isEmployer && (
              <Link
                to="/employer"
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:bg-indigo-500 transition active:scale-95"
              >
                <BriefcaseIcon className="h-4 w-4" />
                İşveren Paneli
              </Link>
            )}

            {isSuperAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:from-purple-500 hover:to-indigo-500 transition active:scale-95"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Süper Admin
              </Link>
            )}

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center rounded-full ring-2 ring-indigo-600/20 hover:ring-indigo-600 transition">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user?.full_name?.substring(0, 2).toUpperCase() || "ÜY"}
                  </div>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none p-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {isEmployer ? user?.company_name || user?.full_name : user?.full_name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {user?.role === "super_admin"
                        ? "Süper Admin"
                        : isEmployer
                        ? "İş Veren"
                        : "İş Arayan"}
                    </span>
                  </div>
                  <div className="px-1 py-1">
                    {isSuperAdmin && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={`${
                              active ? "bg-purple-600 text-white" : "text-purple-700 font-bold"
                            } group flex w-full items-center rounded-xl px-3 py-2 text-sm transition`}
                          >
                            <ShieldCheckIcon className="h-5 w-5 mr-2.5" />
                            Admin Paneli
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    {isEmployer && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/employer"
                            className={`${
                              active ? "bg-indigo-600 text-white" : "text-gray-900 font-semibold"
                            } group flex w-full items-center rounded-xl px-3 py-2 text-sm transition`}
                          >
                            <BriefcaseIcon className="h-5 w-5 mr-2.5 text-gray-400" />
                            İlanlarım & Başvurular
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? "bg-indigo-600 text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition`}
                        >
                          <UserIcon className="h-5 w-5 mr-2.5 text-gray-400" />
                          {isEmployer ? "Firma ve Yasal Bilgiler" : "Özgeçmişim"}
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? "bg-red-50 text-red-700" : "text-gray-700"
                          } group flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition`}
                          onClick={logout}
                        >
                          <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-2.5 text-red-500" />
                          Çıkış Yap
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        ) : (
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-3 py-2 transition"
            >
              Giriş Yap
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 shadow-indigo-200 transition active:scale-95"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </nav>

      {/* NOTIFICATIONS MODAL / SLIDE-OVER */}
      <Transition.Root show={notificationsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setNotificationsOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-gray-900">Bildirimleriniz</h3>
                  {unreadNotifications.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[11px]">
                      {unreadNotifications.length} Yeni
                    </span>
                  )}
                </div>
                <button onClick={() => setNotificationsOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    <BellIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    Henüz bir bildiriminiz bulunmuyor.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleOpenNotification(notif)}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        notif.is_read
                          ? "bg-white border-gray-200/80 hover:border-indigo-300"
                          : "bg-indigo-50/60 border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(notif.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">
                        {notif.employer_name} • {notif.job_title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* CATEGORIZED NOTIFICATION DETAIL CARD MODAL */}
      <Transition.Root show={!!selectedNotification} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedNotification(null)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Resmi Bildirim
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {selectedNotification?.title}
                  </h3>
                </div>
                <button onClick={() => setSelectedNotification(null)} className="p-1 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {selectedNotification && (
                <div className="space-y-4 text-xs">
                  {/* Employer Info */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Gönderen Firma & Pozisyon</span>
                    <span className="font-bold text-gray-900 text-sm block">{selectedNotification.employer_name}</span>
                    <span className="text-indigo-600 font-semibold">{selectedNotification.job_title}</span>
                  </div>

                  {/* Message Body */}
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Bildirim Metni</span>
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-gray-800 leading-relaxed font-medium">
                      {selectedNotification.message}
                    </div>
                  </div>

                  {/* Categorized Interview Date and Time */}
                  {selectedNotification.interview_date && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                      <CalendarDaysIcon className="h-6 w-6 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Görüşme Tarih ve Saati</span>
                        <span className="font-bold text-amber-950 text-xs">
                          {new Date(selectedNotification.interview_date).toLocaleString("tr-TR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Interview Address */}
                  {selectedNotification.interview_address && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                      <MapPinIcon className="h-6 w-6 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-800 block">Görüşme / Şantiye Adresi</span>
                        <span className="font-bold text-blue-950 text-xs">{selectedNotification.interview_address}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact Phone (Masked if hidden by employer) */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <PhoneIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">İşveren İletişim</span>
                        <span className="font-bold text-emerald-950 text-xs font-mono">
                          {selectedNotification.is_phone_hidden
                            ? "0532 *** ** 12 (Gizli Numara)"
                            : selectedNotification.contact_phone || "Mevcut Değil"}
                        </span>
                      </div>
                    </div>
                    {!selectedNotification.is_phone_hidden && selectedNotification.contact_phone && (
                      <a
                        href={`tel:${selectedNotification.contact_phone}`}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition"
                      >
                        Ara
                      </a>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedNotification(null)}
                      className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold transition text-xs"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* MOBILE DRAWER */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex justify-start">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  {customLogoUrl ? (
                    <img src={customLogoUrl} alt={siteName} className="h-7 max-w-[150px] object-contain" />
                  ) : (
                    <Logo />
                  )}
                  <button
                    type="button"
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                        location.pathname === item.href
                          ? "bg-indigo-50 text-indigo-600 font-bold"
                          : item.href === "/admin"
                          ? "bg-purple-50 text-purple-700 font-bold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      }`}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/60">
                  {!isAuthenticated ? (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center justify-center rounded-xl bg-white border border-gray-300 px-4 py-3 text-sm font-bold text-gray-800 shadow-xs hover:bg-gray-50 transition"
                      >
                        Giriş Yap
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition"
                      >
                        Kayıt Ol
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="px-3 py-2 mb-2 bg-white rounded-xl border border-gray-200/80">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {isEmployer ? user?.company_name || user?.full_name : user?.full_name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-0.5 text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded">
                          {user?.role === "super_admin" ? "Süper Admin" : isEmployer ? "İş Veren" : "İş Arayan"}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white transition"
                      >
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        {isEmployer ? "Firma ve Yasal Bilgiler" : "Özgeçmişim"}
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left"
                      >
                        <ArrowLeftStartOnRectangleIcon className="h-5 w-5 text-red-500" />
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </header>
  );
};

export default Header;
