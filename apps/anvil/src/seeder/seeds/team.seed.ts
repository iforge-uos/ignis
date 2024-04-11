import {EdgeDBService} from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import {ConstraintViolationError} from "edgedb";
import {team} from "@dbschema/interfaces";


const teams = [
    {
        name: "IT Team",
        description: "The IT Team",
        tag: "IT",
    },
    {
        name: "3DP Team",
        description: "The 3DP Team",
        tag: "3DP",
    },
    {
        name: "Hardware Team",
        description: "The Hardware Team",
        tag: "HW",
    },
    {
        name: "Publicity Team",
        description: "The Publicity Team",
        tag: "PUB",
    },
    {
        name: "Events Team",
        description: "The Events Team",
        tag: "EVT",
    },
    {
        name: "Relations Team",
        description: "The Relations Team",
        tag: "REL",
    },
    {
        name: "Operations Team",
        description: "The Operations Team",
        tag: "OPS",
    },
    {
        name: "Recruitment & Development Team",
        description: "The Recruitment & Development Team",
        tag: "REC",
    },
    {
        name: "Health & Safety Team",
        description: "The Health & Safety Team",
        tag: "H&S",
    },
    {
        name: "Unsorted Reps",
        description: "Reps who are yet to be on a team",
        tag: "?",
    },
    {
        name: "Future Reps",
        description: "Reps who are yet to become full blown members of the team.",
        tag: "FUT",
    },
    {
        name: "Staff",
        description: "MEE Staff",
        tag: "STAFF",
    },
    {
        name: "Inclusions Team",
        description: "The Inclusions Team",
        tag: "INC",
    },
]

export async function seedTeams(dbService: EdgeDBService) {
    try {
        await dbService.query(
            e.for(e.json_array_unpack(e.json(teams)), ({name, description, tag}) => {
                    return e.insert(e.team.Team, {
                        name: e.cast(e.str, name),
                        description: e.cast(e.str, description),
                        tag: e.cast(e.str, tag),
                    });
                },
            ),
        );
    } catch (e) {
        if (!(e instanceof ConstraintViolationError)) {
            throw e;
        }
    }
}
