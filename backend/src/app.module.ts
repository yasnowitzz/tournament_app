import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TournamentModule } from './tournament/tournament.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { MatchModule } from './match/match.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'postgres',
      entities: [__dirname + '/**/*.entity.{ts,js}'],
      synchronize: false, // Migrations should be used instead of `synchronize: true`
      migrations: [__dirname + '/migrations/*.{ts,js}'],
      migrationsTableName: 'migrations_history',
      migrationsRun: true, // Automatically run migrations on app startup
      autoLoadEntities: true,
    }),
    AuthModule,
    UserModule,
    TournamentModule,
    TeamModule,
    MatchModule,
    NotificationModule,
  ],
})
export class AppModule {}
