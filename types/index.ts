export type Item = {
    id: number;
    user_id: string;
    name: string;
    quantity: string | null;
    checked: boolean;
    category_id: number | null;
    recipe_id: number | null;
    list_id: number | null;
    created_at: string;
};

export type List = {
    id: number;
    user_id: string;
    name: string;
    is_template: boolean;
    source_template_id: number | null;
    created_at: string;
};