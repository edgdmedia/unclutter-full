
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
  FormDescription,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';

import { useFinance } from '@/context/FinanceContext';

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGoal?: any | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Goal name is required' }),
  targetAmount: z.coerce.number().positive({ message: 'Target amount must be positive' }),
  currentAmount: z.coerce.number().min(0, { message: 'Current amount cannot be negative' }),
  startDate: z.date(),
  targetDate: z.date(),
  description: z.string().optional(),
  linkedAccount: z.string().optional(),
  goalType: z.enum(['fixed', 'percentage']),
  percentageOfIncome: z.coerce.number().min(0).max(100).optional(),
  enableAutoContribute: z.boolean().default(false),
});

const GoalFormDialog: React.FC<GoalFormDialogProps> = ({
  open,
  onOpenChange,
  initialGoal,
}) => {
  const { accounts } = useFinance();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      startDate: new Date(),
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      description: '',
      linkedAccount: '',
      goalType: 'fixed',
      percentageOfIncome: 0,
      enableAutoContribute: false,
    },
  });

  // Watch goal type to conditionally render fields
  const goalType = form.watch('goalType');

  useEffect(() => {
    if (initialGoal) {
      form.reset({
        id: initialGoal.id,
        name: initialGoal.name,
        targetAmount: initialGoal.targetAmount,
        currentAmount: initialGoal.currentAmount || 0,
        startDate: new Date(initialGoal.startDate),
        targetDate: new Date(initialGoal.targetDate),
        description: initialGoal.description || '',
        linkedAccount: initialGoal.linkedAccount?.id || '',
        goalType: initialGoal.goalType || 'fixed',
        percentageOfIncome: initialGoal.percentageOfIncome || 0,
        enableAutoContribute: initialGoal.enableAutoContribute || false,
      });
    } else {
      form.reset({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        startDate: new Date(),
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        description: '',
        linkedAccount: accounts.length > 0 ? accounts[0].id : '',
        goalType: 'fixed',
        percentageOfIncome: 0,
        enableAutoContribute: false,
      });
    }
  }, [initialGoal, form, accounts]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast.success(
      initialGoal ? 'Goal updated successfully!' : 'Goal created successfully!'
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{initialGoal ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
          <DialogDescription>
            {initialGoal
              ? 'Update your savings goal details below.'
              : 'Create a new savings goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Vacation Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
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
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Progress</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
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
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date</FormLabel>
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
                          disabled={(date) => date < new Date(form.getValues('startDate'))}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your goal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Account (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No linked account</SelectItem>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link a specific account to track this goal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goalType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Goal Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="fixed" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Fixed Amount
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="percentage" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Percentage of Income
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {goalType === 'percentage' && (
              <FormField
                control={form.control}
                name="percentageOfIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage of Income</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Percentage of your income to automatically save
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="enableAutoContribute"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Auto Contribute</FormLabel>
                    <FormDescription>
                      Automatically set aside money for this goal
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{initialGoal ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalFormDialog;
