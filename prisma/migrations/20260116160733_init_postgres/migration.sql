-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "takeoffLocation" TEXT NOT NULL,
    "takeoffLat" DOUBLE PRECISION NOT NULL,
    "takeoffLng" DOUBLE PRECISION NOT NULL,
    "takeoffTime" TIMESTAMP(3) NOT NULL,
    "deliveryLocation" TEXT NOT NULL,
    "deliveryLat" DOUBLE PRECISION NOT NULL,
    "deliveryLng" DOUBLE PRECISION NOT NULL,
    "deliveryTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "courier" TEXT,
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT,
    "senderEmail" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientAddress" TEXT,
    "recipientEmail" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingId_key" ON "Shipment"("trackingId");
