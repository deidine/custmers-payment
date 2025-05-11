import { getUserProfileViewByUserUuid } from "@/db/queries";
import { decrypt, getSessionToken } from "@/lib/auth";
import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import { UserProfileClient } from "@/components/profile/UserProfileClient";
import ReactHotToast from "@/components/ui/ReactHotToast";

export default async function UserProfilePage() {
  const token = getSessionToken();
  if (!token) {
    redirect("/login");
  }

  const payload = await decrypt(token);
  if (!payload || !payload.uuid) {
    redirect("/login");
  }

  const userUuid = payload.uuid as string;
  const result = await getUserProfileViewByUserUuid(userUuid);
  const userProfile = camelcaseKeys(result, { deep: true });

  return (
    <div className="flex flex-col justify-start items-center gap-8 p-8">
      <ReactHotToast />

      <UserProfileClient initialData={userProfile} userUuid={userUuid} />
    </div>
  );
}
