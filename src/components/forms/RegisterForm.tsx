"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");

  const [error, setError] = useState("");
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          address,
          phoneNumber,
          username: email,
          password,
          role,
        }),
      });

      if (response.ok) {
        setIsSubmitSuccess(true);
      } else {
        const { error } = await response.json();
        setError(error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred!");
    }
  };

  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneNumberValid = () => /^\d{10}$/.test(phoneNumber);
  const isPasswordValid = () => password.length >= 5;
  const isPasswordMatch = () => password === retypePassword;

  const isDisableSubmit = () =>
    !fullName ||
    !address ||
    !phoneNumber ||
    !email ||
    !password ||
    !retypePassword ||
    !isEmailValid() ||
    !isPhoneNumberValid() ||
    !isPasswordMatch();

  return (
    <>
      {isSubmitSuccess ? (
        <div className="text-center my-8">
          <h1 className="text-3xl text-green-600 font-bold mb-8">
            Registration successful!
          </h1>
          <Link
            href={"/login"}
            className="text-blue-500 bg-white p-2 border border-blue-500 rounded-md hover:bg-blue-500 hover:text-white"
          >
            Login
          </Link>
        </div>
      ) : (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="text-red-500 text-center text-md">{error}</div>
          )}
          <form method="POST" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-md p-4 border ring-1 ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                Address
              </label>
              <input
                id="address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full rounded-md p-4 border ring-1 ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-900">
                Phone Number
              </label>
              <input
                id="phone-number"
                type="text"
                pattern="^\d{10}$"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full rounded-md p-4 border ring-1 ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
              {!isPhoneNumberValid() && (
                <div className="text-red-500 mt-2">
                  Phone number must be exactly 10 digits.
                </div>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-900">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2 border rounded-lg focus:ring focus:border-blue-300"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option> 
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md p-4 border ring-1 ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
              {!isEmailValid() && (
                <div className="text-red-500 mt-2">Please enter a valid email address.</div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setIsPasswordTouched(true);
                }}
                className="block w-full rounded-md p-4 border ring-1 ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
              {!isPasswordValid() && (
                <div className="text-red-500 mt-2">Password must be at least 5 characters.</div>
              )}
            </div>

            <div>
              <label htmlFor="retype-password" className="block text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <input
                id="retype-password"
                type="password"
                required
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                className="block w-full rounded-md p-4 border ring-1 ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
              <div className="text-red-500 mt-2 h-5">
                {isPasswordTouched && !isPasswordMatch() && "Passwords do not match."}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isDisableSubmit()}
                className="w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
