"use client";
import { Toaster } from "react-hot-toast";

export default function ReactHotToast({
  duration = 3000,
}: {
  duration?: number;
}) {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: duration,
        }}
        containerStyle={{ top: 100 }}
      />
    </>
  );
}
