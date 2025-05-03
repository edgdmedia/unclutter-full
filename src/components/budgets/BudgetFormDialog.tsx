
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

import { useFinance } from '@/context/FinanceContext';

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBudget?: any | null;
  month?: number;
  year?: number;
}

const formSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, { message: 'Category is required' }),
  budgetAmount: z.coerce.number().positive({ message: 'Budget amount must be positive' }),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(3000),
});

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const BudgetFormDialog: React.FC<BudgetFormDialogProps> = ({
  open,
  onOpenChange,
  initialBudget,
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
}) => {
  const { categories } = useFinance();
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      budgetAmount: 0,
      month,
      year,
    },
  });

  useEffect(() => {
    if (initialBudget) {
      form.reset({
        id: initialBudget.id,
        category: initialBudget.category.id,
        budgetAmount: initialBudget.budgetAmount || 0,
        month: initialBudget.month || month,
        year: initialBudget.year || year,
      });
    } else {
      form.reset({
        category: '',
        budgetAmount: 0,
        month,
        year,
      });
    }
  }, [initialBudget, form, month, year]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast.success(
      initialBudget ? 'Budget updated successfully!' : 'Budget added successfully!'
    );
    onOpenChange(false);
  };

  const handleCopyLastMonth = () => {
    toast.success('Budgets copied from previous month!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialBudget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
          <DialogDescription>
            {initialBudget
              ? 'Update your budget details below.'
              : 'Create a new budget category for the selected month.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={String(month.value)}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2000"
                        max="3000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budgetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {!initialBudget && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLastMonth}
                  className="mr-auto"
                >
                  Copy Last Month
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{initialBudget ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetFormDialog;
