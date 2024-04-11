import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import md5 from "md5"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getGravatarUrl(email: string, size = 64) {
    const emailHash = md5(email.trim().toLowerCase())
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon&r=pg&d=404`
}

export function useUser() {
    return useSelector((state: RootState) => state.user.user);
}

export function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (word) => {
        return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    });
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
