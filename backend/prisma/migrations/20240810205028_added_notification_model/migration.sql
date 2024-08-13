-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "notificationFor_Id" TEXT NOT NULL,
    "notificationFrom_Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notificationFor_Id_fkey" FOREIGN KEY ("notificationFor_Id") REFERENCES "UserInfo"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notificationFrom_Id_fkey" FOREIGN KEY ("notificationFrom_Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
