import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "/api/v1",
    credentials: "include"
  }),
  tagTypes: ["Quiz", "QuizResult", "QuizAttempt", "QuizQuestions"],

  endpoints: (builder) => ({
    // Check eligibility for quiz
    checkEligibility: builder.query({
      query: (videoId) => `/quiz/checkEligibility/${videoId}`,
      providesTags: ["Quiz"],
    }),

    // Get quiz by video ID
    getQuiz: builder.query({
      query: (videoId) => `/quiz/find/${videoId}`,
      providesTags: ["Quiz"],
    }),

    // Get all questions by quiz ID
    getQuizQuestions: builder.query({
      query: (quizId) => `/quiz-qa/findall/${quizId}`,
      providesTags: ["QuizQuestions"],
    }),

    // Submit quiz
    submitQuiz: builder.mutation({
      query: (quizData) => ({
        url: "/quiz/submit",
        method: "POST",
        body: quizData,
      }),
      invalidatesTags: ["QuizResult"],
    }),

    // Get quiz result by video ID
    getQuizResult: builder.query({
      query: (videoId) => `/quiz/get-result/${videoId}`,
      providesTags: ["QuizResult"],
    }),

    // Save individual question response
    saveQuestionResponse: builder.mutation({
      query: (attemptData) => ({
        url: "/quiz-atmpt/save",
        method: "POST",
        body: attemptData,
      }),
      invalidatesTags: ["QuizAttempt"],
    }),
  }),
});

export const {
  useCheckEligibilityQuery,
  useGetQuizQuery,
  useGetQuizQuestionsQuery,
  useSubmitQuizMutation,
  useGetQuizResultQuery,
  useSaveQuestionResponseMutation,
} = quizApi;