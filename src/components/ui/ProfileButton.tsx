
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import ProfileDialog from "./ProfileDialog";

const ProfileButton: React.FC = () => {
  const [showProfile, setShowProfile] = useState(false);
  
  const openProfile = () => {
    setShowProfile(true);
  };
  
  const closeProfile = () => {
    setShowProfile(false);
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={openProfile}
        className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
        aria-label="User Profile"
      >
        <User className="h-5 w-5" />
      </Button>
      
      <ProfileDialog 
        isOpen={showProfile} 
        onClose={closeProfile} 
      />
    </>
  );
};

export default ProfileButton;
