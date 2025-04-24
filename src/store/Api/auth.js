import { Logout } from '@/lib/svg_icons';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),

    tagTypes: ['user'],
    endpoints: (builder) => ({
        signin: builder.mutation({
            query: (body) => ({
                url: "user/signin",
                method: "POST",
                credentials: "include",
                body,
            })
        }),
        hasSubscription: builder.query({
            query: (userId) => `order/has-subscription/${userId}`
        }),
        verifyUser: builder.mutation({
            query: (body) => ({
                url: "user/verify-user",
                method: "POST",
                credentials: "include",
                body,
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: "user/logout",
                method: "DELETE",
                credentials: "include",
            })
        }),
        switchDevice: builder.mutation({
            query: () => ({
                url: "user/switch-device",
                method: "POST",
            })
        }),
        getUserDetail: builder.query({
            query: () => "user/send-me",
            providesTags: ["user"]
        }),

        updateName: builder.mutation({
            query: (body) => ({
                url: "user/name",
                method: "PUT",
                body
            }),
            invalidatesTags: ["user"]
        }),

        updateMobile: builder.mutation({
            query: (body) => ({
                url: "user/mobile",
                method: "PUT",
                body
            }),
            invalidatesTags: ["user"]
        }),
        updateAvatar: builder.mutation({
            query: (body) => ({
                url: "user/avatar",
                method: "PUT",
                body
            }),
            invalidatesTags: ["user"]
        }),
        deleteAccount: builder.mutation({
            query: () => ({
                url: "user/delete-account",
                method: "DELETE",
            }),
        }),
        getActivePaymentGateway: builder.query({
            query: () => "app-config/active-gateways",
        })
    })
})


export const { useDeleteAccountMutation, useSigninMutation,
    useUpdateMobileMutation,
    useUpdateNameMutation,
    useUpdateAvatarMutation,
    useVerifyUserMutation,
    useLogoutMutation,
    useSwitchDeviceMutation,
    useLazyHasSubscriptionQuery,
    useGetUserDetailQuery,
    useHasSubscriptionQuery,
    useGetActivePaymentGatewayQuery,
} = authApi;