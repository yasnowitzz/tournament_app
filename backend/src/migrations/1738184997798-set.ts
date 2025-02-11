import { MigrationInterface, QueryRunner } from "typeorm";

export class Set1738184997798 implements MigrationInterface {
    name = 'Set1738184997798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_ed5f9ae2f22492649e603c01e3c"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_954f8d7997e49ee77fb7bd84062"`);
        await queryRunner.query(`CREATE TABLE "set" ("id" SERIAL NOT NULL, "team1_score" integer NOT NULL, "team2_score" integer NOT NULL, "set_number" integer NOT NULL, "matchId" integer, CONSTRAINT "PK_3a80144a9f862484a2cae876eed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "scoreA"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "scoreB"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "matchDate"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "teamAId"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "teamBId"`);
        await queryRunner.query(`ALTER TABLE "match" ADD "next_match_win" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "next_match_lose" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "winner" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "team1Id" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "team2Id" integer`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'player', 'guest')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'player'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_35deee50e58a815bec24d4876ef" FOREIGN KEY ("team1Id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_b74ce0e545c690e8f690f761115" FOREIGN KEY ("team2Id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "set" ADD CONSTRAINT "FK_441d9ee8ea5058281bf248afbd3" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "set" DROP CONSTRAINT "FK_441d9ee8ea5058281bf248afbd3"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_b74ce0e545c690e8f690f761115"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_35deee50e58a815bec24d4876ef"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'player', 'guest')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'player'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "team2Id"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "team1Id"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "winner"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "next_match_lose"`);
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "next_match_win"`);
        await queryRunner.query(`ALTER TABLE "match" ADD "teamBId" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "teamAId" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "status" character varying NOT NULL DEFAULT 'scheduled'`);
        await queryRunner.query(`ALTER TABLE "match" ADD "matchDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "match" ADD "scoreB" integer`);
        await queryRunner.query(`ALTER TABLE "match" ADD "scoreA" integer`);
        await queryRunner.query(`DROP TABLE "set"`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_954f8d7997e49ee77fb7bd84062" FOREIGN KEY ("teamBId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_ed5f9ae2f22492649e603c01e3c" FOREIGN KEY ("teamAId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
