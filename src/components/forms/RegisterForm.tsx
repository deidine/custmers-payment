"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState(""); // email = username
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [error, setError] = useState("");

  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          address,
          phoneNumber,
          username: email,
          password,
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

  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email !== "";
  };

  const isPhoneNumberValid = () => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const isPasswordValid = () => {
    return password.length >= 5;
  };

  const isPasswordMatch = () => {
    return password === retypePassword;
  };

  const isDisableSubmit = () => {
    return (
      fullName === "" ||
      address === "" ||
      phoneNumber === "" ||
      email === "" ||
      password === "" ||
      retypePassword === "" ||
      !isEmailValid() ||
      !isPhoneNumberValid() ||
      !isPasswordMatch()
    );
  };

  return (
    <>
      {isSubmitSuccess ? (
        <div className="text-center my-8">
          <h1 className="text-3xl text-green-600 font-bold mb-8">
            Đăng ký thành công!
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
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Họ và tên
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Địa chỉ
              </label>
              <div className="mt-2">
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone-number"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Số điện thoại
              </label>
              <div className="mt-2">
                <input
                  id="phone-number"
                  name="phone-number"
                  type="text"
                  pattern="^\d{10}$"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 invalid:text-red-600 p-4"
                />
                {!isPhoneNumberValid() && (
                  <div className="text-red-500 mt-2">
                    Số điện thoại phải gồm 10 chữ số
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 invalid:text-red-600 sm:text-sm sm:leading-6 p-4"
                />
                {!isEmailValid() && (
                  <div className="text-red-500 mt-2">
                    Email cần đúng định dạng
                  </div>
                )}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsPasswordTouched(true);
                  }}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
                />
                {!isPasswordValid() && (
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 p-4"
                />
                <div className="text-red-500 mt-2 h-5">
                  {isPasswordTouched &&
                    !isPasswordMatch() &&
                    "Mật khẩu không khớp"}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isDisableSubmit()}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo tài khoản
              </button>
            </div>
          </form>

          <div className="mt-10 text-center text-sm text-gray-500">
            Bạn đã có tài khoản?{" "}
            <a
              href={"/login"}
              className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
            >
              Đăng nhập
            </a>
          </div>
        </div>
      )}
    </>
  );
}
