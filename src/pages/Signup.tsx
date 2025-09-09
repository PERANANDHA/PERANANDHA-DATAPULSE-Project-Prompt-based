
import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useBreakpointValue } from '@/hooks/use-mobile';

// Enhanced password validation
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  staffId: z.string().min(1, { message: "Staff ID is required." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  department: z.string().min(1, { message: "Department name is required." }),
  designation: z.string().min(1, { message: "Designation is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." })
    .refine(password => /[A-Z]/.test(password), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine(password => /[a-z]/.test(password), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine(password => /[0-9]/.test(password), {
      message: "Password must contain at least one number",
    })
    .refine(password => /[^A-Za-z0-9]/.test(password), {
      message: "Password must contain at least one special character",
    }),
  confirmPassword: z.string(),
  robotCheck: z.boolean().refine(val => val === true, {
    message: "Please confirm you are not a robot",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingUsers, setExistingUsers] = useState<{ email: string; staffId: string; phoneNumber: string }[]>([]);
  const [password, setPassword] = useState("");
  const [showRobotCheck, setShowRobotCheck] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Responsive form width
  const formWidth = useBreakpointValue({
    base: "w-full",
    sm: "max-w-md",
    md: "max-w-lg"
  });

  // Password validation criteria checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  // Load stored users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      setExistingUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with empty array if no users exist
      localStorage.setItem('registeredUsers', JSON.stringify([]));
    }
  }, []);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      staffId: "",
      phoneNumber: "",
      department: "",
      designation: "",
      password: "",
      confirmPassword: "",
      robotCheck: false,
    },
  });

  // Update password state when form field changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    form.setValue("password", newPassword);
  };

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // Check if email already exists
      if (existingUsers.some(user => user.email === values.email)) {
        toast({
          variant: "destructive",
          title: "Email already in use",
          description: "An account with this email address already exists. Please log in or use a different email.",
        });
        setIsLoading(false);
        return;
      }
      
      // Check if staffId already exists
      if (existingUsers.some(user => user.staffId === values.staffId)) {
        toast({
          variant: "destructive",
          title: "Staff ID already in use",
          description: "An account with this Staff ID already exists. Please use a different Staff ID.",
        });
        setIsLoading(false);
        return;
      }
      
      // Check if phone number already exists
      if (existingUsers.some(user => user.phoneNumber === values.phoneNumber)) {
        toast({
          variant: "destructive",
          title: "Phone number already in use",
          description: "An account with this phone number already exists. Please use a different phone number.",
        });
        setIsLoading(false);
        return;
      }
      
      // Check if the robot verification is completed
      if (!values.robotCheck) {
        setShowRobotCheck(true);
        setIsLoading(false);
        return;
      }
      
      // In a real application, this would call an API
      console.log("Form values:", values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user details in localStorage for demo purposes
      const newUser = {
        name: values.name,
        email: values.email,
        staffId: values.staffId,
        phoneNumber: values.phoneNumber,
        department: values.department,
        designation: values.designation,
        password: values.password,
      };
      
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "Account created!",
        description: "You've successfully signed up. Redirecting to login...",
      });
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem creating your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
              <h1 className="text-xl sm:text-2xl font-bold mb-2 text-[#0EA5E9]">Create your account</h1>
              <p className="text-gray-700 text-sm">Enter your details to get started</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Staff ID</FormLabel>
                        <FormControl>
                          <Input placeholder="ST12345" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+1 (555) 123-4567" 
                            {...field} 
                            className="border-gray-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="Assistant Professor" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field}
                            onChange={(e) => {
                              handlePasswordChange(e);
                              field.onChange(e);
                            }}
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
                      
                      {/* Password strength indicators */}
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium">Password must contain:</p>
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center">
                            {hasMinLength ? 
                              <Check className="h-3 w-3 mr-2 text-green-500" /> : 
                              <X className="h-3 w-3 mr-2 text-red-500" />
                            }
                            <span className={`text-xs ${hasMinLength ? "text-green-500" : "text-gray-500"}`}>
                              At least 8 characters
                            </span>
                          </div>
                          <div className="flex items-center">
                            {hasUpperCase ? 
                              <Check className="h-3 w-3 mr-2 text-green-500" /> : 
                              <X className="h-3 w-3 mr-2 text-red-500" />
                            }
                            <span className={`text-xs ${hasUpperCase ? "text-green-500" : "text-gray-500"}`}>
                              At least one uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center">
                            {hasLowerCase ? 
                              <Check className="h-3 w-3 mr-2 text-green-500" /> : 
                              <X className="h-3 w-3 mr-2 text-red-500" />
                            }
                            <span className={`text-xs ${hasLowerCase ? "text-green-500" : "text-gray-500"}`}>
                              At least one lowercase letter
                            </span>
                          </div>
                          <div className="flex items-center">
                            {hasNumber ? 
                              <Check className="h-3 w-3 mr-2 text-green-500" /> : 
                              <X className="h-3 w-3 mr-2 text-red-500" />
                            }
                            <span className={`text-xs ${hasNumber ? "text-green-500" : "text-gray-500"}`}>
                              At least one number
                            </span>
                          </div>
                          <div className="flex items-center">
                            {hasSpecialChar ? 
                              <Check className="h-3 w-3 mr-2 text-green-500" /> : 
                              <X className="h-3 w-3 mr-2 text-red-500" />
                            }
                            <span className={`text-xs ${hasSpecialChar ? "text-green-500" : "text-gray-500"}`}>
                              At least one special character
                            </span>
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field}
                            className="border-gray-300" 
                          />
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="robotCheck"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md border-gray-300">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="text-[#F97316] focus:ring-[#F97316]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium">I am not a robot</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-[#F97316] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F97316] text-white font-bold" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 sm:mt-6 text-center text-sm">
              <span className="text-gray-700">Already have an account? </span>
              <Link to="/login" className="text-[#F97316] hover:text-[#0EA5E9] font-medium">
                Log in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Robot verification dialog */}
      <Dialog open={showRobotCheck} onOpenChange={setShowRobotCheck}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Verification Required
            </DialogTitle>
            <DialogDescription>
              Please confirm you are not a robot by checking the box before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Button onClick={() => {
              form.setValue('robotCheck', true);
              setShowRobotCheck(false);
              form.handleSubmit(onSubmit)();
            }}>
              I am not a robot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
