import {
  Auth,
  BuiltinOAuthProviderNames,
  builtinOAuthProviderNames,
  InvalidDataError,
  OAuthProviderFailureError,
  PKCEError,
} from "@gel/auth-core";
import { createMiddleware, createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, getRequestUrl, setCookie } from "@tanstack/react-start/server";
import { Client } from "gel";
// import jwt from "jsonwebtoken";
import client from "@/db";
import { DEFAULT_AUTH_COOKIE, DEFAULT_PKCE_COOKIE } from "@/lib/constants";


interface GoogleUser {
  family_name: string;
  sub: string;
  picture: string;
  email_verified: boolean;
  given_name: string;
  email: string;
  name: string;
}

export async function getUserProfile(providerToken: string): Promise<GoogleUser> {
  const response = await fetch(" https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${providerToken}`,
      Accept: "application/json",
    },
  });
  return response.json();
}


// export function verifyJWT(token: string) {
//   try {
//     return jwt.verify(
//       token,
//       JWT_KEY,
//       { complete: true, ignoreExpiration: false },
//     );
//   } catch (_) {
//     return undefined;
//   }
// }

export interface TanStackAuthOptions {
  baseUrl: string;
  routerPath?: string;
  authCookieName?: string;
  pkceVerifierCookieName?: string;
}

export interface GelAuth {
  options: Required<TanStackAuthOptions>;
  core: Promise<Auth>;
  isSecure: boolean;
  client: Client;
}

export interface GelAuthContext {
  __gel_auth: GelAuth;
}

const getUrl = createServerOnlyFn((auth: GelAuth) => {
  return new URL(auth.options.routerPath ?? "", auth.options.baseUrl).toString();
});

const createVerifierCookie = createServerOnlyFn((auth: GelAuth, verifier: string) => {
  const {
    options: { pkceVerifierCookieName },
    isSecure,
  } = auth;

  const expires = new Date(Date.now() + 1000 * 60 * 24 * 7); // In 7 days
  setCookie(pkceVerifierCookieName, verifier, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    expires,
    secure: isSecure,
  });
});

const getVerifier = createServerOnlyFn((auth: GelAuth) => {
  return getCookie(auth.options.pkceVerifierCookieName) || getCookie(DEFAULT_PKCE_COOKIE);
});

const deleteVerifier = createServerOnlyFn((auth: GelAuth) => {
  deleteCookie(auth.options.pkceVerifierCookieName);
  deleteCookie(DEFAULT_PKCE_COOKIE);
});

const createAuthCookie = createServerOnlyFn((auth: GelAuth, authToken: string) => {
  const {
    options: { authCookieName },
    isSecure,
  } = auth;

  const expires = Auth.getTokenExpiration(authToken);

  setCookie(authCookieName, authToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    expires: expires ?? undefined,
    secure: isSecure,
  });
});

const clearAuthCookie = createServerOnlyFn((auth: GelAuth) => {
  deleteCookie(auth.options.authCookieName, {
    httpOnly: true,
    sameSite: "strict",
  });
  deleteCookie(DEFAULT_AUTH_COOKIE, {
    httpOnly: true,
    sameSite: "strict",
  });
});

const auth = Auth.create(client as any);

export const authMiddleware = createMiddleware().server(({ context, next }) => {
  const authCookieName = DEFAULT_AUTH_COOKIE;
  const pkceVerifierCookieName = DEFAULT_PKCE_COOKIE;

  // Get the base URL dynamically from the request
  const requestUrl = getRequestUrl();
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}/api/auth`;

  const fullOptions: Required<TanStackAuthOptions> = {
    baseUrl,
    routerPath: "/api/auth/complete",
    authCookieName,
    pkceVerifierCookieName,
  };
  return next({
    context: {
      ...(context ?? {}),
      __gel_auth: {
        core: auth,
        options: fullOptions,
        isSecure: requestUrl.protocol === "https:",
        client: client as any,
      } as GelAuth,
    },
  });
});

const authedServerFn = createServerFn().middleware([authMiddleware]);

const getProvidersInfo = authedServerFn()
  .inputValidator((data: string) => data)
  .handler(async ({ context: { __gel_auth: auth } }) => {
    return (await auth.core).getProvidersInfo();
  });

export const startOAuth = authedServerFn()
  .inputValidator(({ providerName }: { providerName: BuiltinOAuthProviderNames }) => {
    if (!builtinOAuthProviderNames.includes(providerName)) {
      throw new InvalidDataError(`invalid provider_name: ${providerName}`);
    }
    return { providerName };
  })
  .handler(async ({ data: { providerName }, context: { __gel_auth: auth } }) => {
    const pkceSession = await auth.core.then((core: Auth) => core.createPKCESession());
    createVerifierCookie(auth, pkceSession.verifier);
    const url = getUrl(auth);
    return pkceSession.getOAuthUrl(providerName, url, `${url}?isSignUp=true`);
    // return Response.redirect(ret);  // doesn't work here cause of CORS
  });

export const handleCallback = authedServerFn()
  .inputValidator(
    (data: Record<"error" | "code" | "error_description" | "provider" | "isSignUp", string | undefined>) => {
      const error = data.error;
      const code = data.code;
      const error_description = data.error_description;
      const provider = data.provider;
      const isSignUp = data.isSignUp === "true";

      if (error) {
        throw new OAuthProviderFailureError(error + (error_description ? `: ${error_description}` : ""));
      }

      if (!code) {
        throw new PKCEError("no pkce code in response");
      }

      return {
        provider: provider as BuiltinOAuthProviderNames,
        isSignUp,
        code,
      };
    },
  )
  .handler(async ({ data: { provider, code, isSignUp }, context: { __gel_auth: auth } }) => {
    const verifier = getVerifier(auth);
    if (!verifier) {
      throw new PKCEError("no pkce verifier cookie found");
    }
    const tokenData = await (await auth.core).getToken(code, verifier);
    createAuthCookie(auth, tokenData.auth_token);
    deleteVerifier(auth);

    return {
      success: true,
      tokenData,
      isSignUp,
      provider,
    };
  });

export const handleSignout = authedServerFn().handler(async ({ context: { __gel_auth: auth } }) => {
  clearAuthCookie(auth);
  return { success: true };
});

export const withSession = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context: { __gel_auth: auth } }) => {
    const authCookie = getCookie(auth.options.authCookieName) || getCookie(DEFAULT_AUTH_COOKIE);

    // const jwt = verifyJWT(authCookie!);
    // if (!jwt) return new Response("Unauthorized", { status: 401 })

    return next({
      context: { session: { client: auth.client.withGlobals({ "ext::auth::client_token": authCookie }) } },
    });
  });

export const createServerFnWithSession = createServerFn().middleware([withSession]);
