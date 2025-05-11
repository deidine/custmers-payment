import Image from "next/image";
import Link from "next/link";
import PhoneIcon from "../../public/images/phone-call.svg";

export default function Footer() {
  const contactList = ["+84 123 456 789", "+84 135 791 357"];

  const addressList = [
    "45 Đường ABC, Hải Phòng",
    "46 Đường DEF, Hải Phòng",
    "47 Đường XYZ, Hải Phòng",
  ];

  const infoList = [
    { label: "Giới thiệu", link: "/" },
    { label: "Hệ thống cửa hàng", link: "/" },
    { label: "Giấy phép kinh doanh", link: "/" },
    { label: "Chính sách giao hàng", link: "/" },
    { label: "Chính sách thanh toán", link: "/" },
    { label: "Chính sách bảo mật", link: "/" },
  ];

  const socialList = [
    { label: "Facebook", link: "https://www.facebook.com" },
    { label: "Zalo", link: "https://www.twitter.com" },
    { label: "Instagram", link: "https://www.instagram.com" },
  ];

  return (
    <footer className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-800 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="w-3/4 sm:w-auto">
          <h1 className="text-3xl font-bold tracking-tight text-green-600 mb-2 md:mb-0">
            V2H Pharmacy Store
          </h1>
          <h4 className="text-xl font-bold tracking-tight text-slate-200 mb-2 md:mb-0">
            Liên hệ
          </h4>
          <ul>
            {contactList.map((contact) => (
              <li key={contact}>
                <PhoneIcon
                  className="inline-block"
                  fill="white"
                  height={20}
                  width={20}
                />{" "}
                {contact}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4 sm:hidden my-4 border-t border-gray-300"></div>
        <div className="w-3/4 sm:w-auto">
          <h4 className="text-xl font-bold tracking-tight text-slate-200 mb-2 md:mb-0">
            Địa chỉ:
          </h4>
          <ul>
            {addressList.map((address) => (
              <li key={address}>{address}</li>
            ))}
          </ul>
        </div>
        <div className="w-3/4 sm:hidden my-4 border-t border-gray-300"></div>
        <div className="w-3/4 sm:w-auto">
          <h4 className="text-xl font-bold tracking-tight text-slate-200 mb-2 md:mb-0">
            Về V2H Pharmacy:
          </h4>
          <ul className="list-disc list-inside">
            {infoList.map((info) => (
              <li key={info.label}>
                <Link
                  className="hover:text-green-400 transition-colors"
                  href={info.link}
                >
                  {info.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className=" flex flex-col-reverse sm:flex-row justify-between items-center w-full sm:w-auto border-t border-gray-300 border-w-full">
        <h6 className="text-sm leading-6 font-bold text-white">
          © 2024 V2H. All rights reserved.
        </h6>
        <ul className="flex gap-4 pb-2">
          {socialList.map((social) => (
            <li key={social.label}>
              <Link
                href={social.link}
                className="text-white hover:text-green-400 transition-colors"
              >
                {social.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
