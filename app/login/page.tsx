"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

// Define the schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(50, { message: "Password must be less than 50 characters" }),
  rememberMe: z.boolean().optional(),
});

// Infer the type from the schema
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Simulate API call
    console.log("Form data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

    // Here you would typically make an API call to your backend
    // try {
    //   const response = await loginUser(data);
    //   console.log("Login successful:", response);
    // } catch (error) {
    //   console.error("Login failed:", error);
    // }

    reset(); // Reset form after submission
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log("Google login clicked");
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-full hidden md:inline-block relative">
        <Image
          src={"/images/dom-fou-YRMWVcdyhmI-unsplash.jpg"}
          alt=""
          fill
          className=" object-center object-cover bg-center bg-cover"
        />
      </div>

      <div className="w-full flex flex-col items-center justify-center p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="md:w-96 w-80 flex flex-col items-center justify-center"
          noValidate
        >
          <h2 className="text-4xl text-gray-900 font-medium">Sign in</h2>
          <p className="text-base text-gray-500/90 mt-3">
            Welcome back! Please sign in to continue
          </p>

          <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-gray-300/90"></div>
            <p className="w-full text-nowrap text-sm text-gray-500/90">
              Enter Staff details
            </p>
            <div className="w-full h-px bg-gray-300/90"></div>
          </div>

          {/* Email Input */}
          <div className="w-full mb-1">
            <div
              className={`flex items-center w-full bg-transparent border ${
                errors.email
                  ? "border-red-500 focus-within:border-red-500"
                  : "border-gray-300/60 focus-within:border-indigo-500"
              } h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors`}
            >
              <svg
                width="16"
                height="11"
                viewBox="0 0 16 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                  fill={errors.email ? "#EF4444" : "#6B7280"}
                />
              </svg>
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-6">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="w-full mb-1">
            <div
              className={`flex items-center mt-6 w-full bg-transparent border ${
                errors.password
                  ? "border-red-500 focus-within:border-red-500"
                  : "border-gray-300/60 focus-within:border-indigo-500"
              } h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors`}
            >
              <svg
                width="13"
                height="17"
                viewBox="0 0 13 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                  fill={errors.password ? "#EF4444" : "#6B7280"}
                />
              </svg>
              <input
                type="password"
                placeholder="Password"
                className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-6">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
            <div className="flex items-center gap-2">
              <input
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                type="checkbox"
                id="rememberMe"
                {...register("rememberMe")}
              />
              <label className="text-sm cursor-pointer" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <a
              className="text-sm underline hover:text-indigo-500 transition-colors"
              href="#"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <p className="text-gray-500/90 text-sm mt-4">
            Don&apos;t have an account?{" "}
            <a
              className="text-indigo-400 hover:text-indigo-500 hover:underline transition-colors"
              href="#"
            >
              Contact School Admin
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
