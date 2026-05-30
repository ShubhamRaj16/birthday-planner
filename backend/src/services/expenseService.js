const prisma = require('../lib/prisma');

const CATEGORIES = ['venue','catering','cake','decorations','return gifts','entertainment','photography','invites/printing','miscellaneous'];

async function listExpenses(eventId) {
  return prisma.expense.findMany({ where: { eventId }, orderBy: { date: 'desc' } });
}

async function getSummary(eventId) {
  const expenses = await prisma.expense.findMany({ where: { eventId } });
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const paid = expenses.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));
  return { total, paid, unpaid: total - paid, byCategory };
}

async function createExpense(eventId, data) {
  return prisma.expense.create({
    data: {
      eventId,
      label: data.label,
      amount: parseFloat(data.amount),
      category: data.category || 'miscellaneous',
      paid: Boolean(data.paid),
      notes: data.notes,
      date: data.date ? new Date(data.date) : new Date(),
    },
  });
}

async function updateExpense(id, data) {
  return prisma.expense.update({
    where: { id },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.paid !== undefined && { paid: Boolean(data.paid) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.receiptPath !== undefined && { receiptPath: data.receiptPath }),
    },
  });
}

async function deleteExpense(id) {
  return prisma.expense.delete({ where: { id } });
}

async function updateReceipt(id, receiptPath) {
  return prisma.expense.update({ where: { id }, data: { receiptPath } });
}

module.exports = { listExpenses, getSummary, createExpense, updateExpense, deleteExpense, updateReceipt };
