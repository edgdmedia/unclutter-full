
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

import { useFinance } from '@/context/FinanceContext';

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAccount?: {
    id: string;
    name: string;
    type: string;
    institution: string;
    balance: number;
    notes?: string;
  } | null;
  onSubmit: (values: any) => void;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Account name is required' }),
  type: z.string().min(1, { message: 'Account type is required' }),
  institution: z.string().min(1, { message: 'Institution is required' }),
  balance: z.coerce.number(),
  notes: z.string().optional(),
});

const AccountFormDialog: React.FC<AccountFormDialogProps> = ({
  open,
  onOpenChange,
  initialAccount,
  onSubmit
}) => {
  const { categories, fetchCategories } = useFinance();
  const accountTypes = categories.filter(cat => cat.type === 'account_type');
  
  // Fetch categories when the dialog opens
  useEffect(() => {
    if (open && (!categories || categories.length === 0)) {
      console.log('Fetching categories for account form');
      fetchCategories();
    }
  }, [open, categories, fetchCategories]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: '',
      institution: '',
      balance: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (initialAccount) {
      form.reset({
        id: initialAccount.id,
        name: initialAccount.name,
        type: initialAccount.type,
        institution: initialAccount.institution,
        balance: initialAccount.balance,
        notes: initialAccount.notes || '',
      });
    } else {
      form.reset({
        name: '',
        type: '',
        institution: '',
        balance: 0,
        notes: '',
      });
    }
  }, [initialAccount, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Submitting account form:', values);
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
          <DialogDescription>
            {initialAccount
              ? 'Update your account information below.'
              : 'Add a new financial account to track your balance and transactions.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTypes.length > 0 ? (
                          accountTypes.map(type => (
                            <SelectItem key={type.id} value={type.name.toLowerCase()}>
                              {type.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                            <SelectItem value="loan">Loan</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Chase Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance</FormLabel>
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about this account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{initialAccount ? 'Update' : 'Create'}</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountFormDialog;
