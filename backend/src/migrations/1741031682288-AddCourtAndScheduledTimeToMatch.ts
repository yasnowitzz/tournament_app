import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourtAndScheduledTimeToMatch1741031682288 implements MigrationInterface {
    name = 'AddCourtAndScheduledTimeToMatch1741031682288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ADD "court" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "scheduledTime" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tournament" ALTER COLUMN "tournamentDescription" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tournament" ALTER COLUMN "matchDuration" DROP DEFAULT`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'player', 'guest')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'player'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'player', 'guest')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'player'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "tournament" ALTER COLUMN "matchDuration" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "tournament" ALTER COLUMN "tournamentDescription" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "scheduledTime"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "court"`);
    }

}
