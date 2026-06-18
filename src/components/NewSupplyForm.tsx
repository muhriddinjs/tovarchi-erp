"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createSupply } from "@/app/actions/supply";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  sku: string;
};

type SupplyItemInput = {
  productId: string;
  sacksQuantity: string;
  factoryPriceCny: string;
  cargoCostPerPairUsd: string;
};

export default function NewSupplyForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [items, setItems] = useState<SupplyItemInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems([
      ...items,
      { productId: "", sacksQuantity: "", factoryPriceCny: "", cargoCostPerPairUsd: "" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SupplyItemInput, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !supplierName || !exchangeRate || items.length === 0) {
      setError("Iltimos, barcha maydonlarni to'ldiring va kamida bitta tovar qo'shing.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await createSupply({
        date: new Date(date),
        supplierName,
        exchangeRateCnyToUsd: exchangeRate,
        items: items.map((i) => ({
          productId: i.productId,
          sacksQuantity: parseInt(i.sacksQuantity, 10),
          factoryPriceCny: i.factoryPriceCny,
          cargoCostPerPairUsd: i.cargoCostPerPairUsd,
        })),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Redirect back on success
      router.push("/admin/supplies");
      router.refresh();
    } catch {
      setError("Kutilmagan xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="p-6">
        <form id="supply-form" onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Sana</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Ta&apos;minotchi nomi</label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Masalan: Zavod A"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Valyuta kursi (CNY → USD)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="Masalan: 7.2"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Kirim tovarlari</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tovar qo&apos;shish
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">Hali tovar qo&apos;shilmadi. Boshlash uchun tugmani bosing.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 items-start">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tovar SKU</label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateItem(index, "productId", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
                      >
                        <option value="">SKUni tanlang...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.sku}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Qoplar soni</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.sacksQuantity}
                        onChange={(e) => updateItem(index, "sacksQuantity", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Zavod (CNY)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={item.factoryPriceCny}
                        onChange={(e) => updateItem(index, "factoryPriceCny", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kargo (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.cargoCostPerPairUsd}
                          onChange={(e) => updateItem(index, "cargoCostPerPairUsd", e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 mb-[1px] text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors border border-transparent"
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
        </form>
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-4 rounded-b-2xl">
        <button
          type="button"
          onClick={() => router.push("/admin/supplies")}
          className="px-6 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          form="supply-form"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-8 rounded-lg transition-colors shadow-sm"
        >
          {loading ? "Saqlanmoqda..." : "Kirimni saqlash"}
        </button>
      </div>
    </div>
  );
}
