import { MigrationInterface, QueryRunner } from "typeorm";

export class TournamentsMigrations1737905067814 implements MigrationInterface {
    name = 'TournamentsMigrations1737905067814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tournament" ADD "numTeams" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "numCourts" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "startTime" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "breakDuration" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "hasLunchBreak" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "lunchBreakDuration" integer`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "seeding" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "numSeededTeams" integer`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "matchFormat" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "setFormat" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "tieBreakFormat" character varying`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "location" character varying NOT NULL`);
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
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "tieBreakFormat"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "setFormat"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "matchFormat"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "numSeededTeams"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "seeding"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "lunchBreakDuration"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "hasLunchBreak"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "breakDuration"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "numCourts"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "numTeams"`);
    }

}
