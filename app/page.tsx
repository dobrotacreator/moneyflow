"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Play, Pause, RotateCcw, Zap, Clock, TrendingUp } from "lucide-react";
import Image from "next/image";

interface Celebrity {
  id: string;
  name: string;
  emoji: string;
  title: string;
  salaryPerSecond: number;
  totalEarned: number;
  timeElapsed: number;
  speedMultiplier: number;
  isActive: boolean;
  image: string;
}

const initialCelebrities: Celebrity[] = [
  {
    id: "musk",
    name: "Elon Musk",
    emoji: "🚀",
    title: "Tesla & SpaceX CEO",
    salaryPerSecond: 6944,
    totalEarned: 0,
    timeElapsed: 0,
    speedMultiplier: 1,
    isActive: false,
    image: "/images/elon_musk.jpg",
  },
  {
    id: "bezos",
    name: "Jeff Bezos",
    emoji: "📦",
    title: "Amazon Founder",
    salaryPerSecond: 4630,
    totalEarned: 0,
    timeElapsed: 0,
    speedMultiplier: 1,
    isActive: false,
    image: "/images/jeff_bezos.jpg",
  },
  {
    id: "gates",
    name: "Bill Gates",
    emoji: "💻",
    title: "Microsoft Founder",
    salaryPerSecond: 3472,
    totalEarned: 0,
    timeElapsed: 0,
    speedMultiplier: 1,
    isActive: false,
    image: "/images/bill_gates.jpeg",
  },
  {
    id: "buffett",
    name: "Warren Buffett",
    emoji: "📈",
    title: "Investment Legend",
    salaryPerSecond: 3333,
    totalEarned: 0,
    timeElapsed: 0,
    speedMultiplier: 1,
    isActive: false,
    image: "/images/warren_buffett.jpeg",
  },
  {
    id: "zuckerberg",
    name: "Mark Zuckerberg",
    emoji: "👤",
    title: "Meta CEO",
    salaryPerSecond: 3125,
    totalEarned: 0,
    timeElapsed: 0,
    speedMultiplier: 1,
    isActive: false,
    image: "/images/mark_zuckerberg.jpg",
  },
];

// Local storage keys
const STORAGE_KEY = "moneyflow-data";
const SELECTED_KEY = "moneyflow-selected";
const IMAGE_ERRORS_KEY = "moneyflow-image-errors";

