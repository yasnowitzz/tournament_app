import { MigrationInterface, QueryRunner } from "typeorm";

export class Newfunctionalities1738268464087 implements MigrationInterface {
    name = 'Newfunctionalities1738268464087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_49a22109d0b97611c07768e37f1"`);
        await queryRunner.query(`CREATE TABLE "tournament_teams" ("tournamentId" integer NOT NULL, "teamId" integer NOT NULL, CONSTRAINT "PK_68a40c8bc6d97ea97fb6cb9fc62" PRIMARY KEY ("tournamentId", "teamId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b9daa69eed6d5bb7c60d9d7c8d" ON "tournament_teams" ("tournamentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5bc1f73a6b67c670ee481e22ef" ON "tournament_teams" ("teamId") `);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "team" ADD "player1Id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" ADD "player2Id" integer NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'player', 'guest')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'player'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_e242837b8037a66697d8de897d6" FOREIGN KEY ("player1Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_f070a9a5b0df3fea883b8c9aef1" FOREIGN KEY ("player2Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_teams" ADD CONSTRAINT "FK_b9daa69eed6d5bb7c60d9d7c8da" FOREIGN KEY ("tournamentId") REFERENCES "tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tournament_teams" ADD CONSTRAINT "FK_5bc1f73a6b67c670ee481e22ef4" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tournament_teams" DROP CONSTRAINT "FK_5bc1f73a6b67c670ee481e22ef4"`);
        await queryRunner.query(`ALTER TABLE "tournament_teams" DROP CONSTRAINT "FK_b9daa69eed6d5bb7c60d9d7c8da"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_f070a9a5b0df3fea883b8c9aef1"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_e242837b8037a66697d8de897d6"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'player', 'guest')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'player'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "player2Id"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "player1Id"`);
        await queryRunner.query(`ALTER TABLE "team" ADD "ownerId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5bc1f73a6b67c670ee481e22ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b9daa69eed6d5bb7c60d9d7c8d"`);
        await queryRunner.query(`DROP TABLE "tournament_teams"`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_49a22109d0b97611c07768e37f1" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
