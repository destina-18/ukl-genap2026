"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
  Utensils,
} from "lucide-react";

type LoginMode = "ADMIN" | "USER";

export default function SignInPage() {
  const [loginMode, setLoginMode] = useState<LoginMode>("USER");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Email atau password salah");
        return;
      }

      const token =
        data?.token ||
        data?.accessToken ||
        data?.access_token ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken ||
        data?.data?.access_token ||
        data?.data?.jwt;

      const user =
        data?.user ||
        data?.data?.user ||
        data?.account ||
        data?.data?.account ||
        null;

      const role =
        data?.role ||
        data?.data?.role ||
        data?.user?.role ||
        data?.data?.user?.role ||
        data?.account?.role ||
        data?.data?.account?.role;

      if (!token) {
        alert("Token tidak ditemukan dari backend. Cek Console LOGIN RESPONSE.");
        return;
      }

      if (!role) {
        alert("Role tidak ditemukan dari backend. Cek Console LOGIN RESPONSE.");
        return;
      }

      const finalRole = String(role).toUpperCase();

      if (loginMode === "ADMIN" && finalRole !== "ADMIN") {
        alert("Akun ini bukan akun admin. Silakan login lewat Customer / Vendor.");
        return;
      }

      if (
        loginMode === "USER" &&
        finalRole !== "CUSTOMER" &&
        finalRole !== "VENDOR"
      ) {
        alert("Akun admin harus login lewat menu Admin.");
        return;
      }

      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "accesstoken=; path=/; max-age=0";
      document.cookie = "role=; path=/; max-age=0";

      document.cookie = `accessToken=${token}; path=/`;
      document.cookie = `accesstoken=${token}; path=/`;
      document.cookie = `role=${finalRole}; path=/`;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", finalRole);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (finalRole === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (finalRole === "VENDOR") {
        window.location.href = "/vendor/dashboard";
      } else if (finalRole === "CUSTOMER") {
        window.location.href = "/customers/dashboard";
      } else {
        alert(`Role tidak dikenali: ${finalRole}`);
      }
    } catch (error) {
      console.error("SIGN IN ERROR:", error);
      alert("Gagal terhubung ke backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7f7] px-6 py-8 text-gray-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[80px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#450a0a]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.5rem] border border-[#7f1d1d]/10 bg-white shadow-2xl shadow-red-900/10 lg:grid-cols-2">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-[-120px] left-[-120px] h-80 w-80 rounded-full bg-black/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[#7f1d1d] shadow-xl shadow-black/10">
                  K
                </div>

                <div>
                  <h1 className="text-2xl font-black">KantinKlik</h1>
                  <p className="text-sm font-medium text-red-100">
                    Kantin sekolah digital
                  </p>
                </div>
              </div>

              <div className="mt-16">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                  <Utensils className="h-4 w-4" />
                  Sistem Kantin Modern
                </div>

                <h2 className="max-w-md text-5xl font-black leading-tight tracking-tight">
                  Masuk sesuai peran akunmu.
                </h2>

                <p className="mt-5 max-w-md text-base leading-8 text-red-100">
                  Admin mengelola sistem, vendor mengatur menu, dan customer
                  memesan makanan lewat satu website yang rapi.
                </p>
              </div>
            </div>

            <div className="relative grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/15 p-3">
                    <ShieldCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="font-black">Admin Panel</p>
                    <p className="mt-1 text-sm leading-6 text-red-100">
                      Mengelola customer, vendor, kategori, dan dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/15 p-3">
                    <Store className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="font-black">Customer / Vendor</p>
                    <p className="mt-1 text-sm leading-6 text-red-100">
                      Untuk membeli makanan atau mengelola menu kantin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#7f1d1d] transition hover:text-[#450a0a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>

            <div className="mt-8">
              <div className="inline-flex rounded-full bg-[#fff0f0] p-1">
                <button
                  type="button"
                  onClick={() => setLoginMode("USER")}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${
                    loginMode === "USER"
                      ? "bg-gradient-to-r from-[#991b1b] to-[#450a0a] text-white shadow-lg shadow-red-900/20"
                      : "text-gray-600 hover:text-[#7f1d1d]"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Customer / Vendor
                </button>

                <button
                  type="button"
                  onClick={() => setLoginMode("ADMIN")}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${
                    loginMode === "ADMIN"
                      ? "bg-gradient-to-r from-[#991b1b] to-[#450a0a] text-white shadow-lg shadow-red-900/20"
                      : "text-gray-600 hover:text-[#7f1d1d]"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </button>
              </div>

              <h2 className="mt-8 text-4xl font-black tracking-tight text-gray-950">
                {loginMode === "ADMIN"
                  ? "Login Admin"
                  : "Login Customer / Vendor"}
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                {loginMode === "ADMIN"
                  ? "Gunakan akun admin untuk masuk ke dashboard pengelolaan sistem KantinKlik."
                  : "Gunakan akun customer atau vendor untuk masuk ke panel masing-masing."}
              </p>
            </div>

            <form onSubmit={handleSignIn} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-black text-gray-700"
                >
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition focus-within:border-[#7f1d1d] focus-within:ring-4 focus-within:ring-[#7f1d1d]/10">
                  <Mail className="h-5 w-5 text-gray-400" />

                  <input
                    id="email"
                    type="email"
                    placeholder={
                      loginMode === "ADMIN"
                        ? "email admin"
                        : "email customer atau vendor"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-black text-gray-700"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition focus-within:border-[#7f1d1d] focus-within:ring-4 focus-within:ring-[#7f1d1d]/10">
                  <Lock className="h-5 w-5 text-gray-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 transition hover:text-[#7f1d1d]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {loginMode === "USER" && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-black text-[#7f1d1d] hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Memproses..."
                  : loginMode === "ADMIN"
                  ? "Masuk sebagai Admin"
                  : "Masuk sebagai Customer / Vendor"}
              </button>
            </form>

            {loginMode === "USER" && (
              <p className="mt-8 text-center text-sm text-gray-500">
                Belum punya akun customer?{" "}
                <Link
                  href="/sign-up"
                  className="font-black text-[#7f1d1d] hover:underline"
                >
                  Daftar di sini
                </Link>
              </p>
            )}

            {loginMode === "ADMIN" && (
              <div className="mt-8 rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5 text-sm leading-6 text-gray-600">
                Mode ini khusus akun <b>ADMIN</b>. Akun customer dan vendor
                tidak bisa masuk lewat mode ini.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}