import { Injectable, OnModuleInit } from '@nestjs/common';
import {google, people_v1} from "googleapis";
import {Auth} from "googleapis"


@Injectable()
export class GoogleService implements OnModuleInit {
    private auth!: typeof Auth.auth;
    private people!: people_v1.Resource$People;

    async onModuleInit() {
        this.auth = new Auth.GoogleAuth(
            {
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!,
                },
                // Scopes can be specified either as an array or as a single, space-delimited string.
                scopes: [
                  'https://www.googleapis.com/auth/directory.readonly',
                ],

            }
        )
        const authClient: any = await this.auth.getClient();
        this.people = google.people({version: "v1", auth: authClient}).people;
    }

    async autocompleteEmails(email: string) {
        // TODO use fuse?
        const r = await this.people.searchDirectoryPeople({
            query: email,
            readMask: "emailAddresses",
            sources: ["DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"],
            pageSize: 10,
        });
        return r.data.people?.flatMap(person => person.emailAddresses!.map(email => email.value!)).filter(email => email) || []  // include id as well so we can register them nicely
    }

    async userDepartment(id: string) {
        const r = await this.people.get({
            resourceName: `people/${id}`,
        });
        return r.data?.organizations?.[0].department || ""
    }

    async promoteUserToRep(email: string) {
        throw new Error("not implemented")  // TODO: also add to group and drive, should be called at the end of the promoteToRep
    }
}
