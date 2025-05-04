import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Plus, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import * as categoriesApi from '@/services/categoriesApi';
import { Category } from '@/services/categoriesApi';
import { useFinance } from '@/context/FinanceContext';
import { useNavigate } from 'react-router-dom';

interface CategoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onAddSubcategory?: (parentId: string) => void;
}

interface CategoryDetails {
  category: Category;
  balance: number;
  transaction_count: number;
  recent_transactions: any[];
  subcategories: Category[];
}

interface CategoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onAddSubcategory?: (parentId: string) => void;
  onEditCategory?: (category: Category) => void;
}

const CategoryDetailsDialog: React.FC<CategoryDetailsDialogProps> = ({
  open,
  onOpenChange,
  category,
  onAddSubcategory,
  onEditCategory,
}) => {
  const [details, setDetails] = useState<CategoryDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { fetchCategories } = useFinance();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && category) {
      loadCategoryDetails(category.id);
    } else {
      setDetails(null);
      setActiveTab('overview');
    }
  }, [open, category]);

  const loadCategoryDetails = async (categoryId: string) => {
    setLoading(true);
    try {
      const response = await categoriesApi.getCategoryDetails(categoryId);
      if (response.success) {
        setDetails(response.data);
      } else {
        toast.error('Failed to load category details');
      }
    } catch (error) {
      console.error('Error loading category details:', error);
      toast.error('Error loading category details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = () => {
    if (category && onAddSubcategory) {
      onOpenChange(false);
      onAddSubcategory(category.id);
    }
  };
  
  const handleViewFullDetails = () => {
    if (category) {
      // Close the dialog and navigate to a dedicated category details page
      onOpenChange(false);
      // This would ideally navigate to a dedicated category page
      // For now, we'll just show a toast
      toast.info('Full category details view would open here');
      // In a real implementation, you would navigate to a route like:
      // navigate(`/categories/${category.id}`);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {category.name}
            {onEditCategory && (
              <button
                className="ml-2 p-1 rounded hover:bg-muted"
                title="Edit Category"
                onClick={() => onEditCategory(category)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3m0 0H6m3 0h3" /></svg>
              </button>
            )}
          </DialogTitle>
          <DialogDescription className="text-left">{category.description || 'No description'}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <div className="space-y-4">
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleAddSubcategory}>
                  <Plus className="h-4 w-4 mr-1" /> Add Subcategory
                </Button>
                <Button onClick={handleViewFullDetails}>
                  <ExternalLink className="h-4 w-4 mr-1" /> View Full Details
                </Button>
              </div>
            </div>
        </div>

          {/* Tabs removed - simplified view */}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDetailsDialog;
