import { DataSource } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'postgres',
  entities: [path.join(__dirname, '**/*.entity.{js,ts}')],
  migrations: [path.join(__dirname, 'migrations/*.{js,ts}')],
  migrationsTableName: 'migrations_history',
  synchronize: false,
  logging: true,
});

// ✅ Use ES module export
export default AppDataSource;
