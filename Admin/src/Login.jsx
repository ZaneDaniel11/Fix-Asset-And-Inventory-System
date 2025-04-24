import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/LoginApi/Authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UserName: username,
            Password: password,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Invalid Email Or Password`);
        return;
      }

      const data = await response.json();
      console.log(`"Hey":${data}`);

      // Store relevant data in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", data.userId); // Store the userId
      localStorage.setItem("userType", data.userType);
      localStorage.setItem("name", data.name); // Store the name
      localStorage.setItem("email", data.email);

      // Navigate based on the userType
      switch (data.userType) {
        case "Department":
          navigate("/Home");
          break;
        case "Teacher":
          navigate("/Home");
          break;
        case "Inventory_Admin":
          navigate("/dashboard");
          break;
        case "Head_Admin":
          navigate("/HadminBorrow");
          break;
        case "School_Admin":
          navigate("/SadminBorrow");
          break;
        case "Asset_Admin":
          navigate("/AssetInventory");
          break;
        default:
          toast.error("Unknown user type");
      }
    } catch (error) {
      toast.error(`Invalid Email Or Password`);
      console.error("There was an error making the request", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
  <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
    <h1 className="text-3xl font-bold text-center text-gray-800">Sign in</h1>
    <p className="text-center text-gray-500 mt-2">Welcome back! Please enter your credentials.</p>

    <form onSubmit={handleLogin} className="mt-6 space-y-5">
      {/* Username Field */}
      <div className="relative">
        <input
          type="text"
          id="username"
          placeholder="Username"
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Password Field */}
      <div className="relative">
        <input
          type="password"
          id="password"
          placeholder="Password"
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Sign in
      </button>

      {/* Forgot Password & Register Links */}
      <div className="text-center mt-3 text-sm text-gray-500">
        <a href="#" className="text-blue-500 hover:underline">Forgot password?</a> | 
        <a href="#" className="text-blue-500 hover:underline"> Create an account</a>
      </div>
    </form>
  </div>
</div>
  );
}
