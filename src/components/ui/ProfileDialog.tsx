
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Building, User, Mail, IdCard, GraduationCap, Briefcase } from 'lucide-react';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  staffId: string;
  department: string;
  designation: string;
  // Add other fields as needed
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the current user email from localStorage
    const currentUserEmail = localStorage.getItem('currentUser');
    
    if (currentUserEmail) {
      // Get all registered users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Find the current user
      const currentUser = registeredUsers.find((user: any) => user.email === currentUserEmail);
      
      if (currentUser) {
        setUserData(currentUser);
      }
    }
  }, [isOpen]);
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    onClose();
    navigate('/login');
  };
  
  if (!userData) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            Your account information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-center text-center justify-center py-4">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold">
              {userData.name.charAt(0)}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Name:</span>
              <span className="ml-1">{userData.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Email:</span>
              <span className="ml-1">{userData.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Staff ID:</span>
              <span className="ml-1">{userData.staffId}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <span className="font-semibold">Department:</span>
              <span className="ml-1">{userData.department}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">Designation:</span>
              <span className="ml-1">{userData.designation}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-teal-500" />
              <span className="font-semibold">College:</span>
              <span className="ml-1">K. S. Rangasamy College of Technology</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mr-2"
          >
            Close
          </Button>
          <Button 
            variant="destructive"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
