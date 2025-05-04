import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import * as authApi from '@/services/authApi';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const data = await authApi.forgotPassword(values.email);
      toast.success("Password reset instructions sent to your email");
      // Redirect to reset password page with email parameter after a short delay
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-finance-blue">Forgot Password</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-finance-yellow hover:bg-finance-yellow/90 text-finance-blue" 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm space-y-2">
        <div>
          Remember your password?{' '}
          <Link to="/login" className="text-finance-blue hover:underline font-medium">Login</Link>
        </div>
        <div>
          Have a code?{' '}
          <Link to="/reset-password" className="text-finance-blue hover:underline font-medium">Reset Password</Link>
        </div>
        <div>
          Don't have an account?{' '}
          <Link to="/register" className="text-finance-blue hover:underline font-medium">Register</Link>
        </div>
      </div>
    </>
  );
}
