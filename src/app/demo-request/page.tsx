'use client';

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DemoRequestPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isUserLoaded) {
      setLoading(false);
    }
  }, [isUserLoaded]);

  // Function to handle return to homepage
  const handleReturnHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 relative">
      {/* Return to Homepage button positioned at top left */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-slate-600"
          onClick={handleReturnHome}
        >
          <ArrowLeft className="h-4 w-4" /> 
          Return to Homepage
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-3xl w-full">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-slate-800">Welcome aboard!</CardTitle>
              <CardDescription className="text-xl mt-2">Let&apos;s get started with a personalized demo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center px-4 py-6">
                <p className="text-slate-600 mb-4">
                  Thank you for creating an account{user?.firstName ? `, ${user.firstName}` : ''}! Before you can access the full platform, 
                  we&apos;d like to provide you with a personalized demonstration of our services and help you get properly onboarded.
                </p>
                <p className="text-slate-600">
                  Please schedule a call with our team using the option below:
                </p>
              </div>

              <div className="flex justify-center">
                <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition-shadow max-w-md w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center text-emerald-700">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule a Demo Call
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      Book a 30-minute call with our experts to see how our platform can help your organization.
                    </p>
                    <a href="https://calendly.com/your-calendly-link" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Book a Time <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
                <h3 className="font-medium text-slate-800 mb-2">What to expect during your demo:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                  <li>Personalized walkthrough of the platform</li>
                  <li>Discussion of your specific business needs</li>
                  <li>Guidance on setting up your account</li>
                  <li>Explanation of our pricing plans and features</li>
                  <li>Opportunity to ask questions and get immediate answers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-slate-500 text-sm mt-6">
            Need immediate assistance? Contact us at <Link href="mailto:support@yourcompany.com" className="text-emerald-600 hover:underline">support@yourcompany.com</Link>
          </p>
        </div>
      </div>
    </div>
  );
}