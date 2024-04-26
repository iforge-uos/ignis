import axiosInstance from "@/api/axiosInstance.ts";
import { FinaliseSignInDto, User } from "@ignis/types/sign_in.ts";

export interface GetSignInProps {
  locationName: string;
  uCardNumber: number;
  signal: AbortSignal;
}

export const GetSignIn = async ({ locationName, uCardNumber, signal }: GetSignInProps): Promise<User> => {
  try {
    const { data } = await axiosInstance.get(`/location/${locationName}/sign-in/${uCardNumber}`, { signal: signal });
    return data;
  } catch (error) {
    console.error("An error occurred while Getting Sign In:", error);
    throw error;
  }
};

export interface PostSignInProps {
  signal: AbortSignal;
  locationName: string;
  uCardNumber: number;
  postBody: FinaliseSignInDto;
}

export const PostSignIn = async ({ locationName, uCardNumber, signal, postBody }: PostSignInProps): Promise<string> => {
  try {
    const { data } = await axiosInstance.post(`/location/${locationName}/sign-in/${uCardNumber}`, postBody, {
      signal: signal,
    });
    return data;
  } catch (error) {
    console.error("An error occurred while Posting to Sign In:", error);
    throw error;
  }
};

export interface PostSignOutProps {
  signal: AbortSignal;
  locationName: string;
  uCardNumber: number;
}

export const PostSignOut = async ({ locationName, uCardNumber, signal }: PostSignOutProps): Promise<string> => {
  try {
    const { data } = await axiosInstance.post(
      `/location/${locationName}/sign-out/${uCardNumber}`,
      {},
      { signal: signal },
    );
    return data;
  } catch (error) {
    console.error("An error occurred while Posting to Sign Out:", error);
    throw error;
  }
};

export interface PostRegisterProps {
  signal: AbortSignal;
  locationName: string;
  uCardNumber: string;
}

export const PostRegister = async ({ locationName, uCardNumber, signal }: PostRegisterProps): Promise<string> => {
  try {
    const { data } = await axiosInstance.post(
      `/location/${locationName}/register-user`,
      {
        ucard_number: uCardNumber,
      },
      { signal: signal },
    );
    return data;
  } catch (error) {
    console.error("An error occurred while Posting to Register Endpoint:", error);
    throw error;
  }
};
