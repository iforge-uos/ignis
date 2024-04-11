import {USER_EMAIL_DOMAIN} from "@/config/constants.ts";
import axiosInstance from "@/api/axiosInstance";
import { User } from "@ignis/types/users";

export type LoginResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
};

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
    const response = await axiosInstance.post("/authentication/ldap-login", {
        username,
        password,
    });
    const user = response.data.user;
    user.email = `${user.email}@${USER_EMAIL_DOMAIN}`;
    return response.data;
}
