import { getSupplies } from "@/app/actions/supply";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function SuppliesPage() {
  const supplies = await getSupplies();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kirimlar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kirim qilingan partiyalarni, kurslarni va mahsulot tannarxini boshqarish.
          </p>
        </div>
        <Link 
          href="/admin/supplies/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Yangi kirim qo&apos;shish
        </Link>
      </div>

      <div className="space-y-6">
        {supplies.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Hozircha kirimlar yo&apos;q</h3>
            <p className="text-slate-500">Shakldan foydalanib birinchi kirim partiyasini qo&apos;shing.</p>
          </div>
        ) : (
          supplies.map((supply) => (
            <div key={supply.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {supply.supplierName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {supply.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Sana: {new Date(supply.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-6 sm:text-right">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider font-semibold">Valyuta kursi</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{Number(supply.exchangeRateCnyToUsd)} CNY/USD</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider font-semibold">Jami qoplar</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{supply.totalSacks}</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                      <th className="px-6 py-4 font-medium text-slate-500 uppercase tracking-wider text-xs">SKU</th>
                      <th className="px-6 py-4 font-medium text-slate-500 text-right uppercase tracking-wider text-xs">Qoplar</th>
                      <th className="px-6 py-4 font-medium text-slate-500 text-right uppercase tracking-wider text-xs">Juftlar</th>
                      <th className="px-6 py-4 font-medium text-slate-500 text-right uppercase tracking-wider text-xs">Zavod (CNY)</th>
                      <th className="px-6 py-4 font-medium text-slate-500 text-right uppercase tracking-wider text-xs">Kargo (USD)</th>
                      <th className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 text-right uppercase tracking-wider text-xs">Tannarx/Juft (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {supply.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.product.sku}</td>
                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{item.sacksQuantity}</td>
                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{item.pairsQuantity}</td>
                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">¥{Number(item.factoryPriceCny).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">${Number(item.cargoCostPerPairUsd).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          ${Number(item.calculatedCostPriceUsd).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
