import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { MdCheckCircle, MdError, MdOutlineMailLock } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";

interface EmailVerificationProps {
  mode?: "link" | "wait"; // "link" for email link, "wait" for waiting screen
  email?: string;
}

export default function EmailVerification({ mode = "link", email: propEmail }: EmailVerificationProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const displayEmail = propEmail || user?.email || "your email";

  // Cooldown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle link-based verification
  useEffect(() => {
    if (mode !== "link") {
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setError("No verification token provided");
          setLoading(false);
          return;
        }

        const response = await api.post("/auth/verify-email", { token });

        if (response.data.success) {
          setVerified(true);
          toast.success("Email verified successfully!");
          setTimeout(() => {
            navigate("/auth/sign-in");
          }, 3000);
        } else {
          setError(response.data.message || "Email verification failed");
          toast.error(response.data.message || "Email verification failed");
        }
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || "Error verifying email";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, mode]);

  // Resend verification email
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    setVerifyLoading(true);
    try {
      const response = await api.post("/auth/resend-verification", {
        email: displayEmail,
      });

      if (response.data.success) {
        toast.success("Verification email sent! Check your inbox.");
        setResendCooldown(60);
      } else {
        toast.error(response.data.message || "Failed to resend verification email");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error resending verification email";
      toast.error(errorMessage);
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle code-based verification
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await api.post("/auth/verify-email-code", {
        email: displayEmail,
        code: verificationCode,
      });

      if (response.data.success) {
        toast.success("Email verified successfully!");
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } else {
        toast.error(response.data.message || "Invalid verification code");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error verifying email";
      toast.error(errorMessage);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/sign-in");
  };

  // Waiting mode - show before email is verified after login
  if (mode === "wait") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 rounded-full blur-lg opacity-50"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600">
                <MdOutlineMailLock className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-2xl font-bold text-navy-700 dark:text-white mb-2">
            Verify Your Email
          </h1>

          {/* Subtitle */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">
            We've sent a verification link to{" "}
            <strong className="text-navy-700 dark:text-white">{displayEmail}</strong>
          </p>

          {/* Information Box */}
          <div className="mb-6 rounded-lg bg-blue-50 dark:bg-navy-800 p-4 border border-blue-200 dark:border-navy-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              📧 Check your email inbox (and spam folder) for the verification link. Click on it to activate your account.
            </p>
          </div>

          {/* Verification Code Input (Optional) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Or enter verification code (if you received one)
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="w-full px-4 py-3 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white transition-all"
            />
          </div>

          {/* Verify Button */}
          {verificationCode.trim() && (
            <button
              onClick={handleVerifyCode}
              disabled={verifyLoading}
              className="w-full mb-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
              {verifyLoading ? "Verifying..." : "Verify Email"}
            </button>
          )}

          {/* Resend Link */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Didn't receive the email?
            </p>
            <button
              onClick={handleResendVerification}
              disabled={verifyLoading || resendCooldown > 0}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Verification Email"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-full bg-gray-300 dark:bg-navy-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">OR</p>
            <div className="h-px w-full bg-gray-300 dark:bg-navy-600" />
          </div>

          {/* Help Text */}
          <div className="text-center text-xs text-gray-600 dark:text-gray-400 mb-4">
            <p>
              If you continue to have issues, please{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                contact support
              </a>
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-gray-300 dark:border-navy-600 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-navy-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Link-based verification mode
  return (
    <div className="flex h-screen w-full items-center justify-center px-2 md:mx-0 md:px-0">
      <div className="w-full max-w-md rounded-md p-8 bg-white text-center">
        {loading && (
          <>
            <div className="mb-4 text-6xl text-brand-500 flex justify-center">
              ⏳
            </div>
            <h4 className="mb-2.5 text-2xl font-bold text-navy-700">
              Verifying Email...
            </h4>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {verified && !loading && (
          <>
            <MdCheckCircle className="mb-4 text-6xl text-green-500 mx-auto" />
            <h4 className="mb-2.5 text-2xl font-bold text-navy-700">
              Email Verified!
            </h4>
            <p className="mb-6 text-gray-600">
              Your email has been verified successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to sign in page...
            </p>
          </>
        )}

        {error && !loading && (
          <>
            <MdError className="mb-4 text-6xl text-red-500 mx-auto" />
            <h4 className="mb-2.5 text-2xl font-bold text-navy-700">
              Verification Failed
            </h4>
            <p className="mb-6 text-gray-600">{error}</p>
            <button
              onClick={() => navigate("/auth/sign-up")}
              className="linear w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600"
            >
              Back to Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
