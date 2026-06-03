"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ClipboardList, ShoppingBag, Store, FileText, BarChart2, ShieldCheck, Search, ShoppingCart, Package } from "lucide-react";

/* ─── Reusable scroll-reveal component ─── */
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0px) scale(1)"
          : "translateY(52px) scale(0.96)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Count-up Animation ─── */
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      const start = performance.now();
      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return count;
}

/* ─── Main page ─── */
export default function Home() {
  const [totalMenus, setTotalMenus] = useState<number>(0);
  const [totalVendors, setTotalVendors] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const animatedMenus = useCountUp(totalMenus, 1400, 0);
  const animatedVendors = useCountUp(totalVendors, 1200, 150);
  const animatedCategories = useCountUp(totalCategories, 1000, 300);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchHomeStats() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

        const vendorsRes = await fetch(`${baseUrl}/api/vendors`);
        const categoriesRes = await fetch(`${baseUrl}/api/menu-categories`);

        const vendorsData = await vendorsRes.json();
        const categoriesData = await categoriesRes.json();

        const vendors = Array.isArray(vendorsData)
          ? vendorsData
          : vendorsData.data || vendorsData.vendors || [];

        const categories = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.data || categoriesData.categories || [];

        setTotalVendors(vendors.length);
        setTotalCategories(categories.length);

        const menuCounts = await Promise.all(
          vendors.map(async (vendor: any) => {
            if (typeof vendor.menuCount === "number") return vendor.menuCount;
            if (typeof vendor.totalMenus === "number") return vendor.totalMenus;
            if (typeof vendor._count?.menus === "number") {
              return vendor._count.menus;
            }

            if (!vendor.id) return 0;

            try {
              const menusRes = await fetch(
                `${baseUrl}/api/vendors/${vendor.id}/menus`
              );

              const menusData = await menusRes.json();

              const menus = Array.isArray(menusData)
                ? menusData
                : menusData.data || menusData.menus || [];

              return menus.length;
            } catch {
              return 0;
            }
          })
        );

        const totalMenuCount = menuCounts.reduce(
          (total: number, count: number) => total + count,
          0
        );

        setTotalMenus(totalMenuCount);
      } catch (error) {
        console.error("FETCH HOME STATS ERROR:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchHomeStats();
  }, []);

  const features = [
    { icon: ClipboardList, title: "Lihat menu real-time", desc: "Customer bisa melihat menu dari semua vendor kantin yang tersedia dan selalu up-to-date." },
    { icon: ShoppingBag, title: "Pesan dengan mudah", desc: "Pilih menu, tambah ke keranjang, dan checkout langsung dari website tanpa antri." },
    { icon: FileText, title: "Struk digital otomatis", desc: "Setiap order selesai otomatis bisa download struk PDF sebagai bukti transaksi." },
    { icon: Store, title: "Kelola menu vendor", desc: "Vendor bisa tambah, ubah, dan nonaktifkan menu kapan saja langsung dari dashboard." },
    { icon: BarChart2, title: "Pantau statistik", desc: "Admin dan vendor bisa lihat ringkasan order, pendapatan, dan performa menu." },
    { icon: ShieldCheck, title: "Akses berbasis peran", desc: "Sistem role Customer, Vendor, dan Admin memastikan setiap pengguna hanya akses fitur yang relevan." },
  ];

  return (
    <main className="min-h-screen text-gray-900 relative" style={{ backgroundColor: "#fff7f7" }}>
      {/* Grid background */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: "-50%",
          backgroundImage: `
        linear-gradient(rgba(127,29,29,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(127,29,29,0.08) 1px, transparent 1px)
      `,
          backgroundSize: "96px 96px",
          transform: "rotate(-15deg)",
          zIndex: 0,
          pointerEvents: "none",
          animation: "gridMove 10s linear infinite",
        }}
      />

      <div className="relative z-10">
        <div
          className="fixed top-0 left-0 right-0 h-1 z-[60]"
          style={{ width: `${scrollProgress}%`, background: "linear-gradient(to right, #991b1b, #7f1d1d)" }}
        />
        {/* NAVBAR */}
        <nav
          className={`sticky top-0 z-50 px-6 py-4 transition-all duration-300 md:px-16 ${scrolled
            ? "border-b border-white/20 bg-white/60 shadow-lg shadow-black/5 backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent"
            }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#991b1b] to-[#450a0a] text-xl font-black text-white shadow-lg shadow-red-900/30">
                K
              </div>

              <div>
                <h1 className="text-xl font-black text-[#7f1d1d]">
                  KantinKlik
                </h1>
                <p className="text-xs text-gray-500">Kantin sekolah digital</p>
              </div>
            </div>

            <Link
              href="/sign-in"
              id="navbar-cta"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#450a0a] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-900/25 transition-all duration-200 hover:scale-105 hover:shadow-red-900/40"
            >
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="px-6 py-20 md:px-16 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

            {/* Hero — teks kiri */}
            <FadeIn delay={0} className="text-center lg:text-left">
              <div className="mb-6 inline-flex rounded-full border border-[#7f1d1d]/20 bg-white px-5 py-2 text-sm font-bold text-[#7f1d1d]">
                Website Pemesanan Makanan Kantin
              </div>

              <h2 className="text-5xl font-black leading-tight text-gray-950 md:text-7xl">
                Pesan makanan kantin jadi{" "}
                <span className="bg-gradient-to-r from-[#991b1b] to-[#450a0a] bg-clip-text text-transparent">
                  lebih mudah.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                KantinKlik membantu customer memesan makanan, vendor mengelola
                menu, dan admin mengatur data kantin dalam satu sistem.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#450a0a] px-10 py-4 font-bold text-white shadow-xl shadow-red-900/20 transition hover:scale-105"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <a
                  href="#tentang"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("tentang")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full border border-[#7f1d1d]/30 bg-white px-10 py-4 text-center font-bold text-[#7f1d1d] hover:bg-red-50"
                >
                  Tentang KantinKlik
                </a>
              </div>
            </FadeIn>

            {/* Hero — card kanan */}
            <FadeIn delay={160} className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-[#7f1d1d]/20 blur-2xl" />

              <div className="relative rounded-[2rem] bg-white p-6 shadow-2xl shadow-red-900/10">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-100">Data KantinKlik</p>
                      <h3 className="mt-1 text-2xl font-black">
                        KantinKlik Panel
                      </h3>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-3">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/15 p-4">
                      <p className="text-2xl font-black">
                        {loadingStats ? "..." : animatedMenus}
                      </p>
                      <p className="text-xs text-red-100">Menu</p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4">
                      <p className="text-2xl font-black">
                        {loadingStats ? "..." : animatedVendors}
                      </p>
                      <p className="text-xs text-red-100">Vendor</p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4">
                      <p className="text-2xl font-black">
                        {loadingStats ? "..." : animatedCategories}
                      </p>
                      <p className="text-xs text-red-100">Kategori</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#7f1d1d]/10 p-3 text-[#7f1d1d]">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">Data menu real-time</p>
                      </div>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Aktif
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#7f1d1d]/10 p-3 text-[#7f1d1d]">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">Vendor aktif tersedia</p>
                      </div>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-[#7f1d1d]">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </section>

        {/* FITUR */}
        <section className="px-6 py-20 md:px-16">
          <div className="mx-auto max-w-7xl">

            <FadeIn delay={0}>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#7f1d1d]">
                Fitur
              </p>
              <h2 className="mt-4 text-4xl font-black text-gray-950">
                Semua yang kamu butuhkan,{" "}
                <span className="bg-gradient-to-r from-[#991b1b] to-[#450a0a] bg-clip-text text-transparent">
                  dalam satu tempat.
                </span>
              </h2>
            </FadeIn>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <FadeIn key={title} delay={i * 90}>
                  <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-4 inline-flex rounded-xl bg-red-50 p-3 text-[#991b1b]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CARA KERJA */}
        <section className="px-6 py-20 md:px-16 bg-white">
          <div className="mx-auto max-w-7xl">
            <FadeIn delay={0}>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#7f1d1d]">
                Cara Kerja
              </p>
              <h2 className="mt-4 text-4xl font-black text-gray-950">
                Tiga langkah,{" "}
                <span className="bg-gradient-to-r from-[#991b1b] to-[#450a0a] bg-clip-text text-transparent">
                  selesai.
                </span>
              </h2>
            </FadeIn>

            <FadeIn delay={50}>
              <div className="mt-12 grid gap-6 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    icon: Search,
                    title: "Pilih menu",
                    desc: "Lihat menu dari semua vendor kantin. Filter berdasarkan kategori atau vendor favoritmu.",
                  },
                  {
                    step: "02",
                    icon: ShoppingCart,
                    title: "Tambah & checkout",
                    desc: "Masukkan menu ke keranjang lalu checkout. Tidak perlu antri — order langsung masuk ke vendor.",
                  },
                  {
                    step: "03",
                    icon: Package,
                    title: "Ambil pesanan",
                    desc: "Setelah vendor siapkan pesanan, kamu tinggal ambil di kantin. Struk PDF otomatis tersedia.",
                  },
                ].map(({ step, icon: Icon, title, desc }) => (
                  <div key={step} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-[#fff7f7] p-6">
                    <div className="mb-4 inline-flex rounded-xl bg-white p-3 text-[#991b1b] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#b91c1c]">
                      Langkah {step}
                    </p>
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
                    <span className="absolute -bottom-4 -right-2 text-8xl font-black text-[#7f1d1d]/5 select-none">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* TENTANG */}
        <section id="tentang" className="bg-white px-6 py-20 text-center md:px-16">
          <FadeIn delay={0}>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#7f1d1d]">
              Tentang
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <h2 className="mt-4 text-4xl font-black text-gray-950">
              Satu website untuk kantin sekolah
            </h2>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600">
              KantinKlik hadir untuk menyederhanakan ekosistem kantin sekolah,
              dari pemesanan makanan hingga pengelolaan vendor, semua dalam satu
              platform yang mudah digunakan.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
              {[
                {
                  emoji: "👥",
                  title: "Untuk customer",
                  desc: "Pesan makanan tanpa antri, pantau status order real-time, dan simpan struk digital.",
                },
                {
                  emoji: "🏪",
                  title: "Untuk vendor",
                  desc: "Kelola menu, terima order masuk, dan pantau pendapatan langsung dari dashboard.",
                },
                {
                  emoji: "👤",
                  title: "Untuk admin",
                  desc: "Atur data vendor, kategori menu, dan pantau seluruh aktivitas kantin dalam satu tempat.",
                },
              ].map(({ emoji, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-100 bg-[#fff7f7] p-6 text-left"
                >
                  <div className="mb-3 text-2xl">{emoji}</div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <Link
              href="/sign-in"
              className="mt-12 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#450a0a] px-10 py-4 font-bold text-white shadow-xl shadow-red-900/20 transition hover:scale-105"
            >
              Mulai Sekarang
              <ArrowRight className="h-5 w-5" />
            </Link>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}