import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const coursesListApi = createApi({
    reducerPath: "coursesListApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1/" }),
    
    endpoints: (builder) => ({
        getAllCourses: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => 
                `newcourses?page=${page}&limit=${limit}`
        }),
    }),
});

export const { useGetAllCoursesQuery } = coursesListApi;