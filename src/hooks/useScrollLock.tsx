import { useEffect } from "react";

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    // Lưu lại giá trị scroll ban đầu
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (lock) {
      // Disable scroll
      document.body.style.overflow = "hidden";

      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [lock]);
}
