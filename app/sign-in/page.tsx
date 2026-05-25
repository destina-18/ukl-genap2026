"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        alert(data.message || "Email atau password salah");
        return;
      }

      const token =
        data.token ||
        data.accessToken ||
        data.access_token ||
        data.jwt ||
        data.data?.token ||
        data.data?.accessToken ||
        data.data?.access_token ||
        data.data?.jwt;

      const role =
        data.role ||
        data.data?.role ||
        data.user?.role ||
        data.data?.user?.role ||
        data.account?.role ||
        data.data?.account?.role;

      if (!token) {
        alert("Token tidak ditemukan dari backend. Cek Console LOGIN RESPONSE.");
        return;
      }

      if (!role) {
        alert("Role tidak ditemukan dari backend. Cek Console LOGIN RESPONSE.");
        return;
      }

      document.cookie = `accessToken=${token}; path=/`;
      document.cookie = `role=${role}; path=/`;

      if (role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (role === "VENDOR") {
        window.location.href = "/vendor/dashboard";
      } else if (role === "CUSTOMER") {
        window.location.href = "/customer/dashboard";
      } else {
        alert(`Role tidak dikenali: ${role}`);
      }
    } catch (error) {
      console.error("SIGN IN ERROR:", error);
      alert("Gagal terhubung ke backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7f7] px-6 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 shadow-xl shadow-red-100">
        <Link href="/" className="text-sm font-semibold text-red-600">
          ← Kembali
        </Link>

        <div className="mt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-2xl font-bold text-white shadow-md">
            K
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-gray-900">
            Sign In
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Masuk ke akun KantinKlik kamu
          </p>
        </div>

        <form onSubmit={handleSignIn} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-red-100 bg-[#fff7f7] px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <input
              type="password"
              id="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-red-100 bg-[#fff7f7] px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}