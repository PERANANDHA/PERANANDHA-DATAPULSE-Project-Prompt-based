import React from 'react';
import PageNavigator from './ui/PageNavigator';
const AppWrapper: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  return <div className="app-wrapper min-h-screen relative py-0">
      {/* Enhanced Realistic Background */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient layer with improved realistic colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7E30] via-[#F97316] to-[#0284c7] opacity-70"></div>
        
        {/* Depth effect with radial gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/5 backdrop-blur-[2px]"></div>
          <div className="absolute -top-10 left-20 w-[45vw] h-[45vh] rounded-full bg-[#FF8F50] opacity-40 blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-[40vw] h-[40vh] rounded-full bg-[#0EA5E9] opacity-40 blur-3xl"></div>
          <div className="absolute top-1/3 left-1/4 w-[20vw] h-[20vh] rounded-full bg-[#FFD700] opacity-20 blur-xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-[15vw] h-[15vh] rounded-full bg-[#38BDF8] opacity-20 blur-xl"></div>
        </div>
        
        {/* Texture overlay for realism */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-30"></div>
        
        {/* Light rays effect */}
        <div className="absolute top-0 left-1/4 w-[50vw] h-[30vh] bg-gradient-to-b from-yellow-300/20 via-yellow-500/5 to-transparent transform rotate-12 opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[25vh] bg-gradient-to-t from-blue-300/20 via-blue-500/5 to-transparent transform -rotate-12 opacity-30"></div>
      </div>

      <div className="relative z-10">
        <PageNavigator />
        <div className="pt-10">
          {children}
        </div>
      </div>
    </div>;
};
export default AppWrapper;