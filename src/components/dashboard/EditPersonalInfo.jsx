import { X } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "react-toastify";

const EditInfo = ({ label, content, onClick, onSave, type = "text", isLoading }) => {
  const isPhoneNumber = label.toLowerCase().includes("phone");
  const isNameField = label.toLowerCase() === "name";

  const [inputValue, setInputValue] = useState(
    isPhoneNumber ? content?.slice(-10) || "" : content
  );
  const [countryCode, setCountryCode] = useState(
    isPhoneNumber
      ? content?.replace(/[^+0-9]/g, "").slice(0, content.length - 10) || "+91"
      : ""
  );

  const handleSave = () => {
    if (isPhoneNumber) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(inputValue)) {
        toast.error("Enter a valid 10-digit phone number");
        return;
      }

      const fullPhone = `${countryCode}${inputValue}`;
      onSave(fullPhone);
    } else {
      onSave(inputValue);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className="w-full md:w-4/5 p-10 rounded-[28px]"
        style={{
          background: "rgba(13, 33, 61, 0.35)",
          backdropFilter: "blur(104.0999984741211px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg">Enter details</h1>
          
          <div className="cursor-pointer" onClick={onClick}>
            <X />
          </div>
         
        </div>
     {isNameField && (
            <p className="text-sm text-yellow-400 mb-3">
              This name will be displayed on your certificate
            </p>
          )}
        {/* Input field */}
        <div className="mb-5">
          <label className="text-gray-100 text-sm mb-[6px]" htmlFor="name">
            {label}
          </label>
 
          {isPhoneNumber ? (
            <div className="flex gap-3">
              <Input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-[100px] py-5 px-3 border-2 rounded-[12px] border-gray-500 mt-1 input-shadow"
              />
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full py-5 px-3 border-2 rounded-[12px] border-gray-500 mt-1 input-shadow"
              />
            </div>
          ) : (
            <Input
              type={type}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full py-5 px-3 border-2 rounded-[12px] border-gray-500 mt-1 input-shadow"
            />
          )}

          {/* 👇 Extra message only for Name field */}
     
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-x-20">
          <Button
            className="px-7 py-6 w-full border border-gray-500 hover:bg-gray-700 font-semibold"
            onClick={onClick}
          >
            Cancel
          </Button>
          <Button
            className="hover:bg-[var(--neon-purple)] px-7 py-6 glow-btn w-full font-semibold"
            onClick={handleSave}
          >
            {isLoading ? "Updating..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditInfo;
