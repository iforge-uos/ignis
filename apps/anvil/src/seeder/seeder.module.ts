import {Module} from "@nestjs/common";
import {SeederService} from "./seeder.service";
import {EdgeDBModule} from "@/edgedb/edgedb.module";

@Module({
    imports: [EdgeDBModule],
    providers: [SeederService],
})
export class SeederModule {
}
