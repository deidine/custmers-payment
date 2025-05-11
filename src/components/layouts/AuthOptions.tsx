"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import ProfileSVG from "../../public/images/profile-circle.svg";

export default function AuthOptions() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        setUser(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <>
      {!user ? (
        <div className="flex gap-4 items-center">
          <Link href={"/login"} className="text-blue-600 hover:text-blue-800">
            Đăng nhập
          </Link>
          <Link
            href={"/register"}
            className="text-blue-600 hover:text-blue-800"
          >
            Đăng ký
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <Link href={"/me"} className="text-blue-600 hover:text-blue-800">
            <ProfileSVG className="w-6 h-6 inline" /> Tài khoản
          </Link>
          <div
            onClick={handleLogout}
            className="text-blue-600 hover:text-blue-800 hover:cursor-pointer"
          >
            Đăng xuất
          </div>
        </div>
      )}
    </>
  );
}
