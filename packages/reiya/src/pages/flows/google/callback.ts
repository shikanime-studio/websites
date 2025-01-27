import { createAccountFromGoogleFlow, getAccountFromGoogleFlow } from "../../../lib/account";
import { createSession, getRedirectTo as getRedirectTo } from "../../../lib/session";
import { ZodError } from "zod";
import type { APIContext } from "astro";
import { getSessionTokenInfo, OAuth2Error } from "../../../lib/google";

export async function GET(context: APIContext){
	let tokenInfo;
    try {
		tokenInfo = await getSessionTokenInfo(context);
	} catch (error) {
		if (error instanceof ZodError) {
			return new Response("Invalid session token", { status: 400 });
        } else if (error instanceof OAuth2Error) {
            return new Response("Invalid session token", { status: 401 });
		}
		throw error;
	}
    const redirectTo = getRedirectTo(context)
	const existingAccount =await getAccountFromGoogleFlow(tokenInfo.sub);
	if (existingAccount) {
        await createSession(context, existingAccount.id);
        return context.redirect(redirectTo || "/");
	}
	const account = await createAccountFromGoogleFlow(tokenInfo);
    await createSession(context, account.id);
       return context.redirect(redirectTo || "/");
}