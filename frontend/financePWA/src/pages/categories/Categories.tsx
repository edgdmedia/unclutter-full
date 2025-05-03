
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
  const { categories, fetchCategories } = useFinance();
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

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsDialogOpen(true);
  };

  const handleAddSubcategory = (parentId: string) => {
    setParentCategory(parentId);
    setIsAddDialogOpen(true);
  };

  const handleSaveCategory = async (category: Category) => {
    setIsLoading(true);
    try {
      const categoryData = {
        ...category,
        parent_id: parentCategory
      };
      
      if (editingCategory && editingCategory.id) {
        // Update existing category
        await categoriesApi.updateCategory(editingCategory.id, categoryData);
        toast.success("Category updated successfully!");
      } else {
        // Create new category
        await categoriesApi.createCategory(categoryData);
        toast.success("Category created successfully!");
      }
      // Refresh categories list
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error("Failed to save category");
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
      try {
        // Check if it's a global category
        if (categoriesApi.isGlobalCategory(categoryToDelete)) {
          toast.error("Cannot delete global categories");
          return;
        }
        
        await categoriesApi.deleteCategory(categoryToDelete.id);
        toast.success(`Category "${categoryToDelete.name}" deleted successfully!`);
        // Refresh categories list
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error("Failed to delete category");
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
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 font-medium py-2 px-3 text-sm border-b">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-5">Description</div>
                      <div className="col-span-1">Usage</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {filteredCategories.map(category => (
                      <div 
                        key={category.id} 
                        className="grid grid-cols-12 items-center py-2 px-3 text-sm hover:bg-muted/50 rounded-md cursor-pointer"
                        onClick={() => handleViewCategory(category)}
                      >
                        <div className="col-span-5 font-medium">{category.name}</div>
                        <div className="col-span-5 text-muted-foreground truncate">{category.description || '-'}</div>
                        <div className="col-span-1">{category.usageCount}</div>
                        <div className="col-span-1 flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          {!categoriesApi.isGlobalCategory(category) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditCategory(category)}
                                disabled={isLoading}
                                title="Edit category"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteCategory(category)}
                                disabled={isLoading}
                                title="Delete category"
                              >
                                <Trash size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
