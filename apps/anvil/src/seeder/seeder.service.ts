import { EdgeDBService } from "@/edgedb/edgedb.service";
import { seedTeams } from "@/seeder/seeds/team.seed";
import { seedTraining } from "@/seeder/seeds/training.seed";
import { Injectable } from "@nestjs/common";
import { seedQueue } from "./seeds/queue.seed";
import { seedRoles } from "./seeds/roles.seed";
import { seedSignInReasons } from "./seeds/sign-in-reasons.seed";
import { seedUsers } from "./seeds/users.seed";

@Injectable()
export class SeederService {
  constructor(private readonly dbService: EdgeDBService) {}

  async seedDatabase() {
    // Seed roles
    await seedRoles(this.dbService);

    // Seed the queue locations
    await seedQueue(this.dbService);

    await seedSignInReasons(this.dbService);

    await seedTeams(this.dbService);

    await seedUsers(this.dbService);

    await seedTraining(this.dbService);
  }
}
