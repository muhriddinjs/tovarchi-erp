import { createCustomer } from "@/app/actions/sales";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function createCustomerAction(formData: FormData) {
  "use server";
  await createCustomer(formData);
  redirect("/admin/customers");
}

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/admin/customers" 
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Yangi Mijoz Qo&apos;shish
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Yangi mijoz ismini va telefon raqamini kiriting.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6">
          <form action={createCustomerAction} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Ism / Firma nomi
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                placeholder="Masalan: Ali yoki Factory MChJ"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Telefon (Ixtiyoriy)
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                placeholder="+998 90 123 45 67"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4 mt-6">
              <Link
                href="/admin/customers"
                className="px-6 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors inline-flex items-center justify-center"
              >
                Bekor qilish
              </Link>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors shadow-sm"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
