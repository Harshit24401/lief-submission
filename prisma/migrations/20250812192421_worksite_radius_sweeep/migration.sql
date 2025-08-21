/*
  Warnings:

  - Added the required column `worksiteId` to the `Shift` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Worksite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Shift" ADD COLUMN     "worksiteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Worksite" ADD COLUMN     "managerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Shift" ADD CONSTRAINT "Shift_worksiteId_fkey" FOREIGN KEY ("worksiteId") REFERENCES "public"."Worksite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Worksite" ADD CONSTRAINT "Worksite_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
