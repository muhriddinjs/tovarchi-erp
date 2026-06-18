"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import type { Product, SupplyItem } from "@prisma/client";

type ActionResult<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const user = await getAuthUser();

  const sku = formData.get("sku") as string;
  let imageUrl = (formData.get("imageUrl") as string) || null;
  const imageFile = formData.get("imageFile") as File | null;
  const pairsPerSack = parseInt(formData.get("pairsPerSack") as string, 10);
  const pairsPerPack = parseInt(formData.get("pairsPerPack") as string, 10);

  if (!sku || isNaN(pairsPerSack) || isNaN(pairsPerPack)) {
    return { success: false, error: "Kerakli maydonlar to'ldirilmagan yoki noto'g'ri." };
  }

  if (pairsPerSack <= 0 || pairsPerPack <= 0) {
    return { success: false, error: "Juftliklar soni musbat son bo'lishi kerak." };
  }

  try {
    // Check for duplicate SKU within this user's products
    const existing = await prisma.product.findUnique({
      where: { userId_sku: { userId: user.id, sku } },
    });
    if (existing) {
      return { success: false, error: `"${sku}" SKU allaqachon mavjud.` };
    }

    // Handle File Upload to Supabase Storage
    if (imageFile && imageFile.size > 0) {
      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('products')
        .upload(filename, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError);
        return { success: false, error: "Rasmni yuklashda xatolik yuz berdi. Supabase ombori (bucket) to'g'ri sozlanganini tekshiring." };
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('products')
        .getPublicUrl(filename);

      imageUrl = publicUrlData.publicUrl;
    }

    const product = await prisma.product.create({
      data: {
        userId: user.id,
        sku,
        imageUrl,
        pairsPerSack,
        pairsPerPack,
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return { success: false, error: "Tovar yaratishda xatolik yuz berdi." };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const user = await getAuthUser();

  try {
    // Check if product is used in supply items or order items
    const usedInSupply = await prisma.supplyItem.count({
      where: { productId, userId: user.id },
    });
    const usedInOrder = await prisma.orderItem.count({
      where: { productId, userId: user.id },
    });

    if (usedInSupply > 0 || usedInOrder > 0) {
      return {
        success: false,
        error: "Bu tovar kirimlar yoki savdolarda ishlatilgan — o'chirib bo'lmaydi.",
      };
    }

    await prisma.product.delete({ where: { id: productId, userId: user.id } });
    revalidatePath("/admin/products");
    return { success: true, data: null };
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Tovarni o'chirishda xatolik yuz berdi." };
  }
}

export async function getProducts() {
  const user = await getAuthUser();

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      supplyItems: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  });

  return products.map((product: Product & { supplyItems: SupplyItem[] }) => {
    const latestSupply = product.supplyItems[0];
    const costPriceUsd = latestSupply ? Number(latestSupply.calculatedCostPriceUsd) : 0;
    const targetPriceUsd = costPriceUsd > 0 ? costPriceUsd * 1.30 : 0;

    return {
      id: product.id,
      sku: product.sku,
      imageUrl: product.imageUrl,
      pairsPerSack: product.pairsPerSack,
      pairsPerPack: product.pairsPerPack,
      createdAt: product.createdAt,
      costPriceUsd,
      targetPriceUsd,
    };
  });
}
