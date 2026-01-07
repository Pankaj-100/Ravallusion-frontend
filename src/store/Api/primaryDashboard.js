import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

export const primaryDashboardApi = createApi({
    reducerPath: "primaryDashboardApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: "/api/v1/",
        credentials: 'include' // Add this to send cookies automatically
    }),
    tagTypes: ['UserCoursesVideos'],
    endpoints: (builder) => ({
        getCarouselImg: builder.query({
            query: () => `dashboard/carousal`
        }),
        getModuleOnPrimaryDashboard: builder.query({         
            query: () => `dashboard/content`
        }),
        // Add this: Get user courses with videos
        getUserCoursesVideos: builder.query({
            query: () => `newCourses/getUserCoursesVideos`,
            transformResponse: (response) => {
                // Return the structured data
                return {
                    enrolledCourses: response.data?.enrolledCourses || [],
                    otherCourses: response.data?.otherCourses || []
                };
            },
            providesTags: ['UserCoursesVideos']
        }),
    })
})

export const { 
    useGetCarouselImgQuery,
    useGetModuleOnPrimaryDashboardQuery,
    useGetUserCoursesVideosQuery // Add this export
} = primaryDashboardApi;