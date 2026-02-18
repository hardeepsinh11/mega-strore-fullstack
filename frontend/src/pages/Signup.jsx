import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            const userData = {
                name: name,
                email: email,
                phone: phone,
                password: password,
            };

            const response = await axios.post("http://127.0.0.1:8000/signup", userData);

            if (response.data.is_admin) {
                alert("Welcome Boss! Admin Account Created. 😎");
            } else {
                alert("Customer Account Created! 🎉");
            }
            navigate("/login");
        } catch (error) {
            console.error("Signup Error:", error);
            if (error.response && error.response.data) {
                alert("Server Error: " + JSON.stringify(error.response.data));
            } else {
                alert("Something went wrong! Check Console.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">📝 Create Account</h2>

                <div className="flex flex-col gap-4">
                    <input
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        placeholder="Full Name"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        placeholder="Phone"
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSignup}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-md transform hover:scale-105"
                >
                    Register
                </button>

                <p className="text-center text-gray-600 text-sm">
                    Already have account? <Link to="/login" className="text-green-600 font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;