import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Lock, User, Shield, Smartphone, Key } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const twoFactorSchema = z.object({
  twoFactorCode: z.string().min(1, 'Authentication code is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<LoginFormData | null>(null);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      twoFactorCode: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData & { twoFactorCode?: string }) => {
      const res = await apiRequest('/api/admin/login', 'POST', data);
      return res.json();
    },
    onSuccess: (response) => {
      if (response.requires2FA) {
        setRequires2FA(true);
        setLoginCredentials(form.getValues());
        toast({
          title: "Two-factor authentication required",
          description: "Please enter your 6-digit code from your authenticator app",
        });
      } else if (response.success) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        setLocation('/admin/dashboard');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onTwoFactorSubmit = (data: TwoFactorFormData) => {
    if (loginCredentials) {
      loginMutation.mutate({
        ...loginCredentials,
        twoFactorCode: data.twoFactorCode,
      });
    }
  };

  const goBack = () => {
    setRequires2FA(false);
    setLoginCredentials(null);
    twoFactorForm.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            AramisTech Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the dashboard
          </p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {requires2FA ? <Shield className="w-6 h-6 mx-auto mb-2" /> : <Lock className="w-6 h-6 mx-auto mb-2" />}
              {requires2FA ? 'Two-Factor Authentication' : 'Admin Login'}
            </CardTitle>
            <CardDescription className="text-center">
              {requires2FA 
                ? 'Enter the 6-digit code from your authenticator app or use a backup code'
                : 'Enter your credentials to access the admin panel'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!requires2FA ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="text"
                              placeholder="Enter username"
                              className="pl-10"
                              disabled={loginMutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter password"
                              className="pl-10"
                              disabled={loginMutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Open your authenticator app and enter the 6-digit code, or use one of your backup codes.
                  </AlertDescription>
                </Alert>
                
                <Form {...twoFactorForm}>
                  <form onSubmit={twoFactorForm.handleSubmit(onTwoFactorSubmit)} className="space-y-4">
                    <FormField
                      control={twoFactorForm.control}
                      name="twoFactorCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authentication Code</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                {...field} 
                                placeholder="Enter 6-digit code or backup code" 
                                className="pl-10 text-center text-lg tracking-widest"
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                disabled={loginMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? 'Verifying...' : 'Verify'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        disabled={loginMutation.isPending}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <div className="text-sm text-center text-muted-foreground">
                  <p>Lost your device? Use one of your 8-character backup codes instead.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}