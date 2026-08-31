import { Fragment, useMemo, useState, useEffect } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  BookmarkIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { useAuth } from "@/providers";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/core-ui/Logo";
import { supabase } from "@/core/supabase";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isSuperAdmin, user, logout } = useAuth();
  const location = useLocation();
  const [siteName, setSiteName] = useState("Job Portal");
  const [customLogoUrl, setCustomLogoUrl] = useState("");

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

  const navigation = useMemo(() => {
    const items = [
      { name: "Ana Sayfa", href: "/", icon: HomeIcon },
    ];

    if (isAuthenticated) {
      items.push(
        { name: "İlanlarım", href: "/my-jobs", icon: BriefcaseIcon },
        { name: "Kaydedilenler", href: "/saved-jobs", icon: BookmarkIcon },
        { name: "Mesajlar", href: "/messages", icon: ChatBubbleLeftRightIcon }
      );
    }

    if (isSuperAdmin) {
      items.push({ name: "Süper Admin", href: "/admin", icon: ShieldCheckIcon });
    }

    return items;
  }, [isAuthenticated, isSuperAdmin]);

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs">
      <nav
        className="mx-auto flex items-center justify-between p-4 px-6 lg:px-8 max-w-7xl"
        aria-label="Global"
      >
        <div className="flex lg:flex-1 items-center gap-3">
          {customLogoUrl ? (
            <Link to="/" className="flex items-center gap-2">
              <img src={customLogoUrl} alt={siteName} className="h-8 max-w-[180px] object-contain" />
            </Link>
          ) : (
            <Logo />
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
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
                  ? "text-indigo-600 bg-indigo-50/70"
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
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {user?.role === "super_admin" ? "Süper Admin" : user?.role === "hr_recruiter" ? "İK Yetkilisi" : "İş Arayan"}
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
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? "bg-indigo-600 text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition`}
                        >
                          <UserIcon className="h-5 w-5 mr-2.5 text-gray-400" />
                          Profilim
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

      {/* MOBILE SIDEBAR DRAWER */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setMobileMenuOpen}
        >
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
                    <span className="sr-only">Menüyü Kapat</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 block mb-2">
                    Menü
                  </span>
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
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.full_name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                      {isSuperAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
                        >
                          <ShieldCheckIcon className="h-5 w-5" />
                          Süper Admin Paneli
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white transition"
                      >
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        Profilim
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
