import NewProductForm from "@/components/NewProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Yangi Tovar Qo&apos;shish
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Yangi tovar ma&apos;lumotlarini va qadoqlash o&apos;lchamlarini kiriting.
        </p>
      </div>

      <NewProductForm />
    </div>
  );
}
