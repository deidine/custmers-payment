// Function to deep clone an object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  const cloned: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

// Function to check if a string is a valid URL
export function isValidUrl(url: string | null | undefined) {
  if (!url) return false;
  try {
    new URL(url); // Attempt to construct a URL
    return true;
  } catch (e) {
    return false;
  }
}

//
export function getValidatedImageSrc(
  src: string | null | undefined,
  fallbackSrc: string
) {
  if (!src) return fallbackSrc;
  return isValidUrl(src) ? src : fallbackSrc;
}

// export function getLocalStorageSize() {
//   let totalSize = 0;

//   for (let i = 0; i < localStorage.length; i++) {
//     const key = localStorage.key(i);
//     const value = localStorage.getItem(key);

//     // Tính toán kích thước của key và value (kích thước UTF-16)
//     totalSize += key.length + value.length;
//   }

//   // Chuyển từ ký tự (16-bit) sang byte (mỗi ký tự UTF-16 là 2 byte)
//   totalSize *= 2;

//   return totalSize; // Dung lượng tính bằng byte
// }
