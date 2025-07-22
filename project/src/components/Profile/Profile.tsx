import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Sprout,
  Award,
  Edit,
  Save,
  X,
  Image as ImageIcon,
  Trash2,
  Upload,
  FileText,
} from 'lucide-react';
import { User } from '../../types';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>({
    ...user,
    crops: user.crops || [],
    skills: user.skills || [],
    documents: user.documents || [],
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
    
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`, { //http://localhost:5000/api/users/${user._id}
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: editedUser.name,
          email: editedUser.email,
          phone: editedUser.phone,
          location: editedUser.location,
          landSize: editedUser.landSize,
          soilType: editedUser.soilType,
          crops: editedUser.crops || [],
          skills: editedUser.skills || [],
          profileImage: editedUser.profileImage,
          aadharNumber: editedUser.aadharNumber,
          farmRegistrationNumber: editedUser.farmRegistrationNumber,
          irrigationType: editedUser.irrigationType,
          documents: editedUser.documents || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      onUpdateUser(data.user); // Update to use data.user based on server response
      setIsEditing(false);
      setError(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedUser({
      ...user,
      crops: user.crops || [],
      skills: user.skills || [],
      documents: user.documents || [],
    });
    setIsEditing(false);
    setError(null);
  };

  const addSkill = () => {
    const skill = prompt('Enter new skill:');
    if (skill && skill.trim()) {
      setEditedUser({
        ...editedUser,
        skills: [...(editedUser.skills || []), skill.trim()],
      });
    }
  };

  const removeSkill = (index: number) => {
    setEditedUser({
      ...editedUser,
      skills: (editedUser.skills || []).filter((_, i) => i !== index),
    });
  };

  const addCrop = () => {
    const crop = prompt('Enter crop name:');
    if (crop && crop.trim()) {
      setEditedUser({
        ...editedUser,
        crops: [...(editedUser.crops || []), crop.trim()],
      });
    }
  };

  const removeCrop = (index: number) => {
    setEditedUser({
      ...editedUser,
      crops: (editedUser.crops || []).filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'farmers_portal');
      formData.append('folder', 'samples/ecommerce/profile_images');

      const response = await fetch(
        `${import.meta.env.VITE_CLOUDINARY_API_URL}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      setEditedUser((prev) => ({
        ...prev,
        profileImage: data.secure_url,
        documents: [
          ...(prev.documents || []),
          {
            type: 'profile',
            url: data.secure_url,
            name: file.name,
            public_id: data.public_id,
          },
        ],
      }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const uploadDocument = async (type: string, file: File) => {
    setUploading(true);
    setError(null);

    try {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Only JPG, PNG, and PDF files are allowed');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'farmers_portal');
      formData.append('folder', 'samples/ecommerce');

      const response = await fetch(
        `${import.meta.env.VITE_CLOUDINARY_API_URL}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.error?.message ||
          (data.error?.errors?.[0]?.message || 'Failed to upload document');
        throw new Error(errorMsg);
      }

      const newDocument = {
        type,
        url: data.secure_url,
        name: file.name,
        public_id: data.public_id,
      };

      setEditedUser((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), newDocument],
      }));
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument(type, file);
    }
  };

  const removeDocument = (index: number) => {
    setEditedUser({
      ...editedUser,
      documents: (editedUser.documents || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farmer Profile</h2>
          <p className="text-gray-600">Manage your personal and farming information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-6 mb-4">
                {editedUser.profileImage ? (
                  <img
                    src={editedUser.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-white" />
                  </div>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                      ) : (
                        <Upload className="h-5 w-5 text-emerald-600" />
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedUser.name || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full text-center text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="email"
                    value={editedUser.email || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full text-center text-gray-600 border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{user.name || 'N/A'}</h3>
                  <p className="text-gray-600">{user.email || 'N/A'}</p>
                </div>
              )}
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mt-2 capitalize">
                {user.role || 'farmer'}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{user.phone || 'Not provided'}</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.location || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{user.location || 'Not provided'}</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.aadharNumber || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, aadharNumber: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    placeholder="Aadhar Number"
                  />
                ) : (
                  <span className="text-sm text-gray-600">
                    Aadhar: {user.aadharNumber || 'Not provided'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Farm Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land Size (Acres)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedUser.landSize || 0}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, landSize: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    step="0.1"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.landSize || 0} acres</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                {isEditing ? (
                  <select
                    value={editedUser.soilType || 'Alluvial'}
                    onChange={(e) => setEditedUser({ ...editedUser, soilType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{user.soilType || 'Not specified'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Registration Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.farmRegistrationNumber || ''}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, farmRegistrationNumber: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {user.farmRegistrationNumber || 'Not registered'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Irrigation Type
                </label>
                {isEditing ? (
                  <select
                    value={editedUser.irrigationType || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, irrigationType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select irrigation type</option>
                    <option value="Rainfed">Rainfed</option>
                    <option value="Tube Well">Tube Well</option>
                    <option value="Canal">Canal</option>
                    <option value="Drip">Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">
                    {user.irrigationType || 'Not specified'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                <span>Documents</span>
              </h4>
              {isEditing && (
                <div className="flex space-x-2">
                  <label className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 cursor-pointer">
                    Upload 7/12
                    <input
                      type="file"
                      onChange={handleDocumentUpload('7_12')}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </label>
                  <label className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 cursor-pointer">
                    Upload 8A
                    <input
                      type="file"
                      onChange={handleDocumentUpload('8A')}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(isEditing ? editedUser.documents : user.documents || []).map((doc, index) =>
                doc && doc.url ? (
                  <div key={index} className="border rounded-lg p-3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm capitalize">
                        {doc.type.replace('_', '/')}
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded p-2">
                      {doc.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img
                          src={doc.url}
                          alt={doc.type}
                          className="max-h-32 object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                          <span className="text-xs text-gray-500">PDF Document</span>
                        </div>
                      )}
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:underline text-center"
                    >
                      View Document
                    </a>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Crops */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <span>Current Crops</span>
              </h4>
              {isEditing && (
                <button
                  onClick={addCrop}
                  className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                >
                  Add Crop
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editedUser.crops : user.crops || []).map((crop, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full"
                >
                  <span>{crop}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeCrop(index)}
                      className="hover:text-emerald-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span>Skills & Training</span>
              </h4>
              {isEditing && (
                <button
                  onClick={addSkill}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Add Skill
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editedUser.skills : user.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(index)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;