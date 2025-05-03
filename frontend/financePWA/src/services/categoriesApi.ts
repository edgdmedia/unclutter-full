import { api } from './apiClient';

export interface Category {
  id: string;
  profile_id: string;
  name: string;
  type: string; // 'income', 'expense', 'account_type', 'tag'
  parent_id: string | null;
  description?: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

// Get all categories
export const getCategories = async () => {
  try {
    console.log('Fetching categories from API');
    const res = await api.get('/categories');
    console.log('Categories response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Search categories
export const searchCategories = async (searchTerm: string) => {
  try {
    console.log(`Searching categories with term: ${searchTerm}`);
    const res = await api.get(`/categories/search`, {
      params: { search: searchTerm }
    });
    console.log('Search categories response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};

// Get categories by type
export const getCategoriesByType = async (type: 'income' | 'expense' | 'account_type' | 'tag') => {
  try {
    console.log(`Fetching categories of type: ${type}`);
    const res = await api.get('/categories');
    
    // Filter categories by type on the client side since the API doesn't support filtering
    if (res.data && res.data.data) {
      const filteredData = res.data.data.filter((category: Category) => category.type === type);
      return { ...res.data, data: filteredData };
    }
    
    return res.data;
  } catch (error) {
    console.error(`Error fetching categories by type ${type}:`, error);
    throw error;
  }
};

// Get category by ID
export const getCategory = async (id: string) => {
  try {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

// Create a new category
export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense' | 'account_type' | 'tag';
  parent_id?: string | null;
  description?: string;
  is_active?: string;
}

export const createCategory = async (data: CreateCategoryData) => {
  try {
    // Ensure is_active is set if not provided
    const categoryData = {
      ...data,
      is_active: data.is_active || '1'
    };
    
    console.log('Creating category with data:', categoryData);
    const res = await api.post('/categories', categoryData);
    console.log('Create category response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (id: string, data: Partial<CreateCategoryData>) => {
  try {
    console.log(`Updating category ${id} with data:`, data);
    
    // First check if the category can be updated (profile_id != 0)
    const categoryRes = await getCategory(id);
    const category = categoryRes.data;
    
    if (category.profile_id === '0') {
      console.warn(`Cannot update global category with id ${id}`);
      throw new Error('Cannot update global category');
    }
    
    const res = await api.put(`/categories/${id}`, data);
    console.log('Update category response:', res.data);
    return res.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: string) => {
  try {
    // First check if the category can be deleted (profile_id != 0)
    const categoryRes = await getCategory(id);
    const category = categoryRes.data;
    
    if (category.profile_id === '0') {
      console.warn(`Cannot delete global category with id ${id}`);
      throw new Error('Cannot delete global category');
    }
    
    console.log(`Deleting category ${id}`);
    const res = await api.delete(`/categories/${id}`);
    console.log('Delete category response:', res.data);
    return res.data;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};

// Check if a category is global (cannot be updated or deleted)
export const isGlobalCategory = (category: Category): boolean => {
  return category.profile_id === '0';
};

// Get category details including transactions and balance
export const getCategoryDetails = async (id: string) => {
  try {
    console.log(`Fetching details for category ${id}`);
    const res = await api.get(`/categories/${id}/details`);
    console.log('Category details response:', res.data);
    return res.data;
  } catch (error) {
    console.error(`Error fetching details for category ${id}:`, error);
    throw error;
  }
};
