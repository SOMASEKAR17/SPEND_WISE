import { Link, useLocation } from "wouter";
import { Home, University, Plus, Tags, TrendingUp } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home", target: "dashboard" },
    { path: "/bank-master", icon: University, label: "Banks", target: "bank-master" },
    { path: "/transactions", icon: Plus, label: "", target: "transactions" },
    { path: "/expense-master", icon: Tags, label: "Expenses", target: "expense-master" },
    { path: "/reports", icon: TrendingUp, label: "Reports", target: "reports" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-border">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path === "/" && location === "/dashboard");
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex flex-col items-center justify-center h-full transition-colors ${
                isActive ? "text-primary" : "text-text-secondary-custom hover:text-primary"
              }`}>
                <Icon className={item.label === "" ? "text-2xl" : "text-lg"} size={item.label === "" ? 32 : 20} />
                {item.label && <span className="text-xs mt-1">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
