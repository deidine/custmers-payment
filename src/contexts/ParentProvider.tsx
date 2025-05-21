 
import { UserProvider } from "./UserContext";

export default function ParentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div>{children}</div>
    </UserProvider>
  );
}
