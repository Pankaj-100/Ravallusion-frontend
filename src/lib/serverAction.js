// utils/api.js
const { cookies } = require("next/headers");

const MutationRequest = async ({
  method,
  path,
  body,
  isTokenRequired = true,
}) => {
  let headers = {
    "Content-Type": "application/json",
  };
  if (isTokenRequired) {
    headers.Authorization = `${cookies().get("token")?.value}`;
  }

  try {
    const response = await fetch(`https://api.ravallusion.com${path}`, {
      method,
      headers,
      body,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(
        responseData?.message ||
          responseData?.errors ||
          responseData?.error?.message
      );
    }
    return { success: true, data: responseData };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get colleges list
export const getCollegesList = async () => {
  try {
    const response = await fetch('https://revallusion-backend-jywg.onrender.com/api/v1/registration/getCollegesList', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData?.message || 'Failed to fetch colleges');
    }
    return { success: true, data: responseData };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Register student
export const registerStudent = async (body) => {
  const res = await MutationRequest({
    method: "POST",
    path: "/api/v1/registration/registerStudent",
    body: JSON.stringify(body),
    isTokenRequired: false,
  });

  return res;
};

// Submit query (contact form)
export const submitQuery = async (body) => {
  const res = await MutationRequest({
    method: "POST",
    path: "/api/v1/query",
    body: JSON.stringify(body),
    isTokenRequired: false,
  });

  return res;
};