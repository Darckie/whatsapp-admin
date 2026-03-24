import React from "react";
import InputField from "components/fields/InputField";
import Checkbox from "components/checkbox";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    const { id, value, type, checked } = e.target || {};
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignUp = async () => {
    // e.preventDefault();

    // Reset error message
    setError("");

    // Validation
    if (!formData.full_name) {
      setError("Full name is required");
      return;
    }

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.termsAccepted) {
      setError("You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/sign-up", {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone || null,
      });

      if (response.data.success) {
        if (!response.data.user.email_verified) {
          toast(
            "Registered! Please check your email to verify your account.",
            { icon: "📧" }
          );
        } else {
          toast.success("Signed up successfully!");
        }
        login(response.data.user, response.data.token);
        // Navigate to dashboard
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        setError(response.data.message || "Sign up failed");
      }
    } catch (err: any) {
      const errorMessage =
       err.response?.data?.error +" : " + err.response?.data?.message || "Error creating account. Please try again.";
      setError(errorMessage);
      console.error("Sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-6 lg:items-center lg:justify-start">
      {/* Sign Up section */}
      <div className="mt-[6vh] w-full max-w-full flex-col items-center rounded-md p-16 bg-white">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-black">
          Create Account
        </h4>
        {error && (
          <div className="mb-6 w-full rounded-md bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="w-full">
          {/* Name */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Full Name*"
            placeholder="John Doe"
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
          />

          {/* Email */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Email*"
            placeholder="usermail@email.com"
            id="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Phone (Optional) */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Phone (Optional)"
            placeholder="+1 (555) 000-0000"
            id="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* Password */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Password*"
            placeholder="Min. 8 characters"
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Confirm Password */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Confirm Password*"
            placeholder="Re-enter your password"
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* Terms Checkbox */}
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex items-center">
              <Checkbox
                id="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <p className="ml-2 text-sm font-medium text-navy-700 dark:text-white">
                I agree to the{" "}
                <span className="text-brand-500 hover:text-brand-600 cursor-pointer">
                  Terms & Conditions
                </span>
              </p>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={() => handleSignUp()}
            disabled={loading}
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </div>

        {/* Back to Sign In */}
        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Already have an account?
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
