export const USER_EMAIL_DOMAIN = "sheffield.ac.uk";

export const SIGN_IN_REASONS_STORAGE_KEY = "sign_in_reasons";

export const iForgeEpoch = new Date(Date.UTC(2015, 1, 1));

export const locationNameToCSSName = (location: string): string => {
    switch (location.toLowerCase()) {
        case 'mainspace':
            return 'mainspace';
        case 'heartspace':
            return 'heartspace';
        case 'george_porter':
            return 'george-porter';
        default:
            return 'muted'; 
    }
};
