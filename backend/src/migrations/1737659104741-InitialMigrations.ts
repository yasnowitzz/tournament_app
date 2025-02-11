import { MigrationInterface, QueryRunner } from "typeorm";

export class MyMigrationName1737659104741 implements MigrationInterface {
    name = 'MyMigrationName1737659104741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "ownerId" integer, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'player', 'guest')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'player', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tournament" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "format" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_449f912ba2b62be003f0c22e767" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "match" ("id" SERIAL NOT NULL, "scoreA" integer, "scoreB" integer, "matchDate" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'scheduled', "teamAId" integer, "teamBId" integer, "tournamentId" integer, CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_49a22109d0b97611c07768e37f1" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_ed5f9ae2f22492649e603c01e3c" FOREIGN KEY ("teamAId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_954f8d7997e49ee77fb7bd84062" FOREIGN KEY ("teamBId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_b096f0c0ca94610b3e77128500c" FOREIGN KEY ("tournamentId") REFERENCES "tournament"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_b096f0c0ca94610b3e77128500c"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_954f8d7997e49ee77fb7bd84062"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_ed5f9ae2f22492649e603c01e3c"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_49a22109d0b97611c07768e37f1"`);
        await queryRunner.query(`DROP TABLE "match"`);
        await queryRunner.query(`DROP TABLE "tournament"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
