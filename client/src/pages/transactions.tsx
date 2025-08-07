import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, IndianRupee } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDateTime } from "@/lib/export-utils";
import { insertTransactionSchema, type BankAccount, type ExpenseCategory, type TransactionWithDetails, type InsertTransaction } from "@shared/schema";

export default function Transactions() {
  const { toast } = useToast();

  const { data: bankAccounts } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
  });

  const { data: expenseCategories } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expense-categories"],
  });

  const { data: transactions, isLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions"],
  });

  const form = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      bankAccountId: "",
      expenseCategoryId: "",
      description: "",
      amount: "",
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/category-wise"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/bank-wise"] });
      form.reset({
        bankAccountId: "",
        expenseCategoryId: "",
        description: "",
        amount: "",
        transactionDate: new Date().toISOString().split('T')[0],
      });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTransaction) => {
    createMutation.mutate(data);
  };

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-accent text-white p-4 shadow-lg">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4 text-white hover:bg-orange-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Add Transaction</h1>
        </div>
      </div>

      <div className="p-4 pb-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank/Cash Account *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} ({account.group})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expenseCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Name *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Expense" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Amount *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-text-secondary-custom" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full btn-accent"
              disabled={createMutation.isPending}
            >
              Add Transaction
            </Button>
          </form>
        </Form>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary-custom mb-4">Recent Transactions</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary-custom">
              No transactions yet. Add your first transaction above.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-text-primary-custom">{transaction.expenseCategory.name}</h3>
                          <span className="text-lg font-semibold text-red-600">
                            -{formatCurrency(parseFloat(transaction.amount.toString()))}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary-custom">
                          {transaction.bankAccount.accountName} • {transaction.expenseCategory.category}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-text-secondary-custom mt-1">{transaction.description}</p>
                        )}
                        <p className="text-xs text-text-secondary-custom">
                          {formatDateTime(transaction.transactionDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
