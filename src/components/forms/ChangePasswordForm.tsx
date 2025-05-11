"use client";
import { useState } from "react";
import Link from "next/link";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [error, setError] = useState("");

  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });
      if (response.ok) {
        setIsSubmitSuccess(true);
      } else {
        const { error } = await response.json();
        setError(error);
      }
    } catch (error) {
      console.error(error);
      setError("Đã có lỗi xảy ra!");
    }
  };

  const isValidPasswordLength = (password: string) => {
    return password.length >= 5;
  };

  const isPasswordDifferent = () => {
    return oldPassword !== newPassword;
  };

  const isPasswordMatch = () => {
    return newPassword === retypePassword;
  };

  const isDisableSubmit = () => {
    return (
      oldPassword === "" ||
      newPassword === "" ||
      retypePassword === "" ||
      !isValidPasswordLength(newPassword) ||
      !isPasswordDifferent() ||
      !isPasswordMatch()
    );
  };

  return (
    <>
      {isSubmitSuccess ? (
        <div className="text-center my-8">
          <h1 className="text-3xl text-green-600 font-bold mb-8">
            Đổi mật khẩu thành công! Vui lòng đăng nhập lại.
          </h1>
          <Link
            href={"/login"}
            className="text-blue-500 bg-white p-2 border border-blue-500 rounded-md hover:bg-blue-500 hover:text-white"
          >
            Đăng nhập
          </Link>
        </div>
      ) : (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="text-red-500 text-center text-md">{error}</div>
          )}
          <form method="POST" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="old-password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Mật khẩu cũ
              </label>
              <div className="mt-2">
                <input
                  id="old-password"
                  name="old-password"
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Mật khẩu mới
              </label>

              <div className="mt-2">
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setIsNewPasswordTouched(true);
                  }}
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
                />
                {!isValidPasswordLength(newPassword) && (
                  <div className="text-red-500 mt-2">
                    Mật khẩu tối thiểu bao gồm 5 ký tự
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="retype-password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Xác nhận mật khẩu
              </label>

              <div className="mt-2">
                <input
                  id="retype-password"
                  name="retype-password"
                  type="password"
                  required
                  value={retypePassword}
                  onChange={(e) => setRetypePassword(e.target.value)}
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
                />
                {isNewPasswordTouched && !isPasswordMatch() && (
                  <div className="text-red-500 mt-2">Mật khẩu không khớp</div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isDisableSubmit()}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
