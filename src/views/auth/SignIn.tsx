import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { mockUser } from "data/mockData";
import {
  Button,
  InputField,
  PageTransition,
  SurfaceCard,
} from "components/dashboard/ui";

export default function SignIn() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState(mockUser.email);
  const [password, setPassword] = useState("demo1234");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (user) {
      navigate("/admin/default");
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid work email.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    if (password.length < 6) {
      setError("Use the demo password or any value with at least 6 characters.");
      setLoading(false);
      return;
    }

    login(mockUser, remember ? "mock-session" : null);
    toast.success(`Welcome back, ${mockUser.full_name}.`);
    navigate("/admin/default");
    setLoading(false);
  };

  return (
    <PageTransition>
      <SurfaceCard className="overflow-hidden">
        <div className="border-b border-zinc-200 px-8 py-7">
          <h4 className="font-display text-[24px] font-semibold tracking-[-0.04em] text-zinc-950">
            Sign in to continue
          </h4>
          <p className="mt-2 text-[13px] leading-6 text-zinc-500">
            Access your workspace.
          </p>
        </div>

        <div className="space-y-5 px-8 py-7">
          <div className="grid gap-3 rounded-[8px] border border-blue-100 bg-blue-50 p-4 text-[13px] text-zinc-600">
            <div className="flex items-center justify-between gap-4">
              <span>Email</span>
              <span className="font-medium text-zinc-900">{mockUser.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Password</span>
              <span className="font-medium text-zinc-900">demo1234</span>
            </div>
          </div>

          {error ? (
            <div className="rounded-[6px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
            className="space-y-4"
          >
            <InputField
              label="Work email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul.sharma@pulseadmin.in"
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[13px] text-zinc-500">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-[4px] border-zinc-300 text-blue-600 focus:ring-blue-200"
                />
                Keep me signed in
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Enter dashboard"}
            </Button>
          </form>
        </div>
      </SurfaceCard>
    </PageTransition>
  );
}
