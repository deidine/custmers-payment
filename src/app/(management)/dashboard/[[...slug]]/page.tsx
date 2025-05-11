import { notFound } from "next/navigation";

import { dashboardSideItems } from "@/lib/dashboard-items";
import { DashboardCategoryEnum } from "@/lib/dashboard-categories";
import DashboardLayout from "@/components/dashboard/DashboardLayout"; 
import CustomerDashboard from "@/components/dashboard/customer/CustomerDashboard"; 
import UserDashboard from "@/components/dashboard/usres/UserDashboard";
import PaymentDashboard from "@/components/dashboard/payments/PaymentDashboard";

const dashboardComponents: Partial<
  Record<DashboardCategoryEnum, () => JSX.Element>
> = { 
  [DashboardCategoryEnum.CUSTOMERS]: CustomerDashboard, 
  [DashboardCategoryEnum.USERS]:  UserDashboard,
  [DashboardCategoryEnum.PAYMENTS]:  PaymentDashboard,
  [DashboardCategoryEnum.ATTENDANCE]: () => <div>Attendance</div>,
  [DashboardCategoryEnum.REPORTS]: () => <div>Reports</div>,
};

export default function DashboardPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const { slug } = params;
  const category: DashboardCategoryEnum =
    (slug?.[0] as DashboardCategoryEnum) || dashboardSideItems[0].id;

  const DashboardComponent = dashboardComponents[category];
  const title = dashboardSideItems.find((item) => item.id === category)?.title;

  if (!DashboardComponent || !title) return notFound();

  return (
    <DashboardLayout title={title} activeSlug={category}>
      <DashboardComponent />
    </DashboardLayout>
  );
}
