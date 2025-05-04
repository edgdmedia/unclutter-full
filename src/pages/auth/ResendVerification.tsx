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
  email: z.string().email({ message: "Please enter a valid email address" })
});

export default function ResendVerification() {
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
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await authApi.resendVerification(values.email);
      toast.success("Verification email sent! Please check your inbox.");
      // Redirect to verify email page with the email pre-filled
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-finance-blue">Resend Verification Email</h2>
      
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
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm space-y-2">
        <div>
          Already have a code?{' '}
          <Link to="/verify-email" className="text-finance-blue hover:underline font-medium">Verify Email</Link>
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
