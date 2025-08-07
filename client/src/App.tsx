import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import BankMaster from "@/pages/bank-master";
import ExpenseMaster from "@/pages/expense-master";
import Transactions from "@/pages/transactions";
import Reports from "@/pages/reports";
import BottomNavigation from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/bank-master" component={BankMaster} />
      <Route path="/expense-master" component={ExpenseMaster} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen relative">
          <Router />
          <BottomNavigation />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
