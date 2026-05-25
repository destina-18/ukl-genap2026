import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff7f7] text-gray-900">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-xl font-bold text-white">
            K
          </div>

          <div>
            <h1 className="text-xl font-bold text-red-700">KantinKlik</h1>
            <p className="text-xs text-gray-500">Kantin sekolah digital</p>
          </div>
        </div>

        <Link
          href="/sign-in"
          className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Sign In
        </Link>
      </nav>

      {/* HERO */}
      <section className="flex min-h-[82vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700">
          Website Pemesanan Makanan Kantin
        </div>

        <h2 className="max-w-4xl text-5xl font-extrabold leading-tight text-gray-900 md:text-7xl">
          Pesan makanan kantin jadi lebih mudah.
        </h2>

         <p className="mt-5 text-lg leading-8 text-gray-600">
            KantinKlik hadir untuk membuat proses pemesanan makanan di sekolah menjadi
            lebih cepat, rapi, dan praktis.
          </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/sign-in"
            className="rounded-full bg-red-600 px-10 py-3 font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
          >
            Mulai Sekarang
          </Link>

          <a
            href="#tentang"
            className="rounded-full border border-red-600 bg-white px-10 py-3 font-semibold text-red-700 transition hover:bg-red-50"
          >
            Tentang KantinKlik
          </a>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="bg-white px-6 py-20 md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
            Tentang
          </p>

          <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
            Satu website untuk kantin sekolah
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            KantinKlik hadir untuk membuat proses pemesanan makanan di sekolah menjadi
            lebih cepat, rapi, dan praktis.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-red-100 bg-white px-6 py-7 text-center">
        <p className="font-bold text-red-700">KantinKlik</p>
        <p className="mt-1 text-sm text-gray-500">
          Website pemesanan makanan sekolah.
        </p>
      </footer>
    </main>
  );
}