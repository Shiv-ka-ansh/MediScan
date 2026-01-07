import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { googleAuth } from "../services/authService";
import { useState } from "react";

export const GoogleAuthButton = ({ mode = "login", role = "patient" }) => {
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      setError("");
      const data = await googleAuth(credentialResponse.credential, role);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google auth error:", err);
      setError(
        err.response?.data?.message ||
          "Google authentication failed. Please try again."
      );
    }
  };

  const handleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div className="w-full flex flex-col items-center">
      {error && (
        <p className="text-rose-400 text-sm mb-3 text-center animate-in slide-in-from-top-2">
          {error}
        </p>
      )}
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          size="large"
          shape="rectangular"
          text={mode === "login" ? "signin_with" : "signup_with"}
          width="300"
        />
      </div>
    </div>
  );
};
