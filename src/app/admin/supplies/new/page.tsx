import { getProducts } from "@/app/actions/product";
import NewSupplyForm from "@/components/NewSupplyForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewSupplyPage() {
  const products = await getProducts();

  // Serialize products for client component (strip Date objects)
  const serializedProducts = products.map((p) => ({
    id: p.id,
    sku: p.sku,
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link 
          href="/admin/supplies"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kirimlar ro&apos;yxatiga qaytish
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Yangi kirim partiyasi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Yangi partiyani bazaga kiritish. Sana, yetkazib beruvchi, va qoplar sonini aniq kiriting.
        </p>
      </div>

      <NewSupplyForm products={serializedProducts} />
    </div>
  );
}
