import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, BarChart3, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryChart, MonthlyChart } from "@/components/chart-components";
import { formatCurrency } from "@/lib/export-utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionWithDetails } from "@shared/schema";

export default function Dashboard() {
  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery<{ category: string; total: number; count: number }[]>({
    queryKey: ["/api/analytics/category-wise"],
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<{ month: string; total: number; count: number }[]>({
    queryKey: ["/api/analytics/monthly"],
  });

  // Calculate totals
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTotal = transactions?.reduce((sum, t) => {
    const transactionDate = new Date(t.transactionDate);
    if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
      return sum + parseFloat(t.amount.toString());
    }
    return sum;
  }, 0) || 0;

  const totalBalance = 45680; // This would come from bank account balances in a real app

  if (transactionsLoading || categoryLoading || monthlyLoading) {
    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-primary text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Expense Tracker</h1>
            <button className="p-2 rounded-full hover:bg-blue-700">
              <User className="h-5 w-5" />
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <p className="text-sm opacity-90">This Month</p>
              <Skeleton className="h-6 w-20 mt-1 bg-blue-500" />
            </div>
            <div className="bg-blue-600 p-3 rounded-lg">
              <p className="text-sm opacity-90">Available Balance</p>
              <Skeleton className="h-6 w-24 mt-1 bg-blue-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-text-primary-custom mb-4">Expense Overview</h2>
          
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="text-md font-medium mb-3">Category Wise</h3>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="text-md font-medium mb-3">Monthly Trend</h3>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Expense Tracker</h1>
          <button className="p-2 rounded-full hover:bg-blue-700">
            <User className="h-5 w-5" />
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <p className="text-sm opacity-90">This Month</p>
            <p className="text-lg font-bold">{formatCurrency(monthlyTotal)}</p>
          </div>
          <div className="bg-blue-600 p-3 rounded-lg">
            <p className="text-sm opacity-90">Available Balance</p>
            <p className="text-lg font-bold">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-text-primary-custom mb-4">Expense Overview</h2>
        
        {/* Category Wise Chart */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-md font-medium mb-3">Category Wise</h3>
            {categoryData && categoryData.length > 0 ? (
              <CategoryChart data={categoryData} />
            ) : (
              <div className="h-32 flex items-center justify-center text-text-secondary-custom">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-md font-medium mb-3">Monthly Trend</h3>
            {monthlyData && monthlyData.length > 0 ? (
              <MonthlyChart data={monthlyData} />
            ) : (
              <div className="h-32 flex items-center justify-center text-text-secondary-custom">
                No monthly data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-20">
          <Link href="/transactions">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Plus className="text-primary text-2xl mb-2 mx-auto" size={32} />
                <p className="text-sm font-medium">Add Transaction</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reports">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <BarChart3 className="text-secondary text-2xl mb-2 mx-auto" size={32} />
                <p className="text-sm font-medium">View Reports</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
