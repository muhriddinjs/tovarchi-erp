import { createClient } from "@/utils/supabase/server";

/**
 * Server action ichida autentifikatsiya qilingan foydalanuvchini oladi.
 * Agar foydalanuvchi login qilmagan bo'lsa, xatolik tashlaydi.
 */
export async function getAuthUser(): Promise<{ id: string; email: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Avtorizatsiyadan o'tilmagan");
  }

  return { id: user.id, email: user.email ?? "" };
}
