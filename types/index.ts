export type Item = {
    id: number;
    user_id: string;
    name: string;
    quantity: string | null;
    checked: boolean;
    category_id: number | null;
    created_at: string;
};