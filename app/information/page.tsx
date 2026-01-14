"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getSessionData } from "@/lib/counterbalance"
import { getFirstRoute } from "@/lib/navigation"
import { getProgressValue } from "@/app/utils/sessionProgress"

export default function InformationPage() {
  const router = useRouter()
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    // Verify session exists
    const session = getSessionData();
    if (!session) {
      console.error("No session found, redirecting to consent");
      router.push('/consent');
      return;
    }

    if (!session.conditionOrder || session.conditionOrder.length === 0) {
      console.error("No condition order found, redirecting to consent");
      router.push('/consent');
      return;
    }
  }, [router]);

  // Timer effect - 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!canContinue) return;
    const session = getSessionData();
    if (session) {
      const firstRoute = getFirstRoute(session.conditionOrder);
      router.push(firstRoute);
    } else {
      console.error("No session found");
      router.push('/consent');
    }
  }

  // Calculate progress
  const progressValue = getProgressValue('information');

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* Progress Bar */}
      <div className="mb-6 mx-auto max-w-4xl">
        <Progress value={progressValue} className="w-full h-2" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Progress: {progressValue}%
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-8">
          <div className="text-center space-y-4">
            <p className="text-lg sm:text-xl leading-relaxed max-w-xl">
              Next, you will be presented with two different descriptions of people. For both descriptions,
              you will read about the person, answer some questions, and then place that person in a group.
            </p>
            <p className="text-lg sm:text-xl leading-relaxed max-w-xl">
            <strong>Remember, you will read about two different people!</strong>
            </p>
          </div>

          <Button
            className={`w-48 h-16 text-xl mt-4 ${
              canContinue
                ? "bg-[#c1e6c1] hover:bg-[#a8dba8] text-black"
                : "bg-gray-400 cursor-not-allowed text-white"
            }`}
            style={{ opacity: canContinue ? 1 : 0.5 }}
            variant="secondary"
            onClick={canContinue ? handleContinue : undefined}
            disabled={!canContinue}
          >
            Continue
          </Button>
          {!canContinue && (
            <p className="text-sm text-gray-500 mt-2">
              Please read the instructions carefully. The button will become available soon.
            </p>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
