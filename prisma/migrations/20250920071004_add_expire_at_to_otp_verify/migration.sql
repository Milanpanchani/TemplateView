-- AlterTable
ALTER TABLE "public"."otp_verify" ADD COLUMN     "expireAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '10 minutes');
