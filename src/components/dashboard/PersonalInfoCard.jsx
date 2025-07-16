"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { OutlinePencil, YellowPencil } from "@/lib/svg_icons";
import CustomDialog from "../common/CustomDialog";
import EditInfo from "./EditPersonalInfo";
import {
  useGetUserDetailQuery,
  useUpdateAddressMutation,
  useUpdateAvatarMutation,
  useUpdateMobileMutation,
  useUpdateNameMutation,
} from "@/store/Api/auth";
import { toast } from "react-toastify";
import { SimpleLoader } from "../common/LoadingSpinner";

const PersonalInfoCard = () => {
  const { data, isLoading: loading } = useGetUserDetailQuery();
  const [updateName, { isLoading }] = useUpdateNameMutation();
  const [updateMobile, { isLoading: isLoadingMobile }] =
    useUpdateMobileMutation();
  const [updateAddress, { isLoading: isLoadingAddress }] =
    useUpdateAddressMutation();
  const [updateAvatar, { isLoading: isLoadingAvatar }] =
    useUpdateAvatarMutation();

  const userName = data?.data?.user?.name || "Ravallusion";
  const email = data?.data?.user?.email || "NA";
  const avatar = data?.data?.user?.avatar || "/profilepic.jpeg";
  const mobileNumber = data?.data?.user?.mobile || "NA";
  //   const addressData = data?.data?.user?.address || "NA";

  console.log("User: ", data?.data?.user, data?.data?.user?.address);

  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(mobileNumber);
  const [address, setAddress] = useState("");

  const [isOpenName, setIsOpenName] = useState(false);
  const [isOpenPhone, setIsOpenPhone] = useState(false);
  const [isOpenAddress, setIsOpenAddress] = useState(false);

  // Function to handle saving updated name or phone
  const handleSave = (field, value) => {
    if (field === "name") setName(value);
    if (field === "phone") setPhone(value);
    if (field === "address") setAddress(value);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await updateAvatar(formData).unwrap();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || "Failed to upload image");
    }
  };

const handleUpdateName = async (value) => {
  // Allow only letters, spaces, hyphens and apostrophes (e.g., O'Connor)
  const nameRegex = /^[a-zA-Z\s'-]+$/;

  if (!nameRegex.test(value)) {
    toast.error("No special characters allowed in name field");
    return;
  }

  handleSave("name", value);
  try {
    const res = await updateName({ name: value }).unwrap();
  } catch (error) {
    console.log("error while Updating name", error);
    toast.error(error?.data?.message);
  } finally {
    setIsOpenName(false);
  }
};

  const handleUpdateMobile = async (value) => {
    handleSave("phone", value);
    try {
      const res = await updateMobile({ mobile: value }).unwrap();
    } catch (error) {
      console.log("error while Updating phone", error);
      toast.error(error?.data?.message);
    } finally {
      setIsOpenPhone(false);
    }
  };

  const handleUpdateAddress = async (value) => {
    handleSave("address", value);
    try {
      const res = await updateAddress({ address: value }).unwrap();
    } catch (error) {
      console.log("error while Updating phone", error);
      toast.error(error?.data?.message);
    } finally {
      setIsOpenAddress(false);
    }
  };

  const user = data?.data?.user;
  useEffect(() => {
    if (user) {
      setAddress(user?.address);
    }
  }, [user]);

  return loading ? (
    <div className="flex items-center justify-center min-h-[60vh]">
      {" "}
      <SimpleLoader />
    </div>
  ) : (
    <div className=" w-full z-20">
      <div className="pt-4 lg:pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Personal Information</h1>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 rounded-full">
              {isLoadingAvatar ? (
                <SimpleLoader />
              ) : (
                <Image
                  src={avatar || "/profilepic.jpeg"}
                  alt="profilepic"
                  fill
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              )}

              <div className="absolute bottom-1 right-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <OutlinePencil />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <PersonalInfo
          label="Name"
          content={userName}
          onClick={() => setIsOpenName(true)}
        />
        <PersonalInfo
          label="Phone number"
          content={mobileNumber}
          onClick={() => setIsOpenPhone(true)}
        />
        <PersonalInfo label="Email id" content={email} />
        <PersonalInfo
          label="Address"
          content={address}
          required={false}
          onClick={() => setIsOpenAddress(true)}
        />
      </div>

      <CustomDialog open={isOpenName} close={() => setIsOpenName(false)}>
        <EditInfo
          isLoading={isLoading}
          label="Name"
          content={name}
          onClick={() => setIsOpenName(false)}
          onSave={(value) => {
            handleUpdateName(value);
          }}
        />
      </CustomDialog>

      <CustomDialog open={isOpenPhone} close={() => setIsOpenPhone(false)}>
        <EditInfo
          isLoading={isLoadingMobile}
          label="Phone"
          type="text"
          content={phone}
          onClick={() => setIsOpenPhone(false)}
          onSave={(value) => {
            handleUpdateMobile(value);
          }}
        />
      </CustomDialog>

      <CustomDialog open={isOpenAddress} close={() => setIsOpenPhone(false)}>
        <EditInfo
          isLoading={isLoadingAddress}
          label="Address"
          type="text"
          
          content={address}
          onClick={() => setIsOpenAddress(false)}
          onSave={(value) => {
            handleUpdateAddress(value);
          }}
        />
      </CustomDialog>
    </div>
  );
};

const PersonalInfo = ({ label, content, onClick }) => {
  return (
    <div className="py-1">
      <label
        htmlFor="name"
        className="text-[13px] ml-1 text-gray-400 important "
      >
        {label}
      </label>
      <div className="flex items-center justify-between relative">
        <p className="text-sm font-medium border border-gray-500 p-4 w-full rounded-xl ">
          {content}
        </p>
        {label !== "Email id" && (
          <div className="cursor-pointer absolute right-3" onClick={onClick}>
            <YellowPencil />
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoCard;
