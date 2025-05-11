import { ProductFilterProvider } from "./FilterContext";
import { CartProvider } from "./CartContext";
import { UserProvider } from "./UserContext";

export default function ParentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <CartProvider>
        <ProductFilterProvider>{children}</ProductFilterProvider>
      </CartProvider>
    </UserProvider>
  );
}
