import { DashboardCategoryEnum } from "./dashboard-categories";

type OptionType = "CREATE" | "UPDATE" | "DELETE";

type DashboardCategory = {
  id: DashboardCategoryEnum;
  title: string;
  options?: OptionType[];
};

// Sidebar items for management dashboard
export const dashboardSideItems: DashboardCategory[] = [
 
  {
    id: DashboardCategoryEnum.CUSTOMERS,
    title: "clients",
    options: ["UPDATE", "DELETE", "CREATE", "VIEW"],
  },
  {
    id: DashboardCategoryEnum.USERS,
    title: "users",
    options: ["CREATE", "UPDATE", "DELETE" ],
  },{ 
    id: DashboardCategoryEnum.PAYMENTS,
    title: "Payments",   
    options: ["CREATE", "UPDATE", "DELETE", "VIEW"],
  },
  {
    id: DashboardCategoryEnum.NOPAYEDCUSTOMERS,
    title: "Les clients non payés",
    options: ["CREATE", "UPDATE", "DELETE", "VIEW"],
  },
 
];
