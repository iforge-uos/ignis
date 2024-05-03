import Cookies from 'js-cookie';

const setCookie = (name: string, value: string, expires?: number) => {
    Cookies.set(name, value, {expires: expires || 1, secure: true, sameSite: 'Strict'});
};

const getCookie = (name: string) => {
    return Cookies.get(name);
};

const removeCookie = (name: string) => {
    Cookies.remove(name);
};

export {setCookie, getCookie, removeCookie};
