ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'MIXED';

ALTER TABLE "ShiftClose"
  ADD COLUMN "totalPosDebit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "totalPosCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "totalTransfer" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "totalMixed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "totalUnassigned" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "salesCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "CashSale" (
  "id" TEXT NOT NULL,
  "tableId" TEXT NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "paymentMethod" "PaymentMethod",
  "referenceNum" TEXT,
  "isReconciled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CashSale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashSaleOrder" (
  "cashSaleId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  CONSTRAINT "CashSaleOrder_pkey" PRIMARY KEY ("cashSaleId", "orderId")
);

CREATE UNIQUE INDEX "CashSaleOrder_orderId_key" ON "CashSaleOrder"("orderId");
CREATE INDEX "CashSale_createdAt_idx" ON "CashSale"("createdAt");
CREATE INDEX "CashSale_tableId_createdAt_idx" ON "CashSale"("tableId", "createdAt");
CREATE INDEX "CashSaleOrder_cashSaleId_idx" ON "CashSaleOrder"("cashSaleId");

ALTER TABLE "CashSale"
  ADD CONSTRAINT "CashSale_tableId_fkey"
  FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CashSaleOrder"
  ADD CONSTRAINT "CashSaleOrder_cashSaleId_fkey"
  FOREIGN KEY ("cashSaleId") REFERENCES "CashSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CashSaleOrder"
  ADD CONSTRAINT "CashSaleOrder_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
