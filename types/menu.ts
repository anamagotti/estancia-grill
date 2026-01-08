export type MenuCategory = 'Buffet' | 'Sushi' | 'Sobremesa' | 'Churrasco';
export type MenuSubCategory = 'Pré-assada' | 'In natura' | 'Sobra';

export interface MenuItem {
  id: string;
  date: string;
  category: MenuCategory;
  subcategory?: MenuSubCategory;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemData {
  name: string;
  description: string;
  image_url: string;
}

export interface MenuFormData {
  date: string;
  category: MenuCategory;
  subcategory?: MenuSubCategory;
  items: MenuItemData[];
}
