import { 
  type BankAccount, 
  type InsertBankAccount,
  type ExpenseCategory,
  type InsertExpenseCategory,
  type Transaction,
  type InsertTransaction,
  type TransactionWithDetails,
  bankAccounts,
  expenseCategories,
  transactions
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Bank Account operations
  getBankAccounts(): Promise<BankAccount[]>;
  getBankAccount(id: string): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: string, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: string): Promise<boolean>;

  // Expense Category operations
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: string): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: string, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined>;
  deleteExpenseCategory(id: string): Promise<boolean>;

  // Transaction operations
  getTransactions(): Promise<TransactionWithDetails[]>;
  getTransaction(id: string): Promise<TransactionWithDetails | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<TransactionWithDetails>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<TransactionWithDetails | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Dashboard analytics
  getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionWithDetails[]>;
  getCategoryWiseExpenses(): Promise<{ category: string; total: number; count: number }[]>;
  getMonthlyExpenses(): Promise<{ month: string; total: number; count: number }[]>;
  getBankWiseExpenses(): Promise<{ bankAccount: string; total: number; count: number }[]>;
}

export class MemStorage implements IStorage {
  private bankAccounts: Map<string, BankAccount>;
  private expenseCategories: Map<string, ExpenseCategory>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.bankAccounts = new Map();
    this.expenseCategories = new Map();
    this.transactions = new Map();
  }

  // Bank Account operations
  async getBankAccounts(): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values());
  }

  async getBankAccount(id: string): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }

  async createBankAccount(insertAccount: InsertBankAccount): Promise<BankAccount> {
    const id = randomUUID();
    const account: BankAccount = {
      ...insertAccount,
      id,
      description: insertAccount.description || null,
      createdAt: new Date(),
    };
    this.bankAccounts.set(id, account);
    return account;
  }

  async updateBankAccount(id: string, updates: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const existing = this.bankAccounts.get(id);
    if (!existing) return undefined;

    const updated: BankAccount = { ...existing, ...updates };
    this.bankAccounts.set(id, updated);
    return updated;
  }

  async deleteBankAccount(id: string): Promise<boolean> {
    return this.bankAccounts.delete(id);
  }

  // Expense Category operations
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategories.values());
  }

  async getExpenseCategory(id: string): Promise<ExpenseCategory | undefined> {
    return this.expenseCategories.get(id);
  }

  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = randomUUID();
    const category: ExpenseCategory = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.expenseCategories.set(id, category);
    return category;
  }

  async updateExpenseCategory(id: string, updates: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const existing = this.expenseCategories.get(id);
    if (!existing) return undefined;

    const updated: ExpenseCategory = { ...existing, ...updates };
    this.expenseCategories.set(id, updated);
    return updated;
  }

  async deleteExpenseCategory(id: string): Promise<boolean> {
    return this.expenseCategories.delete(id);
  }

  // Transaction operations
  async getTransactions(): Promise<TransactionWithDetails[]> {
    const transactions = Array.from(this.transactions.values());
    const result: TransactionWithDetails[] = [];

    for (const transaction of transactions) {
      const bankAccount = this.bankAccounts.get(transaction.bankAccountId);
      const expenseCategory = this.expenseCategories.get(transaction.expenseCategoryId);
      
      if (bankAccount && expenseCategory) {
        result.push({
          ...transaction,
          bankAccount,
          expenseCategory,
        });
      }
    }

    return result.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  async getTransaction(id: string): Promise<TransactionWithDetails | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const bankAccount = this.bankAccounts.get(transaction.bankAccountId);
    const expenseCategory = this.expenseCategories.get(transaction.expenseCategoryId);

    if (!bankAccount || !expenseCategory) return undefined;

    return {
      ...transaction,
      bankAccount,
      expenseCategory,
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<TransactionWithDetails> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      description: insertTransaction.description || null,
      amount: insertTransaction.amount,
      transactionDate: new Date(insertTransaction.transactionDate),
      createdAt: new Date(),
    };
    
    this.transactions.set(id, transaction);

    const bankAccount = this.bankAccounts.get(transaction.bankAccountId)!;
    const expenseCategory = this.expenseCategories.get(transaction.expenseCategoryId)!;

    return {
      ...transaction,
      bankAccount,
      expenseCategory,
    };
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<TransactionWithDetails | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = { 
      ...existing, 
      ...updates,
      transactionDate: updates.transactionDate ? new Date(updates.transactionDate) : existing.transactionDate,
    };
    this.transactions.set(id, updated);

    const bankAccount = this.bankAccounts.get(updated.bankAccountId)!;
    const expenseCategory = this.expenseCategories.get(updated.expenseCategoryId)!;

    return {
      ...updated,
      bankAccount,
      expenseCategory,
    };
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionWithDetails[]> {
    const allTransactions = await this.getTransactions();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate);
      return transactionDate >= start && transactionDate <= end;
    });
  }

  async getCategoryWiseExpenses(): Promise<{ category: string; total: number; count: number }[]> {
    const transactions = await this.getTransactions();
    const categoryMap = new Map<string, { total: number; count: number }>();

    transactions.forEach(transaction => {
      const category = transaction.expenseCategory.category;
      const amount = parseFloat(transaction.amount.toString());
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          total: existing.total + amount,
          count: existing.count + 1,
        });
      } else {
        categoryMap.set(category, { total: amount, count: 1 });
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    }));
  }

  async getMonthlyExpenses(): Promise<{ month: string; total: number; count: number }[]> {
    const transactions = await this.getTransactions();
    const monthMap = new Map<string, { total: number; count: number }>();

    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const amount = parseFloat(transaction.amount.toString());
      
      if (monthMap.has(month)) {
        const existing = monthMap.get(month)!;
        monthMap.set(month, {
          total: existing.total + amount,
          count: existing.count + 1,
        });
      } else {
        monthMap.set(month, { total: amount, count: 1 });
      }
    });

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  }

  async getBankWiseExpenses(): Promise<{ bankAccount: string; total: number; count: number }[]> {
    const transactions = await this.getTransactions();
    const bankMap = new Map<string, { total: number; count: number }>();

    transactions.forEach(transaction => {
      const bankAccount = transaction.bankAccount.accountName;
      const amount = parseFloat(transaction.amount.toString());
      
      if (bankMap.has(bankAccount)) {
        const existing = bankMap.get(bankAccount)!;
        bankMap.set(bankAccount, {
          total: existing.total + amount,
          count: existing.count + 1,
        });
      } else {
        bankMap.set(bankAccount, { total: amount, count: 1 });
      }
    });

    return Array.from(bankMap.entries()).map(([bankAccount, data]) => ({
      bankAccount,
      ...data,
    }));
  }
}

