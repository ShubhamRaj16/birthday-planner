-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "child_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "venue" TEXT,
    "address" TEXT,
    "theme" TEXT,
    "budget" REAL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "my_gate_link" TEXT,
    "card_path" TEXT,
    "message_template" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "events_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_events" ("address", "budget", "card_path", "child_id", "created_at", "date", "id", "message_template", "my_gate_link", "notes", "status", "theme", "updated_at", "venue") SELECT "address", "budget", "card_path", "child_id", "created_at", "date", "id", "message_template", "my_gate_link", "notes", "status", "theme", "updated_at", "venue" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
