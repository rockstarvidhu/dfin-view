import React, { useState, useEffect } from "react";

// Types
interface LoginResponse {
  id: string;
  // Add other response fields as needed
}

// Constants
export const API_URL = "https://novis-api-development.dappgenie.io";
export const DEFAULT_USER_ID = "678892771483c1763703ac5f";


const YELLOW_COLOR = "#FFCB84";
const RED_THEME_COLOR = "#C62127";
const SECONDARY_COLOR = "#FFFFFF";
const CARD_BORDER_COLOR = "#D6D6D6";

// Toast Component (Simple implementation)
const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  show: boolean;
  onClose: () => void;
}> = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

// API Service (Simplified)
class ApiService {
  async mobileLogin(payload: { companyCode?: string; deviceId: string }) {
    try {
      const response = await fetch(`${API_URL}/auth/mobile-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// Storage utilities (using localStorage for web)
const storage = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  getItem: (key: string) => {
    return localStorage.getItem(key);
  },
};

// Main Login Component
const Login: React.FC = () => {
  const [isSubmitBtnActive, setIsSubmitBtnActive] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const apiService = new ApiService();

  // Generate a simple device ID for web
  const generateDeviceId = () => {
    const userAgent = navigator.userAgent;
    const timestamp = Date.now().toString();
    return `web-${btoa(userAgent).slice(0, 10)}-${timestamp.slice(-6)}`;
  };

  // Initialize device ID
  useEffect(() => {
    let storedDeviceId = storage.getItem("device-id");
    if (!storedDeviceId) {
      storedDeviceId = generateDeviceId();
      storage.setItem("device-id", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  // Guest login function (Dfin default login)
  const guestLogin = async () => {
    try {
      // Use default Dfin user ID for guest login
      storage.setItem("user-id", DEFAULT_USER_ID);
      storage.setItem("user-data", JSON.stringify({ id: DEFAULT_USER_ID, type: "guest" }));

      showToast("Login successful. Welcome to Dfin!", "success");

      // Redirect to home page
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      showToast("Unable to log in. Please try again later.", "error");
      console.error("Guest login failed:", error);
    }
  };

  // Login with company code
  const login = async () => {
    if (!deviceId) return;

    const payload = {
      companyCode,
      deviceId,
    };

    try {
      const data: LoginResponse = await apiService.mobileLogin(payload);
      
      // Store user data
      storage.setItem("user-id", data.id);
      storage.setItem("user-data", JSON.stringify(data));

      showToast("Login successful. Welcome back!", "success");
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      showToast("Login failed. Please check your credentials.", "error");
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setCompanyCode(value);
    setIsSubmitBtnActive(value.length > 5);
  };

  return (
    <div className="min-h-screen bg-red-800 flex flex-col items-center justify-center px-5" style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}>
      {/* Content Wrapper */}
      <div className="flex flex-col items-center justify-center w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 -mt-24">
          <img
            src="/dfin-logo.png"
            alt="Logo"
            className="w-32 h-48 object-contain"
          />
        </div>

        {/* Form Container */}
        <div className="w-full max-h-48 rounded-lg px-4">
          {/* Company Code Input */}
          <div className="mb-5">
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: YELLOW_COLOR }}
            >
              Enter company reference code
            </label>
            <input
              type="text"
              value={companyCode}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-11 px-4 text-gray-600 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              style={{
                backgroundColor: SECONDARY_COLOR,
                borderColor: CARD_BORDER_COLOR,
                borderWidth: "0.4px",
              }}
            />
          </div>

          {/* Button Container */}
          <div className="flex flex-col items-center gap-3 mt-5">
            {/* Continue Button */}
            {isSubmitBtnActive ? (
              <button
                onClick={login}
                className="w-full h-10 rounded-md text-white text-sm font-normal transition-colors cursor-pointer hover:opacity-90"
                style={{ backgroundColor: YELLOW_COLOR }}
              >
                Continue
              </button>
            ) : (
              <button
                disabled
                className="w-full h-10 rounded-md text-white text-sm font-normal opacity-60 cursor-not-allowed"
                style={{ backgroundColor: YELLOW_COLOR }}
              >
                Continue
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center w-full px-0 my-2">
              <div 
                className="flex-1 h-px"
                style={{ backgroundColor: YELLOW_COLOR }}
              ></div>
              <span 
                className="mx-6 text-sm font-medium"
                style={{ color: YELLOW_COLOR }}
              >
                or
              </span>
              <div 
                className="flex-1 h-px"
                style={{ backgroundColor: YELLOW_COLOR }}
              ></div>
            </div>

            {/* Guest Login Button */}
            <button
              onClick={guestLogin}
              className="w-full h-10 bg-gray-200 rounded-md flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors"
              style={{ color: RED_THEME_COLOR }}
            >
              Go to Dfin
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Login;
