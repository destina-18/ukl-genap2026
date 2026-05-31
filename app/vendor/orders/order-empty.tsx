import { ClipboardList } from "lucide-react";

export default function OrderEmpty() {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-[#7f1d1d]/20 bg-white p-10 text-center shadow-lg shadow-red-900/5">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
        <ClipboardList className="h-10 w-10" />
      </div>

      <h2 className="text-2xl font-black text-gray-950">Belum ada order</h2>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        Pesanan customer yang masuk ke kantinmu akan muncul di sini.
      </p>
    </section>
  );
}