import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  email: z.string().email({ message: "Please enter a valid email address" }),
  code: z.string().min(4, { message: "Verification code is required" })
});

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Try to get email from URL search params
  const searchParams = new URLSearchParams(location.search);
  const emailFromUrl = searchParams.get('email') || '';
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailFromUrl,
      code: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await authApi.verifyEmail(values.email, values.code);
      toast.success("Email verified successfully! You can now log in.");
      // Redirect to login page after successful verification
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed. Please check your code and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-finance-blue">Verify Email</h2>
      
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
          
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter verification code" {...field} />
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
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm space-y-2">
        <div>
          Didn't receive a code?{' '}
          <Link to="/resend-verification" className="text-finance-blue hover:underline font-medium">Resend Code</Link>
        </div>
        <div>
          Back to{' '}
          <Link to="/login" className="text-finance-blue hover:underline font-medium">Login</Link>
        </div>
        <div>
          Don't have an account?{' '}
          <Link to="/register" className="text-finance-blue hover:underline font-medium">Register</Link>
        </div>
      </div>
    </>
  );
}
