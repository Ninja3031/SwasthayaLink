import React, { useState } from 'react';
import { mockDoctorUser } from '../../data/mockData';
import { User as UserType } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const DoctorProfile: React.FC = () => {
  const [doctor, setDoctor] = useLocalStorage<UserType>('doctorProfile', mockDoctorUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserType>(doctor);

  const handleSaveProfile = () => {
    setDoctor(editForm);
    setIsEditModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Doctor Profile</h2>
      <p><strong>Name:</strong> {doctor.name}</p>
      <p><strong>Email:</strong> {doctor.email}</p>
      <p><strong>Specialization:</strong> {doctor.specialization}</p>
      <p><strong>Hospital:</strong> {doctor.hospital}</p>
      <p><strong>Experience:</strong> {doctor.experience} years</p>
      <p><strong>Consultation Fee:</strong> ₹{doctor.consultationFee}</p>

      <button
        onClick={() => setIsEditModalOpen(true)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Edit Profile
      </button>

      {isEditModalOpen && (
        <div className="mt-4 border p-4 bg-gray-100">
          <h3 className="text-lg font-bold mb-2">Edit Profile</h3>
          <input
            name="name"
            value={editForm.name}
            onChange={handleChange}
            placeholder="Name"
            className="block mb-2 p-2 border rounded w-full"
          />
          <input
            name="email"
            value={editForm.email}
            onChange={handleChange}
            placeholder="Email"
            className="block mb-2 p-2 border rounded w-full"
          />
          <input
            name="specialization"
            value={editForm.specialization || ''}
            onChange={handleChange}
            placeholder="Specialization"
            className="block mb-2 p-2 border rounded w-full"
          />
          <input
            name="hospital"
            value={editForm.hospital || ''}
            onChange={handleChange}
            placeholder="Hospital"
            className="block mb-2 p-2 border rounded w-full"
          />
          <input
            name="experience"
            type="number"
            value={editForm.experience || ''}
            onChange={handleChange}
            placeholder="Experience (years)"
            className="block mb-2 p-2 border rounded w-full"
          />
          <input
            name="consultationFee"
            type="number"
            value={editForm.consultationFee || ''}
            onChange={handleChange}
            placeholder="Consultation Fee"
            className="block mb-2 p-2 border rounded w-full"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
