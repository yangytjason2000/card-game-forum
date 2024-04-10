import { NextAuthOptions, getServerSession } from "next-auth";
import { db } from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google"
import {nanoid} from "nanoid";
import { UserType } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/sign-in'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks: {
        async session({token, session}) {
            if(token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
                session.user.username = token.username
                session.user.type = token.type as UserType | undefined
            }

            return session;
        },
        async jwt({token, user}) {
            const dbUser = await db.user.findFirst({
                where: {
                    email: token.email
                },
            })

            if (!dbUser) {
                token.id = user!.id;
                return token;
            }

            if (!dbUser.username) {
                await db.user.update({
                    where: {
                        id: dbUser.id,
                    },
                    data: {
                        username: nanoid(10),
                    },
                })
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
                username: dbUser.username,
                type: dbUser.type,
            }
        },
        redirect() {
            return '/'
        }
    },
}

export const getAuthSession = () => getServerSession(authOptions)