import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await axios.post("http://127.0.0.1:8000/login", params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem("token", response.data.access_token);
            const isAdminString = response.data.is_admin ? "true" : "false";
            localStorage.setItem("isAdmin", isAdminString);

            alert("Login Successful! 🎉");

            if (response.data.is_admin) {
                window.location.href = "/admin";
            } else {
                window.location.href = "/";
            }

        } catch (error) {
            console.error(error);
            alert("Login Failed! Email અથવા Password ખોટો છે.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">🔐 Welcome Back</h2>

                <div className="flex flex-col gap-4">
                    <input
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Email or Name"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-md transform hover:scale-105"
                >
                    Login
                </button>

                <p className="text-center text-gray-600 text-sm">
                    Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;