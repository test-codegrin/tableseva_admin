"use client";

import { useState } from "react";
import { authApi } from "../api/authApi";
import type { RegisterPayload } from "../types/dataTypes";

import {
  toast,
  Button,
  Card,
  CardHeader,
  CardFooter,
  Input,
  Label,
} from "@heroui/react";

import { Icon, ICONS } from "../config/icons";   // ← single import for all icons
import { useNavigate } from "react-router-dom";

const emptyForm: RegisterPayload = {
  name: "",
  subdomain: "",
  email: "",
  password: "",
  razorpay_key_id: "",
  razorpay_key_secret: "",
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterPayload>(emptyForm);

  const handleChange = (field: keyof RegisterPayload, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast("Missing Fields", {
        description: "Please fill in all required fields.",
        variant: "default",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authApi(formData);
      console.log(res);

      toast("Account Created", {
        description: "Admin account created successfully! Please sign in.",
        variant: "default",
      });

      setFormData(emptyForm);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Registration Failed";
      toast("Registration Failed", {
        description: message,
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl p-0">
        {/* Header */}
        <CardHeader className="flex flex-col items-start px-6 pt-6 pb-3">
          <h2 className="text-xl font-semibold">Create Admin Account</h2>
          <p className="text-sm">Start managing TableSeva today</p>
        </CardHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="flex md:flex-row flex-col gap-5">
            {/* Restaurant Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Restaurant Name
              </Label>
              <div className="relative flex items-center">
                <Icon
                  icon={ICONS.store}
                  width={18}
                  className="text-default-400 absolute left-3 pointer-events-none"
                />
                <Input
                  id="name"
                  placeholder="e.g. TableSeva Centre"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Subdomain */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="subdomain" className="text-sm font-medium">
                Subdomain
              </Label>
              <div className="relative flex items-center">
                <Icon
                  icon={ICONS.web}
                  width={18}
                  className="text-default-400 absolute left-3 pointer-events-none"
                />
                <Input
                  id="subdomain"
                  placeholder="tableseva.com"
                  value={formData.subdomain}
                  onChange={(e) => handleChange("subdomain", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Admin Email
            </Label>
            <div className="relative flex items-center">
              <Icon
                icon={ICONS.email}
                width={18}
                className="text-default-400 absolute left-3 pointer-events-none"
              />
              <Input
                id="email"
                placeholder="tableseva@gmail.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="password" className="text-sm font-medium">
              Security Password
            </Label>
            <div className="relative w-full">
              <Icon
                icon={ICONS.lock}
                width={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 pointer-events-none"
              />
              <Input
                id="password"
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <Icon
                  icon={showPassword ? ICONS.eyeOff : ICONS.eyeOn}
                  width={18}
                  className="text-default-400"
                />
              </button>
            </div>
          </div>

          {/* Payment Section */}
          <div className="pt-1 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-default-600">
              <Icon icon={ICONS.payments} width={18} />
              Payment Configuration
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="razorpay_key_id" className="text-sm font-medium">
                Razorpay Key ID
              </Label>
              <Input
                id="razorpay_key_id"
                placeholder="rzp_live_..."
                value={formData.razorpay_key_id}
                onChange={(e) => handleChange("razorpay_key_id", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="razorpay_key_secret" className="text-sm font-medium">
                Razorpay Key Secret
              </Label>
              <Input
                id="razorpay_key_secret"
                placeholder="Enter key secret"
                value={formData.razorpay_key_secret}
                onChange={(e) =>
                  handleChange("razorpay_key_secret", e.target.value)
                }
              />
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full text-white bg-success"
            onPress={handleSubmit}
            isDisabled={loading}
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
            {!loading && <Icon icon={ICONS.arrowRight} width={18} />}
          </Button>
        </div>

        <CardFooter className="justify-center px-6 py-4">
          <p className="text-sm text-default-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-success cursor-pointer font-medium hover:underline"
            >
              Login here
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}