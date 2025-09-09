
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Realistic Background for 404 page */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient with deeper colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7E30] via-[#F97316] to-[#0284c7] opacity-70"></div>
        
        {/* Depth layers with improved blurring */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/15 backdrop-blur-[2px]"></div>
          <div className="absolute top-10 left-10 w-[45vw] h-[45vh] rounded-full bg-[#FF8F50] opacity-40 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-[40vw] h-[40vh] rounded-full bg-[#0EA5E9] opacity-40 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-[20vw] h-[20vh] rounded-full bg-[#FFD700] opacity-20 blur-xl"></div>
        </div>
        
        {/* Paper texture effect */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-30"></div>
      </div>
      
      <motion.div 
        className="text-center px-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-8xl font-bold text-white mb-6 text-shadow-lg">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-white text-shadow">Page not found</h2>
        <p className="text-white/90 mb-8 max-w-md mx-auto">
          We couldn't find the page you're looking for. The page might have been moved or doesn't exist.
        </p>
        <Link to="/">
          <Button className="flex items-center bg-gradient-to-r from-[#F97316] to-[#FF9500] text-white hover:from-[#FF9500] hover:to-[#F97316] font-bold shadow-lg">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
