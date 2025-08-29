"use client";
import React, { useState, useEffect } from "react";
import CustomDialog from "../common/CustomDialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useGetInvoiceProfileQuery,
  useUpdateInvoiceProfileMutation,
} from "@/store/Api/auth"; 
import { toast } from "react-toastify";

function InvoiceDetail({ open, setOpen }) {
  const { data, isLoading: isFetching } = useGetInvoiceProfileQuery();
  const [updateInvoiceProfile, { isLoading }] =
    useUpdateInvoiceProfileMutation();

  const [name, setName] = useState("");
  const [state, setState] = useState("");

  // Pre-fill with existing invoice details
  useEffect(() => {
    if (data?.data?.user) {
      setName(data.data.user.name || "");
      setState(data.data.user.state || "");
    }
  }, [data]);

  const handleSubmit = async () => {
    if (!name || !state) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const res = await updateInvoiceProfile({ name, state }).unwrap();
      if (res?.success) {
       // toast.success("Invoice profile updated successfully");
        setOpen(false);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Error updating invoice details");
    }
  };

  return (
    <CustomDialog open={open} close={() => setOpen(false)}>
      <div className="flex items-center justify-center my-8">
        <div
          className="w-full md:w-4/5 p-10 rounded-[28px]"
          style={{
            background: "rgba(13, 33, 61, 0.35)",
            backdropFilter: "blur(104.0999984741211px)",
          }}
        >
          <div className="flex flex-col gap-3 items-start justify-between mb-7">
            <h1 className="text-xl font-semibold">Invoice Details</h1>
            <p className="opacity-80">
              Please provide your details to subscribe to a plan
            </p>
          </div>

          <div className="mb-5">
            <label
              className="text-gray-100 font-semibold mb-[6px]"
              htmlFor="name"
            >
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-6 px-3 border-2 rounded-[12px] border-gray-500 mt-1 input-shadow "
            />

            <label
              className="text-gray-100 font-semibold mb-[6px] mt-3 block"
              htmlFor="state"
            >
              State
            </label>
            <Input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full py-6 px-3 border-2 rounded-[12px] border-gray-500 mt-1 input-shadow "
            />
          </div>

          <div className="flex justify-center mt-1 ">
            <Button
              className="hover:bg-[var(--neon-purple)] px-10 py-6 glow-btn font-semibold w-full rounded-lg "
              onClick={handleSubmit}
              disabled={isLoading || isFetching}
            >
              {isLoading ? "Subscibing..." : "Subscribe"}
            </Button>
          </div>
        </div>
      </div>
    </CustomDialog>
  );
}

export default InvoiceDetail;
