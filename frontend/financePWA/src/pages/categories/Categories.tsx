import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Eye, FolderPlus } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import CategoryDialog from '@/components/categories/CategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import CategoryDetailsDialog from '@/components/categories/CategoryDetailsDialog';
import { toast } from '@/components/ui/sonner';
import * as categoriesApi from '@/services/categoriesApi';
import CategoryList from '@/components/categories/CategoryList';

type CategoryType = 'income' | 'expense' | 'account' | 'tag';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  parent_id?: string | null;
  usageCount: number;
  profile_id?: string;
  is_active?: string;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
}

const Categories: React.FC = () => {
  const { categories, fetchCategories, setCategories } = useFinance();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Force a refresh of categories when component mounts
  useEffect(() => {
    console.log('Categories component mounted, refreshing categories');
    fetchCategories();
  }, []);

  const handleEditCategory = (category: Category) => {
    if (categoriesApi.isGlobalCategory(category)) {
      toast.error("Global categories cannot be edited");
      return;
    }
    setEditingCategory(category);
    setIsAddDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    if (categoriesApi.isGlobalCategory(category)) {
      toast.error("Global categories cannot be deleted");
      return;
    }
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCategoryClick = async (category: Category) => {
    // Open dialog immediately with existing info
    setSelectedCategory(category);
    setIsDetailsDialogOpen(true);

    // Fetch latest details in the background
    try {
      const response = await categoriesApi.getCategoryDetails(category.id);
      if (response.success) {
        // Save or update in local DB (use your own dbService or similar)
        // Example: await dbService.saveCategory(response.data);
        // For now, just update selectedCategory with new details
        setSelectedCategory({ ...category, ...response.data });
      }
    } catch (error) {
      // Optionally handle error
      // toast.error('Failed to update category details');
    }
  };

  const handleAddSubcategory = (parentId: string) => {
    setParentCategory(parentId);
    setIsAddDialogOpen(true);
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveCategory = async (category: Category) => {
    setIsLoading(true);
    const originalCategories = [...categories]; // Store original state for potential rollback
    let savedCategory: Category | null = null;

    try {
      const categoryData = {
        ...category,
        parent_id: parentCategory
      };

      if (editingCategory && editingCategory.id) {
        // --- Optimistic Update (Edit) ---
        setCategories(prev => 
          prev.map(cat => 
            cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
          )
        );
        // -------------------------------
        savedCategory = await categoriesApi.updateCategory(editingCategory.id, categoryData);
        toast.success("Category updated successfully!");
      } else {
        // --- Optimistic Add (Placeholder ID) ---
        const tempId = `temp-${Date.now()}`;
        const optimisticCategory = { ...categoryData, id: tempId }; 
        setCategories(prev => [...prev, optimisticCategory]);
        // ------------------------------------
        savedCategory = await categoriesApi.createCategory(categoryData);
        toast.success("Category created successfully!");
        // --- Update UI with Real ID ---
        setCategories(prev => 
          prev.map(cat => 
            cat.id === tempId ? { ...savedCategory, id: savedCategory.id } : cat
          )
        );
        // ---------------------------
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error("Failed to save category");
      // --- Rollback on error ---
      setCategories(originalCategories);
      // -----------------------
    } finally {
      setIsLoading(false);
      setIsAddDialogOpen(false);
      setEditingCategory(null);
      setParentCategory(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      setIsLoading(true);
      const originalCategories = [...categories]; // Store original state for potential rollback
      const categoryIdToDelete = categoryToDelete.id;

      // --- Optimistic Delete ---
      setCategories(prev => prev.filter(cat => cat.id !== categoryIdToDelete));
      // -----------------------
      
      try {
        if (categoriesApi.isGlobalCategory(categoryToDelete)) {
          toast.error("Cannot delete global categories");
          setCategories(originalCategories); // Rollback
          return;
        }

        await categoriesApi.deleteCategory(categoryIdToDelete);
        toast.success(`Category "${categoryToDelete.name}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error("Failed to delete category");
        // --- Rollback on error ---
        setCategories(originalCategories);
        // -----------------------
      } finally {
        setIsLoading(false);
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === activeTab);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Category
        </Button>
      </div>

      <Tabs defaultValue="expense" onValueChange={(value) => setActiveTab(value as CategoryType)}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="account">Accounts</TabsTrigger>
          <TabsTrigger value="tag">Tags</TabsTrigger>
        </TabsList>
        
        {(['expense', 'income', 'account', 'tag'] as CategoryType[]).map(tabValue => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            <Card>
              <CardContent className="p-4">
                {filteredCategories.length > 0 ? (
                  <CategoryList
                    categories={filteredCategories}
                    onCategoryClick={handleCategoryClick}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No {tabValue} categories found</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus size={16} className="mr-1" /> Add {tabValue} Category
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <CategoryDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
            setParentCategory(null);
          }
          setIsAddDialogOpen(open);
        }}
        initialCategory={editingCategory}
        categoryType={activeTab}
        onSave={handleSaveCategory}
        parentId={parentCategory}
      />

      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={categoryToDelete}
        onConfirm={handleConfirmDelete}
      />
      
      <CategoryDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        category={selectedCategory}
        onAddSubcategory={handleAddSubcategory}
      />
    </div>
  );
};

export default Categories;
