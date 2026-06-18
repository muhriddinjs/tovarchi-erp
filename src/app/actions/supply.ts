"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";

type SupplyItemInput = {
  productId: string;
  sacksQuantity: number;
  factoryPriceCny: number | string;
  cargoCostPerPairUsd: number | string;
};

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createSupply(data: {
  date: Date;
  supplierName: string;
  exchangeRateCnyToUsd: number | string;
  items: SupplyItemInput[];
}): Promise<ActionResult> {
  const { date, supplierName, exchangeRateCnyToUsd, items } = data;

  if (!supplierName || !exchangeRateCnyToUsd || items.length === 0) {
    return { success: false, error: "Barcha maydonlarni to'ldiring va kamida bitta tovar qo'shing." };
  }

  const exchangeRate = new Decimal(exchangeRateCnyToUsd);

  if (exchangeRate.lte(0)) {
    return { success: false, error: "Valyuta kursi musbat son bo'lishi kerak." };
  }

  try {
    // Fetch ALL referenced products in a single query (fixes N+1)
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return { success: false, error: `Tovar topilmadi (ID: ${item.productId}).` };
      }
    }

    let totalSacks = 0;

    const itemRecords = items.map((item) => {
      const product = productMap.get(item.productId)!;

      totalSacks += item.sacksQuantity;
      const pairsQuantity = item.sacksQuantity * product.pairsPerSack;

      const factoryPriceCny = new Decimal(item.factoryPriceCny);
      const cargoCostPerPairUsd = new Decimal(item.cargoCostPerPairUsd);

      // (factoryPriceCny / exchangeRateCnyToUsd) + cargoCostPerPairUsd
      const calculatedCostPriceUsd = factoryPriceCny
        .dividedBy(exchangeRate)
        .plus(cargoCostPerPairUsd);

      return {
        productId: item.productId,
        sacksQuantity: item.sacksQuantity,
        remainingSacks: item.sacksQuantity,
        pairsQuantity,
        factoryPriceCny,
        cargoCostPerPairUsd,
        calculatedCostPriceUsd,
      };
    });

    const supply = await prisma.supply.create({
      data: {
        date,
        supplierName,
        exchangeRateCnyToUsd: exchangeRate,
        totalSacks,
        items: {
          create: itemRecords,
        },
      },
    });

    revalidatePath("/admin/supplies");
    revalidatePath("/admin");
    return { success: true, data: { id: supply.id } };
  } catch (error: unknown) {
    console.error("Error creating supply:", error);
    return { success: false, error: "Kirim yaratishda xatolik yuz berdi." };
  }
}

export async function getSupplies() {
  return await prisma.supply.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
