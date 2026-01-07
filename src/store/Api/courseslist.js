import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const coursesListApi = createApi({
    reducerPath: "coursesListApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: "/api/v1/",
        credentials: 'include' // Add this to send cookies automatically
    }),
    tagTypes: ['CoursesWithStatus', 'UserCoursesVideos', 'CourseDetails'],
    
    endpoints: (builder) => ({
        getAllCourses: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => 
                `newcourses?page=${page}&limit=${limit}`
        }),
        getCourseModules: builder.query({
            query: (courseId) => `module?courseId=${courseId}`
        }),
        getCourseById: builder.query({
            query: (courseId) => `newcourses/${courseId}`
        }),
        
        // Get courses with enrollment status
        getCoursesWithStatus: builder.query({
            query: () => ({
                url: 'newCourses/getCoursesStatus',
            }),
            transformResponse: (response) => {
                return response.data.courses || [];
            },
            providesTags: ['CoursesWithStatus']
        }),
        
        // Get user courses with videos
        getUserCoursesVideos: builder.query({
            query: () => ({
                url: 'newCourses/getUserCoursesVideos',
            }),
            transformResponse: (response) => {
                // Return the structured data
                return {
                    enrolledCourses: response.data.enrolledCourses || [],
                    otherCourses: response.data.otherCourses || []
                };
            },
            providesTags: ['UserCoursesVideos']
        }),

        // Add this: Get course details with modules
        getCourseDetails: builder.query({
            query: (courseId) => ({
                url: `newcourses/details/${courseId}`,
            }),
            transformResponse: (response) => {
                return response.data.course || null;
            },
            providesTags: ['CourseDetails']
        }),
    }),
});

export const { 
    useGetAllCoursesQuery, 
    useGetCourseModulesQuery,
    useGetCourseByIdQuery,
    useGetCoursesWithStatusQuery,
    useGetUserCoursesVideosQuery,
    useGetCourseDetailsQuery // Add this export
} = coursesListApi;