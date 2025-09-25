/*
  Warnings:

  - You are about to drop the column `email` on the `otp_verify` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `otp_verify` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `otp_verify` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."otp_verify_email_key";

-- AlterTable
ALTER TABLE "public"."otp_verify" DROP COLUMN "email",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "otp_verify_userId_idx" ON "public"."otp_verify"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "otp_verify_userId_key" ON "public"."otp_verify"("userId");

-- AddForeignKey
ALTER TABLE "public"."otp_verify" ADD CONSTRAINT "otp_verify_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
