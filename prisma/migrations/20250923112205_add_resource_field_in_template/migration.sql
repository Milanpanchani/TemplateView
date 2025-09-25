-- AlterTable
ALTER TABLE "public"."otp_verify" ALTER COLUMN "expireAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."templates" ADD COLUMN     "resource" TEXT;
