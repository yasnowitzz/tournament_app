import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyStartTimeType1741032210163 implements MigrationInterface {
    name = 'ModifyStartTimeType1741032210163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "startTime" TIMESTAMP NOT NULL DEFAULT '2023-01-01 00:00:00'`);
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
        await queryRunner.query(`ALTER TABLE "tournament" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "tournament" ADD "startTime" character varying NOT NULL`);
    }

}
