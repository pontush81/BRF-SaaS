// Mock implementation av PrismaClient
export const prisma = {
  // Mock implementation av $transaction
  $transaction: jest.fn().mockImplementation(async args => {
    return Promise.resolve(args);
  }),

  // Mock för Handbook-modellen
  handbook: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation(data => Promise.resolve(data.data)),
    update: jest.fn().mockImplementation(data => Promise.resolve(data.data)),
  },

  // Mock för andra modeller som använs i testerna
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(data => Promise.resolve(data.data)),
  },

  // Mock för $disconnect
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

export default prisma;
