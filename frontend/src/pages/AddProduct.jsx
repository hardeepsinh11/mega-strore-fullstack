import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddProduct() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [category, setCategory] = useState("");
    const [desc, setDesc] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const navigate = useNavigate();
    const categories = ["Electronics", "Clothing", "Food","Shoes"
     ];
    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        if (!isAdmin) {
            alert("YOU ARE NOT ADMIN!!");
            navigate("/"); // Login ની જગ્યાએ home પર મોકલવું સારું, પણ તમારી મરજી
        }
    }, [navigate]);

    const handleAdd = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please Login!");
            return;
        }
        if (category === "") {
            alert("Please select a category! 📂");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("price", price);
            formData.append("stock", stock);
            formData.append("description", desc);

            if (imageFile) {
                formData.append("file", imageFile);
            }

            await axios.post("http://127.0.0.1:8000/products/add", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("Product & Image Added! ✅");
            navigate("/"); // પ્રોડક્ટ ઉમેરાઈ જાય એટલે હોમ પેજ પર
        } catch (error) {
            console.error(error);
            alert("Error: I think You not an Admin.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">📦 Add New Product</h2>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg flex flex-col gap-4">

                {/* Product Name */}
                <input
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product Name"
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                />

                {/* Category */}
                <select
                    className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white "
                    onChange={(e) => setCategory(e.target.value)}
                    defaultValue=""
                >
                    <option value="" disabled >Select Category </option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Price & Stock Row */}
                <div className="flex gap-4">
                    <input
                        className="border border-gray-300 p-3 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="number"
                        placeholder="Price"
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-3 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="number"
                        placeholder="Stock"
                        onChange={(e) => setStock(e.target.value)}
                    />
                </div>

                {/* Description */}
                <textarea
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description"
                    rows="3"
                    onChange={(e) => setDesc(e.target.value)}
                />

                {/* Image Upload - થોડું ફેન્સી બનાવ્યું છે */}
                <div className="border border-dashed border-gray-400 p-4 rounded-lg bg-gray-50 text-center">
                    <label className="block text-sm font-bold mb-2 text-gray-600">Upload Product Image:</label>
                    <input
                        type="file"
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                        onChange={(e) => setImageFile(e.target.files[0])}
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg mt-2"
                >
                    🚀 Add Product
                </button>
            </div>
        </div>
    );
}

export default AddProduct;