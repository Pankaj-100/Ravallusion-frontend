"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils"; // make sure this exists in your utils

function CustomDialog({ open, close, children, variant = "default" }) {
  // Variant-specific sizing classes
  const sizeClasses = 
    variant === "latest-video"
      ? "max-w-[850px] w-full h-auto" // size for latest video
      : variant === "quiz"
      ? "w-screen h-screen max-w-none p-0 m-0 rounded-none" // quiz full-screen
      : "h-screen w-full";           // default full-screen

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTitle className="hidden" />
      <DialogDescription className="hidden" />
      <DialogContent
        className={cn(
          "overflow-y-none border-none outline-none",
          sizeClasses
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default CustomDialog;
