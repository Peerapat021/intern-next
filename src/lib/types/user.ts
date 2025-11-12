import { DateTime } from "next-auth/providers/kakao";


export type User = {
    user_id: number;
    username: string;
    password: string;
    role: string;
    created_at_user: string;
};
