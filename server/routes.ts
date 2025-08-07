import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBankAccountSchema, insertExpenseCategorySchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bank Account routes
  app.get("/api/bank-accounts", async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bank accounts" });
    }
  });

  app.get("/api/bank-accounts/:id", async (req, res) => {
    try {
      const account = await storage.getBankAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bank account" });
    }
  });

  app.post("/api/bank-accounts", async (req, res) => {
    try {
      const validatedData = insertBankAccountSchema.parse(req.body);
      const account = await storage.createBankAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid bank account data" });
    }
  });

  app.put("/api/bank-accounts/:id", async (req, res) => {
    try {
      const validatedData = insertBankAccountSchema.partial().parse(req.body);
      const account = await storage.updateBankAccount(req.params.id, validatedData);
      if (!account) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid bank account data" });
    }
  });

  app.delete("/api/bank-accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBankAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bank account" });
    }
  });

  // Expense Category routes
  app.get("/api/expense-categories", async (req, res) => {
    try {
      const categories = await storage.getExpenseCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });

  app.get("/api/expense-categories/:id", async (req, res) => {
    try {
      const category = await storage.getExpenseCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Expense category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense category" });
    }
  });

  app.post("/api/expense-categories", async (req, res) => {
    try {
      const validatedData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense category data" });
    }
  });

  app.put("/api/expense-categories/:id", async (req, res) => {
    try {
      const validatedData = insertExpenseCategorySchema.partial().parse(req.body);
      const category = await storage.updateExpenseCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Expense category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense category data" });
    }
  });

  app.delete("/api/expense-categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteExpenseCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense category" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let transactions;
      
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(startDate as string, endDate as string);
      } else {
        transactions = await storage.getTransactions();
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/category-wise", async (req, res) => {
    try {
      const data = await storage.getCategoryWiseExpenses();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category-wise expenses" });
    }
  });

  app.get("/api/analytics/monthly", async (req, res) => {
    try {
      const data = await storage.getMonthlyExpenses();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly expenses" });
    }
  });

  app.get("/api/analytics/bank-wise", async (req, res) => {
    try {
      const data = await storage.getBankWiseExpenses();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bank-wise expenses" });
    }
  });

  // Export routes
  app.get("/api/export/csv", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let transactions;
      
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(startDate as string, endDate as string);
      } else {
        transactions = await storage.getTransactions();
      }

      // Create CSV content
      const csvHeaders = "Date,Bank Account,Expense Name,Category,Group,Description,Amount\n";
      const csvRows = transactions.map(t => {
        const date = new Date(t.transactionDate).toLocaleDateString();
        const amount = parseFloat(t.amount.toString()).toFixed(2);
        return `${date},${t.bankAccount.accountName},${t.expenseCategory.name},${t.expenseCategory.category},${t.expenseCategory.group},"${t.description || ''}",${amount}`;
      }).join('\n');
      
      const csvContent = csvHeaders + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
