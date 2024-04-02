import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { createActor } from "../../../../declarations/ugd_backend";
class AuthService{
    private static instance: AuthService;
    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private client?: AuthClient;

    public async initialize(): Promise<void> {
      this.client = await AuthClient.create();
    }

    public async isAuthenticated(): Promise<boolean> {
        if (!this.client) {
          await this.initialize();
        }
        return this.client?.isAuthenticated() ?? false;
    }

    public async getUID(): Promise<string | null> {
        if (!this.client) await this.initialize();

        if (!await this.isAuthenticated()) return null;

        try {
            const identity = this.client!.getIdentity();
            const agent = new HttpAgent({ identity });
            const actor = createActor(process.env.CANISTER_ID_UGD_BACKEND!, { agent });

            return await actor.whoami();
        } catch (error) {
            console.error("Error getting UID", error);
            return null;
        }
    }


    public async login(): Promise<string | null> {
        try {
            if (!this.client) {
                await this.initialize(); // Ensure there's an initialize method that creates the AuthClient instance
            }

            await new Promise<void>((resolve, reject) => {
                this.client!.login({
                    identityProvider: process.env.DFX_NETWORK === "ic" ? "https://identity.ic0.app" : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`,
                    // maxTimeToLive: BigInt (7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
                    windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
                    onSuccess: resolve,
                    onError: () => reject(new Error("Could not authenticate")),
                });
            });

            const identity = this.client!.getIdentity();
            const agent = new HttpAgent({ identity });
            const actor = createActor(process.env.CANISTER_ID_UGD_BACKEND!, { agent });
            return await actor.whoami();
        } catch (error) {
            console.error("Login failed", error);
            return null;
        }
    }


    public async logout(): Promise<void> {
        if (!this.client) {
          await this.initialize();
        }
        await this.client!.logout();
    }
}

export default AuthService.getInstance();
