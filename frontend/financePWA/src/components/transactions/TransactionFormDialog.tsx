
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useFinance } from '@/context/FinanceContext';

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTransaction?: any | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.date(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  account: z.string().min(1, { message: 'Account is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().optional(),
  notes: z.string().optional(),
  toAccount: z.string().optional(),
});

const TransactionFormDialog: React.FC<TransactionFormDialogProps> = ({
  open,
  onOpenChange,
  initialTransaction,
}) => {
  const { accounts, categories, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  
  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      amount: 0,
      account: '',
      category: '',
      description: '',
      notes: '',
      toAccount: '',
    },
  });

  // Watch the transaction type to conditionally render fields
  const transactionType = form.watch('type');

  useEffect(() => {
    if (initialTransaction) {
      form.reset({
        id: initialTransaction.id,
        type: initialTransaction.type,
        date: new Date(initialTransaction.date),
        amount: Math.abs(initialTransaction.amount), // Always display positive amount in the form
        account: initialTransaction.account?.id || initialTransaction.accountId || '',
        category: initialTransaction.category?.id || initialTransaction.category || '',
        description: initialTransaction.description || '',
        notes: initialTransaction.notes || '',
        toAccount: initialTransaction.toAccount?.id || '',
      });
    } else {
      form.reset({
        type: 'expense',
        date: new Date(),
        amount: 0,
        account: accounts.length > 0 ? accounts[0].id : '',
        category: '',
        description: '',
        notes: '',
        toAccount: '',
      });
    }
  }, [initialTransaction, form, accounts]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const finalAmount = values.type === 'expense' ? -Math.abs(values.amount) : values.amount;
    
    if (initialTransaction?.id) {
      // Update existing transaction
      updateTransaction({
        id: initialTransaction.id,
        date: values.date.toISOString(),
        amount: finalAmount,
        description: values.description || 'Unnamed transaction',
        category: values.category,
        accountId: values.account,
        type: values.type
      });
      toast.success('Transaction updated successfully!');
    } else {
      // Create new transaction
      addTransaction({
        date: values.date.toISOString(),
        amount: finalAmount,
        description: values.description || 'Unnamed transaction',
        category: values.category,
        accountId: values.account,
        type: values.type
      });
      toast.success('Transaction added successfully!');
    }
    onOpenChange(false);
  };
  
  const handleDelete = () => {
    if (initialTransaction?.id) {
      deleteTransaction(initialTransaction.id);
      toast.success('Transaction deleted successfully!');
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{initialTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
            <DialogDescription>
              {initialTransaction
                ? 'Update your transaction details below.'
                : 'Record a new financial transaction.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="expense" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Expense
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="income" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Income
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="transfer" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Transfer
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
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
              </div>

              <div className={transactionType === 'transfer' ? 'grid grid-cols-2 gap-4' : ''}>
                <FormField
                  control={form.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {transactionType === 'transfer' ? 'From Account' : 'Account'}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {transactionType === 'transfer' && (
                  <FormField
                    control={form.control}
                    name="toAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Account</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts
                              .filter(account => account.id !== form.getValues('account'))
                              .map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {transactionType !== 'transfer' && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(transactionType === 'income' ? incomeCategories : expenseCategories).map(category => (
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
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                {initialTransaction && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    className="mr-auto"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">{initialTransaction ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-finance-red hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionFormDialog;
