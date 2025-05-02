
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'account' | 'tag';
  description?: string;
  parent?: string;
  usageCount: number;
}

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onConfirm: () => void;
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  onConfirm,
}) => {
  if (!category) return null;

  const hasTransactions = category.usageCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {hasTransactions ? (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p>This category has {category.usageCount} transactions associated with it.</p>
              </div>
            ) : null}
            <p>Are you sure you want to delete the category "{category.name}"? This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-finance-red hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;
