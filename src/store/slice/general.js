import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  planId: null,
  planType: null,
  beginnerFirstVideo: false,
  planPrice: null,
  usdPrice: null,
  isIndia: true,
  introductoryVideosCount: 0,
  bookmarkCount: 0,
  submoduleId: null,
  courseId: null,
  updatedPercentageWatched: 0,
  videoIdOfCurrentVideo: null,
  firstVideoId: null,
  searchValue: " ",
  searchHistory: [],
  videoTitle: "",
  paymentSuccess: false,
  sidebarTabIndex: 0,
  courseType: null,
  shouldPlayFirstVideo: false,
  isLocked: null,
  videoLevel: null,
  courseData: null, // Add this to store full course object
}

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setSidebarTabIndex: (state, action) => {
      state.sidebarTabIndex = action.payload;
    },
    setBeginnerFirstVideo: (state, action) => {
      state.beginnerFirstVideo = action.payload;
    },
    setCourseType: (state, action) => {
      state.courseType = action.payload;
    },
    setIsLocked: (state, action) => {
      state.isLocked = action.payload;
    },
    setVideoLevel: (state, action) => {
      state.videoLevel = action.payload;
    },
    setShouldPlayFirstVideo: (state, action) => {
      state.shouldPlayFirstVideo = action.payload;
    },
    setPlanId: (state, action) => {
      state.planId = action.payload;
    },
    setPlanType: (state, action) => {
      state.planType = action.payload;
    },
    setPlanPrice: (state, action) => {
      state.planPrice = action.payload;
    },
    setUsdPrice: (state, action) => {
      state.usdPrice = action.payload;
    },
    setIsIndia: (state, action) => {
      state.isIndia = action.payload;
    },
    setIntroductoryVideoscount: (state, action) => {
      state.introductoryVideosCount = action.payload;
    },
    setBookmarkCount: (state, action) => {
      state.bookmarkCount = action.payload;
    },
    setSubmoduleId: (state, action) => {
      state.submoduleId = action.payload;
    },
    setCourseId: (state, action) => {
      state.courseId = action.payload;
    },
    setUpdatedPercentageWatched: (state, action) => {
      state.updatedPercentageWatched = action.payload;
    },
    setVideoIdOfcurrentVideo: (state, action) => {
      state.videoIdOfCurrentVideo = action.payload;
    },
    setFirstVideoId: (state, action) => {
      state.firstVideoId = action.payload;
    },
    setSearchValue: (state, action) => {
      state.searchValue = action.payload;
    },
    setSearchHistory: (state, action) => {
      state.searchHistory = action.payload;
    },
    setVideoTitle: (state, action) => {
      state.videoTitle = action.payload;
    },
    setPaymentSuccess: (state, action) => {
      state.paymentSuccess = action.payload;
    },
    // Add this to store full course data
    setCourseData: (state, action) => {
      state.courseData = action.payload;
    },
    clearPlanData: (state) => {
      state.planId = null;
      state.planType = null;
      state.planPrice = null;
      state.usdPrice = null;
      state.courseData = null; // Clear course data too
    },
  },
})

export const { 
  setVideoIdOfcurrentVideo,
  setVideoTitle, 
  setPaymentSuccess,
  setSearchValue,
  setSearchHistory,
  setVideoLevel,
  setIsIndia,
  clearPlanData,
  setCourseType,
  setShouldPlayFirstVideo,
  setUpdatedPercentageWatched,
  setSidebarTabIndex,
  setBeginnerFirstVideo,
  setCourseId,
  setFirstVideoId, 
  setPlanId, 
  setPlanPrice, 
  setPlanType,
  setUsdPrice, 
  setIntroductoryVideoscount,
  setBookmarkCount, 
  setSubmoduleId,
  setIsLocked,
  setCourseData // Export this new action
} = generalSlice.actions

export default generalSlice.reducer