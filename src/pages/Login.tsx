import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useBreakpointValue } from '@/hooks/use-mobile';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Responsive form width
  const formWidth = useBreakpointValue({
    base: "w-full",
    sm: "max-w-md",
    md: "max-w-lg"
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const storedUsers = localStorage.getItem('registeredUsers');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const user = users.find((u: any) => u.email === values.email && u.password === values.password);
      
      if (user) {
        // Store current user email in localStorage
        localStorage.setItem('currentUser', values.email);
        
        toast({
          title: "Welcome back!",
          description: `You've successfully logged in as ${user.name}.`,
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem logging you in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Orange and Blue Background Design - Fixed overflow issues */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F97316] via-[#0EA5E9] to-[#33C3F0] opacity-60 z-0"></div>
      
      {/* Decorative Elements - Better contained */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/15 backdrop-blur-sm"></div>
        <div className="absolute top-20 left-10 w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-orange-400 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-blue-400 opacity-30 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-20 sm:w-40 h-20 sm:h-40 rounded-full bg-white opacity-20 blur-2xl"></div>
      </div>
      
      {/* College Logo - Adjusted for better positioning */}
      <div className="relative z-10 p-4 flex">
        <div className="bg-white p-2 rounded-lg shadow-md">
          <img 
            src="/lovable-uploads/c8d5fc43-569a-4b7e-9366-09b681f0e06f.png" 
            alt="K.S. Rangasamy College of Technology" 
            className="h-10 sm:h-14 w-auto"
          />
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <motion.div 
          className={`${formWidth || 'w-full max-w-md'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 sm:mb-6 flex justify-end">
            <Link to="/" className="inline-flex items-center text-sm text-white hover:text-white/80 bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-sm shadow-md">
              Back to home
            </Link>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-4 sm:p-6 border border-white/30">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-bold mb-2 text-[#0EA5E9]">Login to your account</h1>
              <p className="text-gray-700 text-sm">Enter your details to access the dashboard</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} className="border-gray-300" />
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
                      <FormLabel className="font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "password" : "text"} 
                            placeholder="••••••••" 
                            {...field} 
                            className="border-gray-300"
                          />
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-[#F97316] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F97316] text-white font-bold" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 sm:mt-6 text-center text-sm">
              <span className="text-gray-700">Don't have an account? </span>
              <Link to="/signup" className="text-[#F97316] hover:text-[#0EA5E9] font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
