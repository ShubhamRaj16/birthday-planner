import prisma from '../lib/prisma';
import type { Expense } from '@prisma/client';
import type { CreateExpenseInput, UpdateExpenseInput, ExpenseSummary } from '../types';

const CATEGORIES = [
  'venue', 'catering', 'cake', 'decorations', 'return gifts',
  'entertainment', 'photography', 'invites/printing', 'miscellaneous',
];

export async function listExpenses(eventId: number): Promise<Expense[]> {
  return prisma.expense.findMany({ where: { eventId }, orderBy: { date: 'desc' } });
}

export async function getSummary(eventId: number): Promise<ExpenseSummary> {
  const expenses = await prisma.expense.findMany({ where: { eventId } });
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const paid = expenses.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));
  return { total, paid, unpaid: total - paid, byCategory };
}

export async function createExpense(eventId: number, data: CreateExpenseInput): Promise<Expense> {
  return prisma.expense.create({
    data: {
      eventId,
      label: data.label,
      amount: parseFloat(String(data.amount)),
      category: data.category ?? 'miscellaneous',
      paid: Boolean(data.paid),
      notes: data.notes,
      date: data.date ? new Date(data.date) : new Date(),
    },
  });
}

export async function updateExpense(id: number, data: UpdateExpenseInput): Promise<Expense> {
  return prisma.expense.update({
    where: { id },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.amount !== undefined && { amount: parseFloat(String(data.amount)) }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.paid !== undefined && { paid: Boolean(data.paid) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.receiptPath !== undefined && { receiptPath: data.receiptPath }),
    },
  });
}

export async function deleteExpense(id: number): Promise<Expense> {
  return prisma.expense.delete({ where: { id } });
}

export async function updateReceipt(id: number, receiptPath: string): Promise<Expense> {
  return prisma.expense.update({ where: { id }, data: { receiptPath } });
}
