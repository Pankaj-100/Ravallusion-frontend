"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Backarrow, Time } from "@/lib/svg_icons";
import QuizQuit from "./QuizQuit";
import QuizResult from "./QuizResult";
import { 
  useGetQuizQuery,
  useGetQuizQuestionsQuery, 
  useSaveQuestionResponseMutation,
  useSubmitQuizMutation,
  useGetQuizResultQuery
} from "@/store/Api/quizApi";

const QuizScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const fullscreenRef = useRef(null);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenExited, setFullscreenExited] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [fullscreenRequested, setFullscreenRequested] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [exitWarningCount, setExitWarningCount] = useState(0);

  // API hooks
  const { data: quizData, isLoading: quizLoading } = useGetQuizQuery(videoId);
  const { data: questionsData, isLoading: questionsLoading } = useGetQuizQuestionsQuery(quizId, {
    skip: !quizId,
  });
  
  const [saveQuestionResponse] = useSaveQuestionResponseMutation();
  const [submitQuiz] = useSubmitQuizMutation();
  const { data: resultData, refetch: refetchResult } = useGetQuizResultQuery(
    { videoId, quizId },
    {
      skip: !showResult || !videoId || !quizId,
    }
  );

  // Set quiz ID when quiz data is loaded
  useEffect(() => {
    if (quizData?.quiz?._id) {
      setQuizId(quizData.quiz._id);
      setTimeLeft(quizData.quiz.duration * 60);
    }
  }, [quizData]);

  // Fullscreen functions
  const enterFullscreen = async () => {
    const element = fullscreenRef.current;
    if (!element) return;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setFullscreenRequested(true);
      setIsFullscreen(true);
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const handleFullscreenExit = () => {
    if (!showResult && !fullscreenExited) {
      // Show warning on first exit attempt
      if (exitWarningCount === 0) {
        setShowExitWarning(true);
        setExitWarningCount(1);
        // Re-enter fullscreen after showing warning
        setTimeout(() => {
          enterFullscreen();
        }, 100);
      } else {
        // Auto-submit on second exit attempt
        setFullscreenExited(true);
        handleSubmit();
      }
    }
  };

  const handleContinueQuiz = () => {
    setShowExitWarning(false);
    enterFullscreen();
  };

  const handleExitAndSubmit = () => {
    setShowExitWarning(false);
    setFullscreenExited(true);
    handleSubmit();
  };

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = !!document.fullscreenElement;
      setIsFullscreen(fullscreenElement);
      
      if (!fullscreenElement && !showResult && !fullscreenExited && !showExitWarning) {
        handleFullscreenExit();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [showResult, fullscreenExited, showExitWarning]);

  // Request fullscreen on component mount
  useEffect(() => {
    if (!fullscreenRequested && !showResult) {
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [fullscreenRequested, showResult]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen && !showResult && !fullscreenExited && !showExitWarning) {
        e.preventDefault();
        handleFullscreenExit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showResult, fullscreenExited, showExitWarning]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 && !showResult && !fullscreenExited) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((time) => time - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResult, fullscreenExited]);

  // Persistence
  useEffect(() => {
    const savedState = localStorage.getItem(`quiz-${videoId}`);
    if (savedState) {
      const { answers: savedAnswers, currentQuestion: savedQ, timeLeft: savedTime, skipped: savedSkipped } = JSON.parse(savedState);
      setAnswers(savedAnswers || {});
      setCurrentQuestion(savedQ || 0);
      setTimeLeft(savedTime || (quizData?.quiz?.duration || 15) * 60);
      setSkippedQuestions(new Set(savedSkipped || []));
    }
  }, [videoId, quizData]);

  useEffect(() => {
    const stateToSave = {
      answers,
      currentQuestion,
      timeLeft,
      skipped: Array.from(skippedQuestions)
    };
    localStorage.setItem(`quiz-${videoId}`, JSON.stringify(stateToSave));
  }, [answers, currentQuestion, timeLeft, skippedQuestions, videoId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (optionId) => {
    const questionId = questionsData?.quiz[currentQuestion]?._id;
    
    if (questionId && quizId) {
      try {
        await saveQuestionResponse({
          question: questionId,
          quiz: quizId,
          answer: optionId
        }).unwrap();
      } catch (error) {
        console.error("Failed to save question response:", error);
      }
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }));
    
    if (skippedQuestions.has(currentQuestion)) {
      const newSkipped = new Set(skippedQuestions);
      newSkipped.delete(currentQuestion);
      setSkippedQuestions(newSkipped);
    }
  };

  const handleSkip = () => {
    const newSkipped = new Set(skippedQuestions);
    newSkipped.add(currentQuestion);
    setSkippedQuestions(newSkipped);
    
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion];
    setAnswers(newAnswers);
    
    if (currentQuestion < (questionsData?.quiz?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < (questionsData?.quiz?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionNav = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    if (showResult || fullscreenExited || !quizId) return;
    
    try {
      const result = await submitQuiz({ quiz: quizId }).unwrap();
      
      if (result.success) {
        setQuizScore(result.score?.correctAnswers || 0);
        localStorage.removeItem(`quiz-${videoId}`);
        setShowResult(true);
        
        // Refetch result data with error handling
        try {
          await refetchResult();
        } catch (refetchError) {
          console.error("Failed to refetch result:", refetchError);
        }
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  const handleQuitConfirm = () => {
    localStorage.removeItem(`quiz-${videoId}`);
    
    const exitFullscreenAndNavigate = () => {
      if (document.fullscreenElement) {
        exitFullscreen();
        setTimeout(() => {
          router.back();
        }, 100);
      } else {
        router.back();
      }
    };

    exitFullscreenAndNavigate();
  };

  const handleRetryQuiz = () => {
    setAnswers({});
    setSkippedQuestions(new Set());
    setCurrentQuestion(0);
    setTimeLeft((quizData?.quiz?.duration || 15) * 60);
    setShowResult(false);
    setFullscreenExited(false);
    setFullscreenRequested(false);
    setExitWarningCount(0);
    
    setTimeout(() => {
      enterFullscreen();
    }, 100);
  };

  const handleBackToCourse = () => {
    localStorage.removeItem(`quiz-${videoId}`);
    
    if (document.fullscreenElement) {
      exitFullscreen();
      setTimeout(() => {
        router.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
      }, 100);
    } else {
      router.push(`/dashboard/player-dashboard/beginner?videoId=${videoId}`);
    }
  };

  const isAnswered = (index) => answers.hasOwnProperty(index);
  const isSkipped = (index) => skippedQuestions.has(index);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questionsData?.quiz?.length || 0;
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  if (quizLoading || questionsLoading) {
    return (
      <div className="fixed inset-0 bg-[#0F1620] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!questionsData?.quiz || questionsData.quiz.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0F1620] flex items-center justify-center">
        <div className="text-white text-center">
          <p>No questions available for this quiz.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={fullscreenRef}
      className="fixed inset-0 bg-[#0F1620] text-white z-50 overflow-auto"
    >
      {/* Header */}
      <div className="bg-[#181F2B] px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowQuitConfirm(true)}
              className="text-gray-400 hover:text-white transition"
            >
              <Backarrow />
            </button>
            <div>
              <h1 className="text-xl font-semibold">{quizData?.quiz?.title || "Quiz"}</h1>
              <p className="text-sm text-[#C0CFFB]">
                Premiere Pro &nbsp; • &nbsp; 
                <span className="text-[#F9D13E]"> &nbsp; Module 1</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#F9D13E]">
              <Time />
              <span className="font-medium">{formatTime(timeLeft)} Left</span>
            </div>
            
            {!isFullscreen && !showResult && (
              <button
                onClick={enterFullscreen}
                className="px-4 py-2 rounded-lg bg-[#1A2234] hover:bg-[#222B3C] transition font-medium"
              >
                Enter Fullscreen
              </button>
            )}
            
            <button
              onClick={() => setShowQuitConfirm(true)}
              className="px-4 py-2 rounded-lg bg-[#1A2234] hover:bg-[#222B3C] transition font-medium"
            >
              Quit
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#181F2B] px-6 py-2">
        <div className="w-full bg-[#FFFFFF1F] rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#FFEA47] to-[#FFEA47] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-sm my-2">
          <span>{answeredCount} of {totalQuestions} Answered</span>
          <span>{progressPercentage}% Completed</span>
        </div>
      </div>

      {/* Main Content */}
      {!showResult && !showExitWarning ? (
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Question Section */}
            <div className="lg:col-span-2">
              <div className="bg-[#111827] rounded-2xl p-8 border border-[#FFFFFF1F] h-full shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                {/* Question Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#FAE74B26]/35 text-[#FFEA47] text-sm font-semibold px-3 py-1 rounded-md">
                    Question {currentQuestion + 1}
                  </div>
                </div>

                {/* Question Text */}
                <h2 className="text-white text-[20px] font-semibold mb-8 leading-relaxed">
                  {questionsData.quiz[currentQuestion]?.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {questionsData.quiz[currentQuestion]?.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer 
                        ${
                          answers[currentQuestion] === option.text
                            ? "border-[#5B68E9] bg-[#1C2332]"
                            : "border-[#1F2937] bg-[#1C2332] hover:border-[#5B68E9]/80"
                        }`}
                      onClick={() => handleAnswerSelect(option.text)}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 
                          ${
                            answers[currentQuestion] === option.text
                              ? "border-[#5B68E9] bg-[#5B68E9]"
                              : "border-[#5B68E9]"
                          }`}
                      >
                        {answers[currentQuestion] === option.text && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-200 text-[16px] font-medium">{option.text}</span>
                    </label>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end gap-4 mt-10">
                  <div className="flex gap-4">
                    <button
                      onClick={handleSkip}
                      className="px-6 py-3 rounded-lg border border-[#5B68E9] text-[#5B68E9] font-medium hover:bg-[#1C2332] transition"
                    >
                      Skip question
                    </button>

                    <button
                      onClick={currentQuestion === totalQuestions - 1 ? handleSubmit : handleNext}
                      disabled={!answers[currentQuestion]}
                      className={`px-6 py-3 rounded-lg font-medium transition 
                        ${
                          !answers[currentQuestion]
                            ? "bg-[#2C68F6]/25 text-[#2C68F6]"
                            : "bg-[#2C68F6]/25 text-[#2C68F6]"
                        }`}
                    >
                      {currentQuestion === totalQuestions - 1 ? "Submit" : "Save & Next"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="lg:col-span-1 flex">
              <div className="bg-[#111827] rounded-2xl p-6 border border-[#FFFFFF1F] shadow-[0_4px_12px_rgba(0,0,0,0.25)] flex flex-col justify-between w-full h-full min-h-[550px]">
                <div>
                  <h3 className="text-white text-[16px] font-semibold mb-6">Question Navigation</h3>

                  {/* Status Legend */}
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2C68F6]"></div>
                      <span className="text-gray-300">Attempted</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F5A524]"></div>
                      <span className="text-gray-300">Skipped</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6B7280]"></div>
                      <span className="text-gray-300">Not Attempted</span>
                    </div>
                  </div>

                  <div className="border-t border-[#FFFFFF1F] my-4"></div>

                  {/* Question Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {questionsData.quiz.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionNav(index)}
                        className={`aspect-square rounded-md font-medium text-sm flex items-center justify-center transition-all duration-200 
                          ${
                            currentQuestion === index
                              ? "border-2 border-[#5B68E9] text-white bg-transparent"
                              : isAnswered(index)
                              ? "bg-[#2537DC40]/35 text-[#2C68F6]"
                              : isSkipped(index)
                              ? "bg-[#FE9A00]/25 text-[#FE9A00]"
                              : "bg-[#1F2937] text-gray-400"
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Exit Fullscreen Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] rounded-2xl p-8 max-w-md w-full border border-[#FFFFFF1F] shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                Warning: Fullscreen Exit Detected
              </h3>
              
              <p className="text-gray-300 mb-6">
                Exiting fullscreen mode will automatically submit your quiz. 
                {exitWarningCount === 1 && " If you exit again, your quiz will be submitted automatically."}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleContinueQuiz}
                  className="px-6 py-3 bg-[#2C68F6] text-white rounded-lg font-medium hover:bg-[#1e50c5] transition"
                >
                  Continue Quiz
                </button>
                
                <button
                  onClick={handleExitAndSubmit}
                  className="px-6 py-3 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-500 hover:text-white transition"
                >
                  Exit & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <QuizQuit
          onConfirm={handleQuitConfirm}
          onCancel={() => setShowQuitConfirm(false)}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
        />
      )}

      {/* Results Modal */}
      {showResult && (
        <QuizResult
          score={quizScore}
          totalQuestions={totalQuestions}
          timeSpent={`${quizData?.quiz?.duration || 15} Mins`}
          attemptsLeft={resultData?.result?.[0]?.remainingAttempts || (quizData?.quiz?.attempt - 1)}
          onRetry={handleRetryQuiz}
          onBackToCourse={handleBackToCourse}
          fullscreenExited={fullscreenExited}
          resultData={resultData}
        />
      )}
    </div>
  );
};

export default QuizScreen;