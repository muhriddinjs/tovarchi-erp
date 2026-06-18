import { getCustomers } from "@/app/actions/sales";
import { getProducts } from "@/app/actions/product";
import POSForm from "@/components/POSForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewSalePage() {
  const [customers, products] = await Promise.all([
    getCustomers(),
    getProducts(),
  ]);

  // Serialize for client component — strip Decimal and Date objects
  const serializedCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const serializedProducts = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    pairsPerSack: p.pairsPerSack,
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link 
          href="/admin/sales"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Orqaga qaytish
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Yangi Savdo Qilish
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Mijozni tanlang, tovarlarni qo&apos;shing va narxlarni kiriting. Tizim avtomatik tarzda eng eski partiyalardan (FIFO) qoplarni yechadi.
        </p>
      </div>

      <POSForm customers={serializedCustomers} products={serializedProducts} />
    </div>
  );
}
