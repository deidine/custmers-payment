"use client";
import toast from "react-hot-toast";

import { useState } from "react";
import Image from "next/image";
import { UserProfileView } from "@/types/user-profile";
import DefaultProfileAvatar from "../../public/images/default-avatar.png";
import { isValidUrl } from "@/utils/helpers";

type UserProfileClientProps = {
  initialData: UserProfileView;
  userUuid: string;
};

export function UserProfileClient({
  initialData,
  userUuid,
}: UserProfileClientProps) {
  const [userData, setUserData] = useState<UserProfileView>(initialData);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const toastId = toast.loading("Updating profile...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/user-profiles?userUuid=${userUuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      setTimeout(() => {
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      toast.dismiss(toastId);
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            {userData?.profilePictureUrl &&
            isValidUrl(userData?.profilePictureUrl) ? (
              <Image
                src={userData.profilePictureUrl || ""}
                alt={userData.fullName || userData.username}
                fill
                sizes="33vh"
                className="object-cover"
              />
            ) : (
              <Image
                src={DefaultProfileAvatar || ""}
                alt={userData.fullName || userData.username}
                fill
                sizes="33vh"
                className="object-cover"
              />
            )}
          </div>
          {/* Image upload button */}
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Change Photo
          </button>
        </div>

        {/* Edit Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Edit Profile
            </h3>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={userData.fullName || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-700">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={
                    (userData.birthDate || new Date())
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      birthDate: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Address</label>
                <input
                  type="text"
                  value={userData.address || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={userData.phoneNumber || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <>
      {/* Avatar Display */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
          {userData?.profilePictureUrl &&
          isValidUrl(userData?.profilePictureUrl) ? (
            <Image
              src={userData.profilePictureUrl || ""}
              alt={userData.fullName || userData.username}
              fill
              sizes="33vh"
              className="object-cover"
            />
          ) : (
            <Image
              src={DefaultProfileAvatar || ""}
              alt={userData.fullName || userData.username}
              fill
              sizes="33vh"
              className="object-cover"
            />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {userData.fullName || "???"}
        </h2>
        <span className="text-sm text-gray-500 capitalize">
          -- {userData.role.toLowerCase()} --
        </span>
      </div>

      {/* Info Card */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Personal Information
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">
                {userData.fullName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-900">{userData.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">
                {userData.phoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Birth Date</p>
              <p className="font-medium text-gray-900">
                {userData.birthDate
                  ? new Date(userData.birthDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium text-gray-900">
              {userData.address || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
