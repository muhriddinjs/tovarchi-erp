import { getProducts } from "@/app/actions/product";
import DeleteProductButton from "@/components/DeleteProductButton";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tovarlar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Ombordagi tovarlar, SKU, qadoqlash ma&apos;lumotlari va narxlarni boshqarish.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Yangi tovar qo&apos;shish
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Rasm</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Qadoq</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Minimal Narx</th>
                <th className="px-6 py-4 font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-right">Sotish Narxi (30%)</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Yaratilgan sana</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Tovarlar topilmadi. Boshlash uchun birinchi tovarni qo&apos;shing.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.sku}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      <div><span className="font-medium text-slate-900 dark:text-white">{product.pairsPerSack}</span> juft/qop</div>
                      <div className="text-xs text-slate-400">{product.pairsPerPack} juft/pachka</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {product.costPriceUsd > 0 ? `$${product.costPriceUsd.toFixed(2)}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {product.targetPriceUsd > 0 ? `$${product.targetPriceUsd.toFixed(2)}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DeleteProductButton productId={product.id} sku={product.sku} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
