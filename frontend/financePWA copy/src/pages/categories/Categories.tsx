
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import CategoryDialog from '@/components/categories/CategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { toast } from '@/components/ui/sonner';

type CategoryType = 'income' | 'expense' | 'account' | 'tag';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  parent?: string;
  usageCount: number;
}

const Categories: React.FC = () => {
  const { categories } = useFinance();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCategory = (category: Category) => {
    toast.success("Category saved successfully!");
    setIsAddDialogOpen(false);
    setEditingCategory(null);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      toast.success(`Category "${categoryToDelete.name}" deleted successfully!`);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
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
                      <div key={category.id} className="grid grid-cols-12 items-center py-2 px-3 text-sm hover:bg-muted/50 rounded-md">
                        <div className="col-span-5 font-medium">{category.name}</div>
                        <div className="col-span-5 text-muted-foreground truncate">{category.description || '-'}</div>
                        <div className="col-span-1">{category.usageCount}</div>
                        <div className="col-span-1 flex justify-end space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash size={16} />
                          </Button>
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
        onOpenChange={setIsAddDialogOpen}
        initialCategory={editingCategory}
        categoryType={activeTab}
        onSave={handleSaveCategory}
      />

      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={categoryToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Categories;
