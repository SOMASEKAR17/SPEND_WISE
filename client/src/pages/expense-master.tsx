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
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseCategorySchema, type ExpenseCategory, type InsertExpenseCategory } from "@shared/schema";

export default function ExpenseMaster() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: expenseCategories, isLoading } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expense-categories"],
  });

  const form = useForm<InsertExpenseCategory>({
    resolver: zodResolver(insertExpenseCategorySchema),
    defaultValues: {
      name: "",
      group: "",
      category: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertExpenseCategory) => {
      const response = await apiRequest("POST", "/api/expense-categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      form.reset();
      toast({
        title: "Success",
        description: "Expense category created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create expense category",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertExpenseCategory }) => {
      const response = await apiRequest("PUT", `/api/expense-categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      form.reset();
      setEditingId(null);
      toast({
        title: "Success",
        description: "Expense category updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense category",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expense-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      toast({
        title: "Success",
        description: "Expense category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense category",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertExpenseCategory) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingId(category.id);
    form.reset({
      name: category.name,
      group: category.group,
      category: category.category,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-secondary text-white p-4 shadow-lg">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4 text-white hover:bg-green-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Expense Master</h1>
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter expense name" {...field} />
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
                  <FormLabel>Expense Group *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="necessity">Necessity</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="transport">Transportation</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="bills">Bills & Utilities</SelectItem>
                      <SelectItem value="health">Healthcare</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 btn-secondary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update Expense Category" : "Create Expense Category"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Existing Expense Categories */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary-custom mb-4">Existing Categories</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : expenseCategories?.length === 0 ? (
            <div className="text-center py-8 text-text-secondary-custom">
              No expense categories created yet. Create your first category above.
            </div>
          ) : (
            <div className="space-y-3">
              {expenseCategories?.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary-custom">{category.name}</h3>
                        <p className="text-sm text-text-secondary-custom capitalize">
                          {category.group} • {category.category}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className="text-secondary hover:text-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(category.id)}
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