export default function MoneyFlow() {
  const [celebrities, setCelebrities] =
    useState<Celebrity[]>(initialCelebrities);
  const [selectedId, setSelectedId] = useState<string>("musk");
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const selectedCelebrity = celebrities.find((c) => c.id === selectedId)!;

  // Handle image loading errors - only set error once
  const handleImageError = useCallback((celebrityId: string) => {
    setImageErrors((prev) => {
      if (prev[celebrityId]) return prev; // Already marked as error
      const newErrors = { ...prev, [celebrityId]: true };
      // Save to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(IMAGE_ERRORS_KEY, JSON.stringify(newErrors));
        } catch (error) {
          console.error("Error saving image errors to localStorage:", error);
        }
      }
      return newErrors;
    });
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const savedSelected = localStorage.getItem(SELECTED_KEY);
        const savedImageErrors = localStorage.getItem(IMAGE_ERRORS_KEY);

        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Merge saved data with initial data to preserve image paths
          const mergedData = parsedData.map((saved: Celebrity) => {
            const initial = initialCelebrities.find((c) => c.id === saved.id);
            return {
              ...saved,
              image: initial?.image || saved.image, // Keep original image path
            };
          });
          setCelebrities(mergedData);
        }

        if (savedSelected) {
          setSelectedId(savedSelected);
        }

        if (savedImageErrors) {
          setImageErrors(JSON.parse(savedImageErrors));
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save data to localStorage whenever celebrities state changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(celebrities));
      } catch (error) {
        console.error("Error saving data to localStorage:", error);
      }
    }
  }, [celebrities, isLoaded]);

  // Save selected celebrity to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(SELECTED_KEY, selectedId);
      } catch (error) {
        console.error(
          "Error saving selected celebrity to localStorage:",
          error,
        );
      }
    }
  }, [selectedId, isLoaded]);

  // Fixed timer logic
  const updateCelebrity = useCallback((id: string) => {
    setCelebrities((prev) =>
      prev.map((c) => {
        if (c.id === id && c.isActive) {
          return {
            ...c,
            totalEarned: c.totalEarned + c.salaryPerSecond * c.speedMultiplier,
            timeElapsed: c.timeElapsed + c.speedMultiplier,
          };
        }
        return c;
      }),
    );
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Clear all existing intervals
    Object.values(intervalRefs.current).forEach(clearInterval);
    intervalRefs.current = {};

    // Start new intervals for active celebrities
    celebrities.forEach((celebrity) => {
      if (celebrity.isActive) {
        intervalRefs.current[celebrity.id] = setInterval(() => {
          updateCelebrity(celebrity.id);
        }, 1000);
      }
    });

    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, [
    celebrities.map((c) => `${c.id}-${c.isActive}`).join(","),
    updateCelebrity,
    isLoaded,
  ]);

  const toggleCelebrity = (id: string) => {
    setCelebrities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );
  };

  const changeSpeed = (id: string, multiplier: number) => {
    setCelebrities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, speedMultiplier: multiplier } : c,
      ),
    );
  };

  const resetCelebrity = (id: string) => {
    setCelebrities((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, totalEarned: 0, timeElapsed: 0, isActive: false }
          : c,
      ),
    );
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Memoized component for celebrity image with stable fallback
  const CelebrityImage = useMemo(() => {
    return function CelebrityImageComponent({
      celebrity,
      width,
      height,
      className,
    }: {
      celebrity: Celebrity;
      width: number;
      height: number;
      className?: string;
    }) {
      // If image is marked as error, show fallback immediately
      if (imageErrors[celebrity.id]) {
        return (
          <div
            className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold`}
            style={{ width, height, fontSize: width < 50 ? "12px" : "16px" }}
          >
            {celebrity.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        );
      }

      return (
        <Image
          src={celebrity.image || "/placeholder.svg"}
          alt={celebrity.name}
          width={width}
          height={height}
          className={className}
          onError={() => handleImageError(celebrity.id)}
          unoptimized
          priority={celebrity.id === selectedId}
        />
      );
    };
  }, [imageErrors, handleImageError, selectedId]);

  // Memoized select items to prevent re-rendering
  const selectItems = useMemo(() => {
    return celebrities.map((celebrity) => (
      <SelectItem
        key={celebrity.id}
        value={celebrity.id}
        className="h-16 cursor-pointer"
      >
        <div className="flex items-center gap-3 w-full">
          <CelebrityImage
            celebrity={celebrity}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="font-medium">
              {celebrity.emoji} {celebrity.name}
            </div>
            <div className="text-xs text-gray-600">{celebrity.title}</div>
          </div>
          {celebrity.isActive && (
            <Badge className="bg-green-500/20 text-green-700 border-green-300">
              <Play className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </SelectItem>
    ));
  }, [celebrities, CelebrityImage]);

  // Don't render until data is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <div className="text-xl text-gray-600">Loading MoneyFlow...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-300/20 to-emerald-300/20 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header - Fixed responsive design */}
        <div className="text-center mb-12">
          <div className="float-animation">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight py-2 px-2">
              💰 MoneyFlow
            </h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-3 font-medium px-4">
            Ever wondered how fast billionaires make money? 🤑
          </p>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Watch their wealth grow in real-time! ⏰✨
          </p>
        </div>

        {/* Celebrity Selection */}
        <div className="mb-8 max-w-md mx-auto">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full h-16 text-lg glass bg-white/70 border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <CelebrityImage
                  celebrity={selectedCelebrity}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-bold">
                    {selectedCelebrity.emoji} {selectedCelebrity.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedCelebrity.title}
                  </div>
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="glass bg-white/90">
              {selectItems}
            </SelectContent>
          </Select>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Earnings Display */}
          <Card
            className={`glass bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/30 shadow-xl ${selectedCelebrity.isActive ? "pulse-glow" : ""}`}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-4 mb-4">
                <CelebrityImage
                  celebrity={selectedCelebrity}
                  width={80}
                  height={80}
                  className="rounded-full shadow-lg object-cover"
                />
                <div>
                  <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedCelebrity.emoji} {selectedCelebrity.name}
                  </CardTitle>
                  <p className="text-gray-600 font-medium text-sm sm:text-base">
                    {selectedCelebrity.title}
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base sm:text-lg px-4 py-2">
                ${selectedCelebrity.salaryPerSecond.toLocaleString()}/sec
              </Badge>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  {formatMoney(selectedCelebrity.totalEarned)}
                </div>
                <p className="text-gray-600 text-base sm:text-lg font-medium flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Total Earned 💸
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-3 flex items-center justify-center gap-3">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10" />
                  {formatTime(selectedCelebrity.timeElapsed)}
                </div>
                <p className="text-gray-600 text-base sm:text-lg font-medium">
                  Time Elapsed ⏱️
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50">
                <div className="text-xl sm:text-2xl text-orange-600 mb-2 font-bold">
                  Speed: {selectedCelebrity.speedMultiplier}x ⚡
                </div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  Earning $
                  {(
                    selectedCelebrity.salaryPerSecond *
                    selectedCelebrity.speedMultiplier
                  ).toLocaleString()}
                  /sec
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="glass bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-purple-200/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Controls 🎮
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Start/Stop */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-700">
                  Money Machine 💰
                </h3>
                <Button
                  onClick={() => toggleCelebrity(selectedId)}
                  className={`w-full text-lg sm:text-xl py-6 sm:py-8 font-bold shadow-lg transition-all duration-300 ${
                    selectedCelebrity.isActive
                      ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-200"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-200"
                  }`}
                >
                  {selectedCelebrity.isActive ? (
                    <>
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                      Pause Earning 🛑
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                      Start Earning 🚀
                    </>
                  )}
                </Button>
              </div>

              {/* Speed Controls */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-700">
                  Time Speed ⚡
                </h3>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {[1, 5, 10, 100].map((speed) => (
                    <Button
                      key={speed}
                      onClick={() => changeSpeed(selectedId, speed)}
                      variant={
                        selectedCelebrity.speedMultiplier === speed
                          ? "default"
                          : "outline"
                      }
                      className={`h-14 sm:h-16 font-bold transition-all duration-300 flex items-center justify-center gap-1 ${
                        selectedCelebrity.speedMultiplier === speed
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200"
                          : "glass bg-white/70 hover:bg-white/90 border-gray-200"
                      }`}
                    >
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm leading-none">
                        {speed}x
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Spend Money 💸
                </h3>
                <Button
                  onClick={() => resetCelebrity(selectedId)}
                  className="w-full text-xl py-8 font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-200 transition-all duration-300"
                >
                  <RotateCcw className="w-6 h-6 mr-3" />
                  Spend it all! 🛍️
                </Button>
                <p className="text-sm text-gray-600 mt-3 text-center font-medium">
                  Resets money and time for current person
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600">
          <div className="glass bg-white/50 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="mb-3 text-lg font-medium">
              💡 Fun fact: These are estimated earnings based on net worth
              growth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
