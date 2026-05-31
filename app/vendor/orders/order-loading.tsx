export default function OrderLoading() {
  return (
    <section className="flex min-h-[300px] items-center justify-center rounded-[1.5rem] bg-white shadow-lg shadow-red-900/5">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#7f1d1d]/20 border-t-[#7f1d1d]" />

        <p className="text-sm font-bold text-[#7f1d1d]">Memuat order...</p>
      </div>
    </section>
  );
}