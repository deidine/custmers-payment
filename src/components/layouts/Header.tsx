"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import Navbar from "./Navbar";
import SearchBar from "../ui/SearchBar";
import AuthOptions from "./AuthOptions";
  

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
 
  const router = useRouter();

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting); // Ẩn header
        });
      },
      {
        root: null,
        threshold: 0,
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, []);

  const handleCardClick = () => {
    setIsCartOpen((prev) => !prev);
  };

  // TODO: implement search
  

  return (
    <>
      <header
        className={`bg-white shadow sticky top-0 z-50 transition-transform duration-300 ${
          isVisible ? "-translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative flex flex-col lg:flex-row justify-between mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href={"/"}>
              <h1 className="text-3xl font-bold tracking-tight text-green-600 min-w-[200px]">
               Payment
              </h1>
            </Link> 
          </div>

          <div className="lg:hidden my-4 border-t border-gray-300"></div>

          <div className="flex flex-wrap justify-center lg:justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center items-center gap-4">
              <button className="text-gray-600 hover:text-gray-800">
                <i className="fa-regular fa-bell"></i>  Notification
              </button>
 

              <AuthOptions />
            </div>
          </div>
        </div>
        <Navbar />
      </header>

      {/* Shopping cart overlay */}
      
      <div ref={observerRef} className="h-1"></div>
    </>
  );
}
