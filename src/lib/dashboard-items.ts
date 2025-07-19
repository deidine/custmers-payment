import { DashboardCategoryEnum } from "./dashboard-categories";

type OptionType = "CREATE" | "UPDATE" | "DELETE";

type DashboardCategory = {
  id: DashboardCategoryEnum;
  title: string;
  options?: OptionType[];
};
 // src/lib/dashboard-items.ts
 

// <- no hook here!
export const dashboardSideItems = (
  user?: { role?: string } | null
): DashboardCategory[] => [
  {
    id: DashboardCategoryEnum.CUSTOMERS,
    title: `clients`,
    options: user?.role === "ADMIN"? [  "UPDATE", "DELETE", "CREATE", "VIEW"] : [ "VIEW"],
  },
  {
    id: DashboardCategoryEnum.USERS,
    title: "users",
    options: user?.role === "ADMIN"? [  "UPDATE", "DELETE", "CREATE", "VIEW"] : [ "VIEW"],
  },
  {
    id: DashboardCategoryEnum.PAYMENTS,
    title: "Payments",
    options: user?.role === "ADMIN"? [  "UPDATE", "DELETE", "CREATE", "VIEW"] : [ "VIEW"],
  },
  {
    id: DashboardCategoryEnum.NOPAYEDCUSTOMERS,
    title: "Les clients non payés",
    options: user?.role === "ADMIN"? [  "UPDATE", "DELETE", "CREATE", "VIEW"] : [ "VIEW"],
  }, 
    {
    id: DashboardCategoryEnum.STATISTICS,
    title: "Statistics",
    options: user?.role === "ADMIN"? [  "UPDATE", "DELETE", "CREATE", "VIEW"] : [ "VIEW"],
  },
    {
    id: DashboardCategoryEnum.INVENTORY,
    title: "inventory",
    options: user?.role === "ADMIN"? [  "UPDATE", "DELETE", "CREATE", "VIEW"] : [ "VIEW"],
  },
];

// Sidebar items for management dashboard
export const dashboardSideItems2: DashboardCategory[] = [
 
  {
    id: DashboardCategoryEnum.CUSTOMERS,
    title: "clients" ,
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
 {
    id: DashboardCategoryEnum.STATISTICS,
    title: "Statistics",
    options:   [  "UPDATE", "DELETE", "CREATE", "VIEW"],
  },
     {
    id: DashboardCategoryEnum.INVENTORY,
    title: "inventory",
    options:   [  "UPDATE", "DELETE", "CREATE", "VIEW"]  ,
  },
];
