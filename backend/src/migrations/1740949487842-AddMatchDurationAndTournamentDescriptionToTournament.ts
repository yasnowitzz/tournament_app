import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchDurationAndTournamentDescriptionToTournament1740949487842 implements MigrationInterface {
    name = 'AddMatchDurationAndTournamentDescriptionToTournament1740949487842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tournament" ADD "tournamentDescription" text NOT NULL DEFAULT ''`); 
        await queryRunner.query(`ALTER TABLE "tournament" ADD "matchDuration" integer NOT NULL DEFAULT 0`); 
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
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "matchDuration"`);
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "tournamentDescription"`);
    }

}
