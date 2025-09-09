
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { motion } from "framer-motion";

const CreditsDialog = () => {
  return <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="group bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 shadow-lg hover:scale-105 transition-all duration-300 font-bold">
          Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden my-0 px-[10px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DialogHeader>
            <DialogTitle className="font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text text-3xl">
              Project Credits
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-center text-blue-700">PROJECT MENTOR</h3>
              <p className="text-center text-gray-700 font-semibold">K KAVIARASU (ASSISTANT PROFESSOR, CSE)</p>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-center text-blue-700">PROJECT LEAD</h3>
              <p className="text-center text-gray-700 font-semibold">K L PERANANDHA (CSE BATCH: 2023-27)</p>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-center text-blue-700">TEAM MEMBERS</h3>
              <ul className="list-none space-y-2 text-center text-gray-700 font-semibold">
                <li>A SHANMUGESHWARA (CSE BATCH: 2023-27)</li>
                <li>R P ASHWINI (CSE BATCH: 2023-27)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>;
};
export default CreditsDialog;

