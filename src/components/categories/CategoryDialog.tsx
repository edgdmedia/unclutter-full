
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinance } from '@/context/FinanceContext';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CategoryType = 'income' | 'expense' | 'account' | 'tag';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  parent?: string;
  usageCount: number;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory: Category | null;
  categoryType: CategoryType;
  onSave: (category: Category) => void;
  parentId?: string | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['income', 'expense', 'account', 'tag']),
  description: z.string().optional(),
  parent: z.string().optional(),
});

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
  initialCategory,
  categoryType,
  onSave,
  parentId
}) => {
  const { categories } = useFinance();
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  
  // Filter parent categories based on the selected type
  useEffect(() => {
    if (categories && categories.length > 0) {
      const filtered = categories.filter(cat => 
        cat.type === categoryType && (!initialCategory || cat.id !== initialCategory.id)
      );
      setParentCategories(filtered);
    }
  }, [categories, categoryType, initialCategory]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      type: categoryType,
      description: '',
      parent: '',
    },
  });

  useEffect(() => {
    if (initialCategory) {
      let safeType = initialCategory.type;
      if (!safeType || safeType === '') {
        console.warn('[CategoryDialog] Category missing type:', initialCategory);
        safeType = categoryType || 'expense';
      }
      form.reset({
        id: initialCategory.id,
        name: initialCategory.name,
        type: safeType,
        description: initialCategory.description || '',
        parent: initialCategory.parent || '',
      });
    } else {
      form.reset({
        name: '',
        type: categoryType || 'expense', 
        description: '',
        parent: parentId || '',
      });
    }
  }, [initialCategory, categoryType, form, parentId]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onSave({
      id: data.id || String(Date.now()),
      name: data.name,
      type: data.type,
      description: data.description,
      parent: data.parent,
      usageCount: initialCategory?.usageCount || 0,
    });
  };

  const isEditing = !!initialCategory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the category details below.' : 'Create a new category to organize your finances.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="tag">Tag</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Parent Category Selection */}
            {/* <FormField
              control={form.control}
              name="parent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {parentCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
