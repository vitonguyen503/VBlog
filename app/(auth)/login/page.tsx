import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  // Validate next param — relative paths only (prevent open redirect)
  const next = params.next?.startsWith("/") ? params.next : "/write";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Đăng nhập VBlog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Chia sẻ kiến thức của bạn với mọi người
          </p>
        </div>

        {params.error === "auth" && (
          <p className="text-sm text-red-500 text-center rounded-lg bg-red-50 dark:bg-red-950 p-3">
            Đăng nhập thất bại. Vui lòng thử lại.
          </p>
        )}

        <LoginForm next={next} />
      </div>
    </div>
  );
}
