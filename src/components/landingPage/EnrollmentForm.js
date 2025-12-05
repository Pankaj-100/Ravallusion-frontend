"use client";

import {
  emailIcon,
  indiaFlag,
  professionIcon,
  userIcon,
} from "@/lib/svg_icons";
import {
  CheckBoxInput,
  TextArea,
  TextInput,
} from "../common/CustomInputs";
import { SubmitButton } from "../common/CustomButton";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../common/LoadingSpinner";

const EnrollmentForm = () => {
  const { toast } = useToast();
  const [errors, setErrors] = useState("");
  const [formInputs, setFormInputs] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    college: "",
    address: "",
    message: "",
    file: null,
    privacy: false
  });
  const [isLoading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [collegeLoading, setCollegeLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch colleges list from API
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('https://api.ravallusion.com/api/v1/registration/getCollegesList', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (result.success && result.data && result.data.colleges) {
          setColleges(result.data.colleges);
        } else {
          console.error('Failed to fetch colleges:', result.message);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      } finally {
        setCollegeLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for college selection
    if (!formInputs.college || formInputs.college === "") {
      setErrors("Please select a college");
      return;
    }
   
    setLoading(true);
    setErrors("");

    // Prepare data for the enrollment API with +91 prefix
    const enrollmentData = {
      firstName: formInputs.first_name,
      lastName: formInputs.last_name,
      email: formInputs.email,
      mobile: `+91${formInputs.mobile}`, // Automatically append +91 for backend
      college: formInputs.college,
      message: formInputs.message,
      privacyAccepted: formInputs.privacy
    };

    try {
      const response = await fetch('https://api.ravallusion.com/api/v1/registration/registerStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });

      const result = await response.json();
      
      setLoading(false);

      if (result.success) {
        setFormInputs({
          first_name: "",
          last_name: "",
          email: "",
          mobile: "",
          college: "",
          address: "",
          message: "",
          file: null,
          privacy: false
        });
        
        toast({
          variant: "default",
          title: result.message || "Registration submitted successfully!",
          className: "bg-green-500 text-white",
        });
      } else {
        toast({
          variant: "destructive",
          title: result.message || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "An error occurred. Please try again.",
      });
    }
  };

  const handleMobileChange = (data) => {
    if (/^\d{0,10}$/.test(data)) {
      setFormInputs({ ...formInputs, mobile: data });
    }
  };

  const handleCollegeSelect = (collegeId, collegeName) => {
    setFormInputs({ ...formInputs, college: collegeId });
    setErrors("");
    setIsDropdownOpen(false);
  };

  const getSelectedCollegeName = () => {
    if (!formInputs.college) return "";
    const selectedCollege = colleges.find(college => college._id === formInputs.college);
    return selectedCollege ? selectedCollege.name : "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mb-20 sm:gap-5 w-full sm:w-[80%] md:w-[55rem]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput
          label="Your First Name"
          id="first_name"
          placeholder="First Name"
          icon={userIcon}
          required={true}
          value={formInputs.first_name}
          className="py-1"
          onChange={(data) =>
            setFormInputs({ ...formInputs, first_name: data })
          }
        />
        <TextInput
          label="Your Last Name"
          id="last_name"
          placeholder="Last Name"
          icon={userIcon}
          required={true}
           className="py-1"
          value={formInputs.last_name}
          onChange={(data) => setFormInputs({ ...formInputs, last_name: data })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextInput
          label="Your Email"
          id="email"
          type={"email"}
          placeholder="Email address"
          icon={emailIcon}
          required={true}
           className="py-1"
          value={formInputs.email}
          onChange={(data) => setFormInputs({ ...formInputs, email: data })}
        />
        <TextInput
          type={'number'}
          label="Your Phone Number"
          id="phone_no"
          placeholder="Phone number"
          icon={indiaFlag}
           className="py-1"
          required={true}
          value={formInputs.mobile}
          onChange={handleMobileChange}
        />
      </div>
      
      {/* Custom Dropdown for Colleges */}
      <div className="flex flex-col gap-[0.375rem]">
        <label className="text-xs">
          Name of the College <span className="text-red-700">*</span>
        </label>
        
        <div className="relative">
          {/* Dropdown Trigger */}
          <button
            type="button"
            className={`w-full flex items-center gap-3 px-4 py-3 bg-[var(--input)] rounded-xl text-left transition-colors ${
              errors ? 'border-2 border-red-500' : ''
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="flex-shrink-0 text-gray-400">
              {professionIcon}
            </span>
            <span className={`flex-1 text-sm ${getSelectedCollegeName() ? 'text-white' : 'text-white/60'}`}>
              {getSelectedCollegeName() || (collegeLoading ? "Loading colleges..." : "Select your college")}
            </span>
            <span className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[var(--input)] border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {collegeLoading ? (
                <div className="px-4 py-3 text-white/60 text-sm">Loading colleges...</div>
              ) : colleges.length === 0 ? (
                <div className="px-4 py-3 text-white/60 text-sm">No colleges available</div>
              ) : (
                colleges.map((college) => (
                  <button
                    key={college._id}
                    type="button"
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      formInputs.college === college._id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                    onClick={() => handleCollegeSelect(college._id, college.name)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 text-gray-400">
                        {professionIcon}
                      </span>
                      <span>{college.name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        {errors && <p className="text-red-700 text-xs mt-1">{errors}</p>}
      </div>

      <TextArea
        label="Message"
        id="message"
        placeholder="Leave us a message..."
        required={true}
        rows={3}
        value={formInputs.message}
        onChange={(data) => setFormInputs({ ...formInputs, message: data })}
      />
      
      <CheckBoxInput
        label="You agree to our friendly privacy policy."
        id="privacy"
        required={true}
        checked={formInputs.privacy}
        onChange={(data) => setFormInputs({ ...formInputs, privacy: data })}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div></div>
        <div></div>
        <SubmitButton className="!mt-[8px] !py-5 text-xl font-semibold">
          Register Now {isLoading && <LoadingSpinner />}
        </SubmitButton>
      </div>
    </form>
  );
};

export default EnrollmentForm;