import React from "react";
import InputField from "components/fields/InputField";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../lib/api";
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {


    // Reset messages
    setError("");

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });

      if (response.data.success) {
        setSuccess(true);
        setEmail("");
        // Optionally navigate after a delay
        setTimeout(() => {
          navigate("/auth/sign-in");
        }, 3000);
      } else {
        setError(response.data.message || "Error sending reset link");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error sending reset link. Please try again.";
      setError(errorMessage);
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-6 lg:items-center lg:justify-start">
      {/* Forgot Password section */}
      <div className="mt-[10vh] w-full max-w-full flex-col items-center rounded-md p-16 bg-white">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-black">
          Forgot Password
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your registered email and we'll send you reset instructions.
        </p>

        {error && (
          <div className="mb-6 w-full rounded-md bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 w-full rounded-md bg-green-100 p-3 text-green-700">
            Reset link has been sent to your email. Redirecting to sign in...
          </div>
        )}

        <form  className="w-full">
          {/* Email Field */}
          <InputField
            variant="auth"
            extra="mb-6"
            label="Email*"
            placeholder="usermail@email.com"
            id="email"
            type="text"
            value={email}
            onChange={(e:any) => setEmail(e.target.value)}
          />

          {/* Reset Button */}
          <button
             onClick={()=>handleReset()}
            disabled={loading}
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-4 text-center">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Remember your password?
          </span>
          <button
            onClick={() => navigate("/auth/sign-in")}
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
