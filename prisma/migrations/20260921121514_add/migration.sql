-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `documentSnapshot` JSON NULL;

-- AlterTable
ALTER TABLE `Organization` ADD COLUMN `bankAccountName` VARCHAR(191) NULL,
    ADD COLUMN `bankAccountNumber` VARCHAR(191) NULL,
    ADD COLUMN `bankAccountType` VARCHAR(191) NULL,
    ADD COLUMN `bankBranchCode` VARCHAR(191) NULL,
    ADD COLUMN `bankName` VARCHAR(191) NULL,
    ADD COLUMN `invoiceFooter` VARCHAR(191) NULL,
    ADD COLUMN `logoUrl` VARCHAR(191) NULL,
    ADD COLUMN `paymentInstructions` VARCHAR(191) NULL,
    ADD COLUMN `tradingName` VARCHAR(191) NULL,
    ADD COLUMN `vatRegistered` BOOLEAN NOT NULL DEFAULT false;
