import { SeederModule } from "./seeder/seeder.module";
import { SeederService } from "./seeder/seeder.service";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(SeederService);
  await seeder.seedDatabase();
  await app.close();
}

bootstrap();
