import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

export const studentProfile = pgTable('StudentProfile', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => user.id),
  targetMajor: varchar('targetMajor', { length: 64 }),
  targetTerm: varchar('targetTerm', { length: 32 }),
  college: varchar('college', { length: 128 }),
  undergradMajor: varchar('undergradMajor', { length: 64 }),
  greQuantScore: integer('greQuantScore'),
  greVerbalScore: integer('greVerbalScore'),
  greAwaScore: numeric('greAwaScore'),
  cgpa: numeric('cgpa'),
  toeflScore: integer('toeflScore'),
  ielts: varchar('ielts', { length: 16 }),
  workExpMonths: integer('workExpMonths'),
  publications: integer('publications'),
});

export type StudentProfile = InferSelectModel<typeof studentProfile>;

export const savedProgram = pgTable('SavedProgram', {  
  id: uuid('id').primaryKey().notNull().defaultRandom(),  
  userId: uuid('userId')  
    .notNull()  
    .references(() => user.id),  
  programName: text('programName').notNull(),  
  universityName: text('universityName').notNull(),  
  overview: text('overview').notNull(),  
  gpaRequirement: text('gpaRequirement'),  
  greRequirement: text('greRequirement'),  
  toeflRequirement: text('toeflRequirement'),  
  ieltsRequirement: text('ieltsRequirement'),  
  requirementsSummary: text('requirementsSummary'),  
  deadlineHint: text('deadlineHint').notNull(),  
  duration: text('duration').notNull(),  
  costHint: text('costHint').notNull(),  
  highlight1: text('highlight1').notNull(),  
  highlight2: text('highlight2').notNull(),  
  highlight3: text('highlight3'),  
  officialLink: text('officialLink'),  
  imageUrls: json('imageUrls').notNull(),  
  createdAt: timestamp('createdAt').notNull(),  
  matchScore: integer('matchScore'),
  choiceType: text('choiceType'),
});  
  
export type SavedProgram = InferSelectModel<typeof savedProgram>;

export const program = pgTable('Program', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  programName: text('programName').notNull(),
  universityName: text('universityName').notNull(),
  overview: text('overview').notNull(),
  gpaRequirement: text('gpaRequirement'),
  greRequirement: text('greRequirement'),
  toeflRequirement: text('toeflRequirement'),
  ieltsRequirement: text('ieltsRequirement'),
  requirementsSummary: text('requirementsSummary'),
  deadlineHint: text('deadlineHint').notNull(),
  duration: text('duration').notNull(),
  costHint: text('costHint').notNull(),
  highlight1: text('highlight1').notNull(),
  highlight2: text('highlight2').notNull(),
  highlight3: text('highlight3'),
  officialLink: text('officialLink'),
  imageUrls: json('imageUrls').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Program = InferSelectModel<typeof program>;
