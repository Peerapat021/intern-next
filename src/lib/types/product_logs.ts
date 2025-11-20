import { DateTime } from "next-auth/providers/kakao";

export type ProductLog = {
    id: number;
    product_id: string;
    action: string;
    old_value: JSON;
    new_value: JSON;
    changed_by: number;
    create_at_log: DateTime;
};

