"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { createProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";

export default function NewProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file && fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
          setPreviewUrl(URL.createObjectURL(file));
        }
        break;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/products');
      router.refresh();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden" onPaste={handlePaste}>
      <div className="p-6">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="sku" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              required
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
              placeholder="Masalan: SHOE-123"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Tovar Rasmi
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative overflow-hidden group">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="h-40 w-auto object-contain rounded-md" />
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <span className="relative rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none">
                      Rasm yuklash
                    </span>
                    <p className="pl-1">yoki shu yerga tashlang</p>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG (max 5MB) <br/> yopishib ko&apos;chirish (Ctrl+V) ham mumkin</p>
                </div>
              )}
              <input 
                type="file" 
                name="imageFile"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                title="Rasm tanlang" 
              />
            </div>
            
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
              <span className="px-3 text-xs text-slate-400 uppercase tracking-wide">Yoki url</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
              placeholder="https://.../rasm.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="pairsPerSack" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                1 qopda
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="pairsPerSack"
                  name="pairsPerSack"
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                  placeholder="50"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">juft</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="pairsPerPack" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                1 pachkada
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="pairsPerPack"
                  name="pairsPerPack"
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                  placeholder="5"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">juft</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          form="product-form"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-8 rounded-lg transition-colors shadow-sm"
        >
          {loading ? "Saqlanmoqda..." : "Tovarni saqlash"}
        </button>
      </div>
    </div>
  );
}
