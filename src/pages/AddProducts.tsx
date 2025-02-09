import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UploadProduct() {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB. Please upload a smaller image.');
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim() || !formData.category.trim()) {
        throw new Error('Please fill in all required fields.');
      }
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        throw new Error('Please enter a valid positive price.');
      }
      if (!formData.image) {
        throw new Error('Please upload an image.');
      }

      // Upload image to Supabase storage
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, formData.image);

      if (uploadError) {
        console.error(uploadError);
        throw new Error('Image upload failed. Please try again.');
      }

      // Get public URL of uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (publicUrlData === null) {
        console.error('Failed to fetch the public URL for the uploaded image.');
        throw new Error('Failed to fetch the public URL for the uploaded image.');
      }

      // Insert product into the database
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          image: publicUrlData.publicUrl,
        });

      if (insertError) {
        console.error(insertError);
        throw new Error('Failed to save product details. Please try again.');
      }

      navigate('/products');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upload Product</h1>
          <p className="text-gray-600 mt-2">Add a new product to your store</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price (₦)
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="Enter product price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <Input
              id="category"
              name="category"
              placeholder="Enter product category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Product Image
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
