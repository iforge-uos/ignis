export interface GoogleUser {
    provider: string;
    sub: string;
    id: string;
    displayName: string;
    name: Name;
    given_name: string;
    family_name: string;
    email_verified: boolean;
    verified: boolean;
    language: string;
    locale: any;
    email: string;
    emails: Email[];
    photos: Photo[];
    picture: string;
}

type Name = {
    givenName: string;
    familyName: string;
}

interface Email {
    value: string;
    type: string;
}

interface Photo {
    value: string;
    type: string;
}
