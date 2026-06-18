"use client";

import { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { createOfflineOrder } from "@/app/actions/sales";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  sku: string;
  pairsPerSack: number;
};

type OrderItemRow = {
  productId: string;
  sacksQuantity: string;
  sellPricePerPairUsd: string;
};

export default function POSForm({
  customers,
  products,
}: {
  customers: Customer[];
  products: Product[];
}) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const addItem = () => {
    setItems([...items, { productId: "", sacksQuantity: "", sellPricePerPairUsd: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItemRow, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0) {
      setError("Iltimos, mijozni tanlang va kamida bitta tovar qo'shing.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await createOfflineOrder({
        customerId,
        items: items.map((i) => ({
          productId: i.productId,
          sacksQuantity: parseInt(i.sacksQuantity, 10),
          sellPricePerPairUsd: i.sellPricePerPairUsd,
        })),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/sales");
    } catch {
      setError("Kutilmagan xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
        <ShoppingCart className="w-5 h-5 text-indigo-500" />
        Yangi Savdo Qilish
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Xaridor (Mijozni tanlang)</label>
        <select
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
        >
          <option value="">Tanlang...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Sotilayotgan tovarlar</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-sm bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            + Tovar qo&apos;shish
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            Hali tovar tanlanmadi. Boshlash uchun &quot;+ Tovar qo&apos;shish&quot; tugmasini bosing.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col lg:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 relative">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tovar SKU</label>
                  <select
                    required
                    value={item.productId}
                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">SKUni tanlang...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} ({p.pairsPerSack} juft/qop)</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Qoplar soni</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.sacksQuantity}
                    onChange={(e) => updateItem(index, "sacksQuantity", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="w-40">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Sotish Narxi (USD/juft)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={item.sellPricePerPairUsd}
                    onChange={(e) => updateItem(index, "sellPricePerPairUsd", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 px-8 rounded-lg transition-colors shadow-sm"
        >
          {loading ? "Sotilmoqda..." : "Savdoni tasdiqlash"}
        </button>
      </div>
    </form>
  );
}
