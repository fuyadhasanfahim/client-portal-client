import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConfig from './dbConfig';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/user.model';

export const authOptions: NextAuthOptions = {
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
                        throw new Error('No user found.');
                    }

                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    if (!isValid) {
                        throw new Error('Invalid password.');
                    }

                    return {
                        id: user._id!,
                    };
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }

            return session;
        },

        async signIn({ account, user }) {
            if (account?.provider === 'google') {
                await dbConfig();

                const existingUser = await UserModel.findOne({
                    email: user?.email,
                });

                if (!existingUser) {
                    await UserModel.create({
                        name: user?.name,
                        email: user?.email,
                        username: user?.email?.split('@')[0],
                        password: '',
                        provider: 'google',
                        googleId: user?.id,
                        isEmailVerified: true,
                        profileImage: user?.image,
                    });
                }
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
