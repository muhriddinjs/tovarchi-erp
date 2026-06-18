import { getCustomerTransactions } from "@/app/actions/sales";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { notFound } from "next/navigation";
import PaymentForm from "@/components/PaymentForm";

export default async function CustomerAktSverkaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const customerId = resolvedParams.id;
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });

  if (!customer) {
    notFound();
  }

  const transactions = await getCustomerTransactions(customerId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link 
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mijozlarga qaytish
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {customer.name} - Akt Sverka
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Barcha qarz va to&apos;lovlar tarixi.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Joriy Balans</p>
            <p className={`text-2xl font-bold ${Number(customer.balanceUsd) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              ${Number(customer.balanceUsd).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-1">
          <PaymentForm customerId={customerId} />
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider">Sana</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider">Operatsiya</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider">Izoh</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider text-right">Summa (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      Tranzaksiyalar topilmadi.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const isDebt = Number(t.amountUsd) < 0;
                    const typeLabels: Record<string, string> = {
                      SALE_DEBT: "Savdo (Qarz)",
                      PAYMENT: "To'lov",
                      REFUND: "Qaytarildi",
                      ADJUSTMENT: "Tuzatish",
                    };
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(t.createdAt).toLocaleString("uz-UZ")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isDebt ? (
                              <ArrowUpRight className="w-4 h-4 text-rose-500" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                            )}
                            <span className="font-medium text-slate-900 dark:text-white">
                              {typeLabels[t.type] || t.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {t.description || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${isDebt ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isDebt ? "" : "+"}{Number(t.amountUsd).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
