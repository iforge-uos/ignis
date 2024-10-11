import axiosInstance from "@/api/axiosInstance.ts";
import { FinaliseSignInDto, LocationName, User } from "@ignis/types/sign_in.ts";

export interface GetSignInProps {
  locationName: LocationName;
  uCardNumber: string;
  signal: AbortSignal;
  params?: { fast: boolean };
}

export const GetSignIn = async ({ locationName, uCardNumber, signal, params }: GetSignInProps): Promise<User> => {
  try {
    const { data } = await axiosInstance.get(`/location/${locationName}/sign-in/${uCardNumber}`, {
      signal: signal,
      timeout: 10_000,
      timeoutErrorMessage: "Timed out waiting for the user's info.",
      params,
    });
    return data;
  } catch (error) {
    console.error("An error occurred while Getting Sign In:", error, params);
    throw error;
  }
};

export interface PostSignInProps {
  signal: AbortSignal;
  locationName: LocationName;
  uCardNumber: string;
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
  locationName: LocationName;
  uCardNumber: string;
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
  locationName: LocationName;
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
