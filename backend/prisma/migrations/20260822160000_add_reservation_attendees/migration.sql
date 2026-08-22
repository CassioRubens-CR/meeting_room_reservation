ALTER TABLE "Reservation" ADD COLUMN "attendeesCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Reservation" ADD COLUMN "justification" TEXT;