"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId, sku }: { productId: string; sku: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`"${sku}" tovarni o'chirishni xohlaysizmi?`)) return;

    try {
      setLoading(true);
      const result = await deleteProduct(productId);

      if (!result.success) {
        alert(result.error);
        return;
      }

      router.refresh();
    } catch {
      alert("O'chirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
      title={`"${sku}" ni o'chirish`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