export class DatabaseStorage implements IStorage {
  async getBankAccounts(): Promise<BankAccount[]> {
    return await db.select().from(bankAccounts);
  }

  async getBankAccount(id: string): Promise<BankAccount | undefined> {
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return account || undefined;
  }

  async createBankAccount(insertAccount: InsertBankAccount): Promise<BankAccount> {
    const [account] = await db
      .insert(bankAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateBankAccount(id: string, updates: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const [account] = await db
      .update(bankAccounts)
      .set(updates)
      .where(eq(bankAccounts.id, id))
      .returning();
    return account || undefined;
  }

  async deleteBankAccount(id: string): Promise<boolean> {
    const result = await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return await db.select().from(expenseCategories);
  }

  async getExpenseCategory(id: string): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return category || undefined;
  }

  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [category] = await db
      .insert(expenseCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateExpenseCategory(id: string, updates: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const [category] = await db
      .update(expenseCategories)
      .set(updates)
      .where(eq(expenseCategories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteExpenseCategory(id: string): Promise<boolean> {
    const result = await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTransactions(): Promise<TransactionWithDetails[]> {
    const result = await db
      .select({
        id: transactions.id,
        bankAccountId: transactions.bankAccountId,
        expenseCategoryId: transactions.expenseCategoryId,
        description: transactions.description,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        bankAccount: {
          id: bankAccounts.id,
          accountName: bankAccounts.accountName,
          group: bankAccounts.group,
          description: bankAccounts.description,
          createdAt: bankAccounts.createdAt,
        },
        expenseCategory: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          group: expenseCategories.group,
          category: expenseCategories.category,
          createdAt: expenseCategories.createdAt,
        },
      })
      .from(transactions)
      .innerJoin(bankAccounts, eq(transactions.bankAccountId, bankAccounts.id))
      .innerJoin(expenseCategories, eq(transactions.expenseCategoryId, expenseCategories.id))
      .orderBy(sql`${transactions.transactionDate} DESC`);

    return result;
  }

  async getTransaction(id: string): Promise<TransactionWithDetails | undefined> {
    const [result] = await db
      .select({
        id: transactions.id,
        bankAccountId: transactions.bankAccountId,
        expenseCategoryId: transactions.expenseCategoryId,
        description: transactions.description,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        bankAccount: {
          id: bankAccounts.id,
          accountName: bankAccounts.accountName,
          group: bankAccounts.group,
          description: bankAccounts.description,
          createdAt: bankAccounts.createdAt,
        },
        expenseCategory: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          group: expenseCategories.group,
          category: expenseCategories.category,
          createdAt: expenseCategories.createdAt,
        },
      })
      .from(transactions)
      .innerJoin(bankAccounts, eq(transactions.bankAccountId, bankAccounts.id))
      .innerJoin(expenseCategories, eq(transactions.expenseCategoryId, expenseCategories.id))
      .where(eq(transactions.id, id));

    return result || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<TransactionWithDetails> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        transactionDate: new Date(insertTransaction.transactionDate),
      })
      .returning();

    const result = await this.getTransaction(transaction.id);
    return result!;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<TransactionWithDetails | undefined> {
    const updateData: any = { ...updates };
    if (updates.transactionDate) {
      updateData.transactionDate = new Date(updates.transactionDate);
    }

    const [transaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    if (!transaction) return undefined;

    return await this.getTransaction(transaction.id);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionWithDetails[]> {
    const result = await db
      .select({
        id: transactions.id,
        bankAccountId: transactions.bankAccountId,
        expenseCategoryId: transactions.expenseCategoryId,
        description: transactions.description,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        bankAccount: {
          id: bankAccounts.id,
          accountName: bankAccounts.accountName,
          group: bankAccounts.group,
          description: bankAccounts.description,
          createdAt: bankAccounts.createdAt,
        },
        expenseCategory: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          group: expenseCategories.group,
          category: expenseCategories.category,
          createdAt: expenseCategories.createdAt,
        },
      })
      .from(transactions)
      .innerJoin(bankAccounts, eq(transactions.bankAccountId, bankAccounts.id))
      .innerJoin(expenseCategories, eq(transactions.expenseCategoryId, expenseCategories.id))
      .where(sql`${transactions.transactionDate} >= ${startDate} AND ${transactions.transactionDate} <= ${endDate}`)
      .orderBy(sql`${transactions.transactionDate} DESC`);

    return result;
  }

  async getCategoryWiseExpenses(): Promise<{ category: string; total: number; count: number }[]> {
    const result = await db
      .select({
        category: expenseCategories.category,
        total: sql<number>`SUM(CAST(${transactions.amount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .innerJoin(expenseCategories, eq(transactions.expenseCategoryId, expenseCategories.id))
      .groupBy(expenseCategories.category);

    return result.map(row => ({
      category: row.category,
      total: Number(row.total),
      count: Number(row.count),
    }));
  }

  async getMonthlyExpenses(): Promise<{ month: string; total: number; count: number }[]> {
    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.transactionDate}, 'Mon YYYY')`,
        total: sql<number>`SUM(CAST(${transactions.amount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .groupBy(sql`TO_CHAR(${transactions.transactionDate}, 'Mon YYYY')`, sql`DATE_TRUNC('month', ${transactions.transactionDate})`)
      .orderBy(sql`DATE_TRUNC('month', ${transactions.transactionDate})`);

    return result.map(row => ({
      month: row.month,
      total: Number(row.total),
      count: Number(row.count),
    }));
  }

  async getBankWiseExpenses(): Promise<{ bankAccount: string; total: number; count: number }[]> {
    const result = await db
      .select({
        bankAccount: bankAccounts.accountName,
        total: sql<number>`SUM(CAST(${transactions.amount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .innerJoin(bankAccounts, eq(transactions.bankAccountId, bankAccounts.id))
      .groupBy(bankAccounts.accountName);

    return result.map(row => ({
      bankAccount: row.bankAccount,
      total: Number(row.total),
      count: Number(row.count),
    }));
  }
}

export const storage = new DatabaseStorage();
