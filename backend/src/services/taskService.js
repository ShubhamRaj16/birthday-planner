const prisma = require('../lib/prisma');

async function getTask(id) {
  return prisma.task.findUnique({ where: { id } });
}

async function updateTask(id, data) {
  return prisma.task.update({
    where: { id },
    data: {
      ...(data.done !== undefined && { done: Boolean(data.done) }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
  });
}

module.exports = { getTask, updateTask };
