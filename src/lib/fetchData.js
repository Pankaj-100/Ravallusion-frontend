const { cookies } = require("next/headers");

const FetchRequest = async ({ path, isTokenRequired = true }) => {
  let headers = {
    "Content-Type": "application/json",
  };
  if (isTokenRequired) {
    headers.Authorization = `${cookies().get("token")?.value}`;
  }


  try {
    const response = await fetch(`https://api.ravallusion.com${path}`, {
      method: "GET",
      // headers,
      // cache: "force-cache",
      // cache: "no-store",
    });
  

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(
        responseData?.message ||
          responseData?.errors ||
          responseData?.error?.message
      );
    }
    return { success: true, data: responseData.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


export const getLandingPageData = async () => {
  const res = await FetchRequest({
    path: "/api/v1/user/home",
    isTokenRequired: false,
  });
  return res;
};



export const getStaticData = async () => {
  const res = await FetchRequest({
    path: "/api/v1/content/page",
    isTokenRequired: false,
  });
  return res;
};
