import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { EmptyWorkspace } from "@/components/empty-workspace";
import { StatusBar } from "@/components/navigation/status-bar";

export default function EmptyRoute() {
  useEffect(() => {
    if (window.history.length > 1) {
      window.history.replaceState(null, "", "/empty");
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="h-screen w-screen overflow-hidden"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <StatusBar />
        <EmptyWorkspace />
      </motion.div>
    </AnimatePresence>
  );
}
