"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { getAuthUser } from "@/lib/auth";

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
  const user = await getAuthUser();
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
        // Fetch product — verify ownership
        const product = await tx.product.findFirst({
          where: { id: item.productId, userId: user.id },
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

        // Find available supply items for this product — filtered by userId
        const availableSupplyItems = await tx.supplyItem.findMany({
          where: {
            productId: item.productId,
            userId: user.id,
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
            where: { id: supplyItem.id, userId: user.id },
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
          userId: user.id,
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
          userId: user.id,
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
          userId: user.id,
          customerId,
          type: "SALE_DEBT",
          amountUsd: totalAmountUsd.negated(),
          description: `Savdo qarz (Order #${order.id.slice(0, 8)})`,
        },
      });

      // Update Customer Balance (subtracting debt) — verify ownership
      await tx.customer.update({
        where: { id: customerId, userId: user.id },
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
  const user = await getAuthUser();
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
          userId: user.id,
          customerId,
          type: "PAYMENT",
          amountUsd: amount,
          description: description || `To'lov qabul qilindi`,
        },
      });

      // Update customer balance (adding payment) — verify ownership
      await tx.customer.update({
        where: { id: customerId, userId: user.id },
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
  const user = await getAuthUser();

  return await prisma.customer.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCustomer(formData: FormData) {
  const user = await getAuthUser();

  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) || null;

  if (!name) {
    return { success: false, error: "Ism kiritilishi shart." };
  }

  try {
    await prisma.customer.create({
      data: { userId: user.id, name, phone },
    });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Mijoz yaratishda xatolik yuz berdi." };
  }
}

export async function getOrders() {
  const user = await getAuthUser();

  return await prisma.order.findMany({
    where: { userId: user.id },
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

export async function getCustomerById(customerId: string) {
  const user = await getAuthUser();

  return await prisma.customer.findFirst({
    where: { id: customerId, userId: user.id },
  });
}

export async function getCustomerTransactions(customerId: string) {
  const user = await getAuthUser();

  // Verify customer belongs to user first
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, userId: user.id },
  });

  if (!customer) {
    return [];
  }

  return await prisma.transaction.findMany({
    where: { customerId, userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Dashboard Statistics ───────────────────────────

export async function getDashboardStats() {
  const user = await getAuthUser();
  const userId = user.id;

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
    prisma.product.count({ where: { userId } }),
    prisma.supply.count({ where: { userId } }),
    prisma.customer.count({ where: { userId } }),
    prisma.order.count({ where: { userId } }),
    prisma.order.aggregate({ where: { userId }, _sum: { totalProfitUsd: true } }),
    prisma.order.aggregate({ where: { userId }, _sum: { totalAmountUsd: true } }),
    prisma.customer.aggregate({ where: { userId }, _sum: { balanceUsd: true } }),
    prisma.supplyItem.aggregate({ where: { userId }, _sum: { remainingSacks: true } }),
    prisma.order.findMany({
      where: { userId },
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
