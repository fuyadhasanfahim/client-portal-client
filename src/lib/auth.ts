import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConfig from './dbConfig';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/user.model';
import { nanoid } from 'nanoid';
import { ensureSupportConversation } from './auth-helper';

const isProduction = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
    cookies: {
        sessionToken: {
            name: isProduction
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: isProduction ? 'none' : 'lax',
                path: '/',
                secure: isProduction,
                domain: isProduction ? '.webbriks.com' : undefined,
            },
        },
    },

    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'Enter your email',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Enter your password',
                },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error(
                        'Invalid credentials! Please enter a valid email or password.'
                    );
                }

                try {
                    await dbConfig();

                    const user = await UserModel.findOne({
                        email: credentials.email,
                    });

                    if (!user) {
                        throw new Error(
                            'Invalid credentials! Please enter a valid email or password.'
                        );
                    } else if (user.provider !== 'credentials') {
                        throw new Error(
                            'Invalid credentials! Please use Google to sign in.'
                        );
                    }

                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    if (!isValid) {
                        throw new Error('Invalid password.');
                    }

                    // Return enough info for the first jwt() run to hydrate the token quickly.
                    return {
                        id: user.userID,
                        role: user.role!,
                        // map DB ownerID -> JWT ownerUserID (team member marker)
                        ownerUserID: (user as any).ownerID ?? null,
                        // team permissions object if present on user doc
                        permissions: (user as any).permissions ?? {},
                    } as any;
                } catch (error) {
                    throw new Error(
                        (error as Error).message ||
                            'An error occurred while authenticating.'
                    );
                }
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async jwt({ token, user, account }) {
            // On sign-in (both credentials and Google), set expirations + lastLogin
            if (user && account) {
                const isRememberMe =
                    account?.type === 'credentials' &&
                    account?.providerAccountId === 'rememberMe';

                const expiresIn = isRememberMe
                    ? 365 * 24 * 60 * 60
                    : 24 * 60 * 60;

                await dbConfig();
                await UserModel.findOneAndUpdate(
                    { userID: (user as any).id },
                    { lastLogin: new Date() }
                );

                const now = Math.floor(Date.now() / 1000);
                token.exp = now + expiresIn;
            }

            // Always ensure token has up-to-date role/ownerUserID/permissions from DB
            // Prefer 'user' payload if present (first sign-in), otherwise load from DB by token.id/email.
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role ?? token.role ?? 'user';
                token.ownerUserID =
                    (user as any).ownerUserID ?? token.ownerUserID ?? null;
                token.permissions =
                    (user as any).permissions ?? token.permissions ?? {};
            }

            // If still missing some fields, rehydrate from DB by userID (token.id)
            if (
                !token.role ||
                token.ownerUserID === undefined ||
                !token.permissions
            ) {
                try {
                    await dbConfig();
                    const dbUser =
                        token.id &&
                        (await UserModel.findOne({ userID: token.id }).lean());
                    if (dbUser) {
                        token.role =
                            (dbUser as any).role ?? token.role ?? 'user';
                        token.ownerUserID = (dbUser as any).ownerID ?? null;
                        token.permissions = (dbUser as any).permissions ?? {};
                    }
                } catch {
                    // ignore DB failures here; token just won't have enriched fields
                }
            }

            if (account) {
                token.accessToken =
                    (account as any).access_token || (token as any).accessToken;
                (token as any).idToken =
                    (account as any).id_token || (token as any).idToken;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = (token.role as string) ?? 'user';
                (session.user as any).ownerUserID =
                    (token as any).ownerUserID ?? null;
                (session.user as any).permissions =
                    (token as any).permissions ?? {};
            }

            (session as any).accessToken = (token as any).accessToken as string;
            return session;
        },

        async signIn({ account, user }) {
            await dbConfig();

            if (account?.provider === 'google') {
                const existingUser = await UserModel.findOne({
                    email: user?.email,
                });

                if (existingUser?.provider === 'credentials') {
                    throw new Error(
                        'Invalid credentials! Please use credentials to sign in.'
                    );
                } else if (!existingUser) {
                    const newUser = await UserModel.create({
                        userID: `WBU${nanoid(10).toUpperCase()}`,
                        name: user?.name,
                        email: user?.email,
                        username: user?.email?.split('@')[0],
                        password: '',
                        provider: 'google',
                        googleId: user?.id?.toString(),
                        isEmailVerified: true,
                        image: user?.image,
                        role: 'user',
                        // ownerID: null, // default for primary accounts
                        // permissions: {}, // optional default
                    });

                    // Expose the app-specific id for jwt() step
                    (user as any).id = newUser.userID;

                    await ensureSupportConversation(newUser.userID);

                    return true;
                }

                // Existing Google user
                (user as any).id = existingUser.userID;

                await ensureSupportConversation(existingUser.userID);

                return true;
            }

            // Credentials provider signIn
            if (account?.provider === 'credentials' && (user as any)?.id) {
                await ensureSupportConversation((user as any).id);
            }

            return true;
        },
    },

    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },

    session: {
        strategy: 'jwt',
        maxAge: 365 * 24 * 60 * 60,
    },

    secret: process.env.AUTH_SECRET!,
};
