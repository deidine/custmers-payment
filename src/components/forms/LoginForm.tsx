"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function FormLogin() {
  const { setUser } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query parameters, fallback to '/products' if not exists
  const redirectUrl = searchParams.get("redirectTo") || "/products";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const userResponse = await fetch("/api/auth/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          router.push(redirectUrl);
        } else {
          throw new Error("Failed to fetch user");
        }
      } else {
        const { error } = await response.json();
        setError(error);
      }
    } catch (error) {
      setError("Đã có lỗi xảy ra khi đăng nhập!");
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
      {error && <div className="text-red-500 text-center text-md">{error}</div>}
      <form method="POST" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Tài khoản / Email
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Mật khẩu
          </label>

          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
            />
          </div>
        </div>

        <div className="text-sm text-right">
          <a
            href="#"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Quên mật khẩu?
          </a>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Đăng nhập
          </button>
        </div>
      </form>

      <div className="mt-10 text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <a
          href={"/register"}
          className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
        >
          Đăng ký
        </a>
      </div>
    </div>
  );
}
