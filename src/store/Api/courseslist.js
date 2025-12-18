import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const coursesListApi = createApi({
    reducerPath: "coursesListApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: "/api/v1/"
    }),
    
    endpoints: (builder) => ({
        getAllCourses: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => 
                `newcourses?page=${page}&limit=${limit}`
        }),
        getCourseModules: builder.query({
            query: (courseId) => `module?courseId=${courseId}`
        }),
        // ADD THIS: Get single course by ID
        getCourseById: builder.query({
            query: (courseId) => `newcourses/${courseId}`
        }),
    }),
});

export const { 
    useGetAllCoursesQuery, 
    useGetCourseModulesQuery,
    useGetCourseByIdQuery // Add this export
} = coursesListApi;