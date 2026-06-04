-- AlterTable
ALTER TABLE "events" ADD COLUMN "google_photos_url" TEXT;

-- CreateTable
CREATE TABLE "photos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_id" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "caption" TEXT,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "photos_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
