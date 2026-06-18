"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";

type OrderItemInput = {
  productId: string;
  sacksQuantity: number;
  sellPricePerPairUsd: string;
};

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createOfflineOrder(data: {
  customerId: string;
  items: OrderItemInput[];
}): Promise<ActionResult<{ orderId: string }>> {
  const { customerId, items } = data;

  if (!customerId || items.length === 0) {
    return { success: false, error: "Mijozni tanlang va kamida bitta tovar qo'shing." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      let totalAmountUsd = new Decimal(0);
      let totalProfitUsd = new Decimal(0);

      const orderItemsData = [];

      for (const item of items) {
        // Fetch product to know pairsPerSack
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return { success: false as const, error: `Tovar topilmadi (ID: ${item.productId}).` };
        }

        const requestedSacks = item.sacksQuantity;
        const requestedPairs = requestedSacks * product.pairsPerSack;
        const sellPricePerPair = new Decimal(item.sellPricePerPairUsd);
        const itemTotalSellPrice = sellPricePerPair.times(requestedPairs);

        totalAmountUsd = totalAmountUsd.plus(itemTotalSellPrice);

        // FIFO Deduction Logic
        let remainingSacksToDeduct = requestedSacks;
        let itemTotalCostPrice = new Decimal(0);

        // Find available supply items for this product, ordered by oldest first
        const availableSupplyItems = await tx.supplyItem.findMany({
          where: {
            productId: item.productId,
            remainingSacks: { gt: 0 },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        for (const supplyItem of availableSupplyItems) {
          if (remainingSacksToDeduct <= 0) break;

          const deductAmount = Math.min(supplyItem.remainingSacks, remainingSacksToDeduct);
          const pairsDeducted = deductAmount * product.pairsPerSack;

          // Wrap Prisma Decimal with decimal.js to ensure .times() works
          const costPrice = new Decimal(supplyItem.calculatedCostPriceUsd.toString());
          const costForThesePairs = costPrice.times(pairsDeducted);

          itemTotalCostPrice = itemTotalCostPrice.plus(costForThesePairs);
          remainingSacksToDeduct -= deductAmount;

          // Update the SupplyItem's remaining sacks
          await tx.supplyItem.update({
            where: { id: supplyItem.id },
            data: {
              remainingSacks: supplyItem.remainingSacks - deductAmount,
            },
          });
        }

        if (remainingSacksToDeduct > 0) {
          return {
            success: false as const,
            error: `"${product.sku}" uchun yetarli zaxira yo'q. Kamomad: ${remainingSacksToDeduct} qop.`,
          };
        }

        const itemProfit = itemTotalSellPrice.minus(itemTotalCostPrice);
        totalProfitUsd = totalProfitUsd.plus(itemProfit);

        orderItemsData.push({
          productId: item.productId,
          sacksQuantity: requestedSacks,
          pairsQuantity: requestedPairs,
          sellPricePerPairUsd: sellPricePerPair,
          totalCostPriceUsd: itemTotalCostPrice,
          totalSellPriceUsd: itemTotalSellPrice,
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          customerId,
          source: "OFFLINE",
          status: "COMPLETED",
          totalAmountUsd,
          totalProfitUsd,
          items: {
            create: orderItemsData,
          },
        },
      });

      // Create Transaction
      await tx.transaction.create({
        data: {
          customerId,
          type: "SALE_DEBT",
          amountUsd: totalAmountUsd.negated(),
          description: `Savdo qarz (Order #${order.id.slice(0, 8)})`,
        },
      });

      // Update Customer Balance (subtracting debt)
      await tx.customer.update({
        where: { id: customerId },
        data: {
          balanceUsd: {
            decrement: totalAmountUsd,
          },
        },
      });

      revalidatePath("/admin/sales");
      revalidatePath("/admin/customers");
      revalidatePath("/admin");

      return { success: true as const, data: { orderId: order.id } };
    });
  } catch (error: unknown) {
    console.error("Error creating offline order:", error);
    const message = error instanceof Error ? error.message : "Savdo yaratishda xatolik yuz berdi.";
    return { success: false, error: message };
  }
}

export async function createPayment(data: {
  customerId: string;
  amountUsd: string;
  description?: string;
}): Promise<ActionResult> {
  const { customerId, amountUsd, description } = data;

  if (!customerId || !amountUsd) {
    return { success: false, error: "Mijoz va summa kiritilishi shart." };
  }

  const amount = new Decimal(amountUsd);

  if (amount.lte(0)) {
    return { success: false, error: "Summa musbat son bo'lishi kerak." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create payment transaction
      await tx.transaction.create({
        data: {
          customerId,
          type: "PAYMENT",
          amountUsd: amount,
          description: description || `To'lov qabul qilindi`,
        },
      });

      // Update customer balance (adding payment)
      await tx.customer.update({
        where: { id: customerId },
        data: {
          balanceUsd: {
            increment: amount,
          },
        },
      });
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin");
    return { success: true, data: null };
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    return { success: false, error: "To'lovni saqlashda xatolik yuz berdi." };
  }
}

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) || null;

  if (!name) {
    return { success: false, error: "Ism kiritilishi shart." };
  }

  try {
    await prisma.customer.create({
      data: { name, phone },
    });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Mijoz yaratishda xatolik yuz berdi." };
  }
}

export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerTransactions(customerId: string) {
  return await prisma.transaction.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Dashboard Statistics ───────────────────────────

export async function getDashboardStats() {
  const [
    totalProducts,
    totalSupplies,
    totalCustomers,
    totalOrders,
    profitAgg,
    revenueAgg,
    debtAgg,
    remainingStockAgg,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.supply.count(),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalProfitUsd: true } }),
    prisma.order.aggregate({ _sum: { totalAmountUsd: true } }),
    prisma.customer.aggregate({ _sum: { balanceUsd: true } }),
    prisma.supplyItem.aggregate({ _sum: { remainingSacks: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    }),
  ]);

  return {
    totalProducts,
    totalSupplies,
    totalCustomers,
    totalOrders,
    totalProfit: Number(profitAgg._sum.totalProfitUsd ?? 0),
    totalRevenue: Number(revenueAgg._sum.totalAmountUsd ?? 0),
    totalDebt: Number(debtAgg._sum.balanceUsd ?? 0),
    remainingSacks: remainingStockAgg._sum.remainingSacks ?? 0,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      totalAmountUsd: Number(order.totalAmountUsd),
      totalProfitUsd: Number(order.totalProfitUsd),
      customer: { name: order.customer.name },
      items: order.items.map((item) => ({
        product: { sku: item.product.sku },
      })),
    })),
  };
}
