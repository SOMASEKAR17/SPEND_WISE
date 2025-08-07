import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertBankAccountSchema, type BankAccount, type InsertBankAccount } from "@shared/schema";

export default function BankMaster() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: bankAccounts, isLoading } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
  });

  const form = useForm<InsertBankAccount>({
    resolver: zodResolver(insertBankAccountSchema),
    defaultValues: {
      accountName: "",
      group: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBankAccount) => {
      const response = await apiRequest("POST", "/api/bank-accounts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      form.reset();
      toast({
        title: "Success",
        description: "Bank account created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create bank account",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertBankAccount }) => {
      const response = await apiRequest("PUT", `/api/bank-accounts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      form.reset();
      setEditingId(null);
      toast({
        title: "Success",
        description: "Bank account updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bank account",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bank-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      toast({
        title: "Success",
        description: "Bank account deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bank account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBankAccount) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingId(account.id);
    form.reset({
      accountName: account.accountName,
      group: account.group,
      description: account.description || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-lg">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4 text-white hover:bg-blue-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Bank Account Master</h1>
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description (optional)" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update Bank Account" : "Create Bank Account"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Existing Bank Accounts */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary-custom mb-4">Existing Accounts</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : bankAccounts?.length === 0 ? (
            <div className="text-center py-8 text-text-secondary-custom">
              No bank accounts created yet. Create your first account above.
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts?.map((account) => (
                <Card key={account.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary-custom">{account.accountName}</h3>
                        <p className="text-sm text-text-secondary-custom capitalize">{account.group}</p>
                        {account.description && (
                          <p className="text-xs text-text-secondary-custom mt-1">{account.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(account)}
                          className="text-primary hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(account.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
