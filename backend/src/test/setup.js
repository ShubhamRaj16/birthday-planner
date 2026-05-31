const prisma = require('../lib/prisma');

// Global Anthropic SDK mock — no real API calls in tests
vi.mock('@anthropic-ai/sdk', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    content: [{ text: '["suggestion 1","suggestion 2","suggestion 3","suggestion 4","suggestion 5"]' }],
  });
  function MockAnthropic() {
    this.messages = { create: mockCreate };
  }
  MockAnthropic.default = MockAnthropic;
  return { default: MockAnthropic };
});

beforeEach(async () => {
  // Truncate in reverse FK order so constraints don't block deletes
  await prisma.$transaction([
    prisma.photo.deleteMany(),
    prisma.task.deleteMany(),
    prisma.reminder.deleteMany(),
    prisma.guest.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.gift.deleteMany(),
    prisma.event.deleteMany(),
    prisma.child.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
