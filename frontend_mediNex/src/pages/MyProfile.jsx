import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { User, Mail, Phone, Home, Calendar, Venus, Edit, Save } from 'lucide-react'

const Row = ({ icon, label, isEdit, children }) => (
  <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-5 py-3 my-2 shadow-sm border border-blue-100">
    <span className="flex items-center justify-center w-8 h-8">{icon}</span>
    <label className="w-24 min-w-fit font-semibold text-blue-600">{label}</label>
    <div className="flex-1">{children}</div>
  </div>
)

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: "Tirtha Ghosh",
    image: assets.profileImage,
    email: 'ghoshtirtha1234@gmail.com',
    mobile: '+91 83482671511',
    address: {
      line1: "Bardhaman, West Bengal, India",
      line2: "PIN:713407",
    },
    dob: "2004-12-02",
    gender: "Male",
  })
  const [isEdit, setIsEdit] = useState(false)

  const handleAddressChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-lg border border-blue-200 rounded-3xl shadow-2xl px-6 py-8">
        {/* Profile Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={userData.image}
              alt={userData.name}
              className="w-32 h-32 object-cover rounded-full border-4 border-blue-100 shadow-lg"
            />
            <div className="absolute -right-4 bottom-2 bg-indigo-100 text-blue-700 px-3 py-1 rounded-full shadow flex items-center gap-1 text-xs font-semibold border border-blue-200">
              <User className="w-4 h-4" /> Profile
            </div>
          </div>
        </div>

        {/* Name */}
        <Row icon={<User className="w-5 h-5 text-blue-600" />} label="Name" isEdit={isEdit}>
          {isEdit ? (
            <input
              type="text"
              value={userData.name}
              onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-800 font-semibold focus:ring-2 focus:ring-blue-300 transition placeholder:text-blue-200"
              placeholder="Full Name"
            />
          ) : (
            <span className="text-blue-800 font-semibold">{userData.name}</span>
          )}
        </Row>

        {/* Email */}
        <Row icon={<Mail className="w-5 h-5 text-blue-500" />} label="Email" isEdit={isEdit}>
          {isEdit ? (
            <input
              type="email"
              value={userData.email}
              onChange={e => setUserData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium focus:ring-2 focus:ring-blue-300 placeholder:text-blue-200"
              placeholder="Email"
            />
          ) : (
            <span className="text-blue-800 font-medium">{userData.email}</span>
          )}
        </Row>

        {/* Mobile */}
        <Row icon={<Phone className="w-5 h-5 text-blue-500" />} label="Mobile" isEdit={isEdit}>
          {isEdit ? (
            <input
              type="text"
              value={userData.mobile}
              onChange={e => setUserData(prev => ({ ...prev, mobile: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium focus:ring-2 focus:ring-blue-300 placeholder:text-blue-200"
              placeholder="Mobile Number"
            />
          ) : (
            <span className="text-blue-800 font-medium">{userData.mobile}</span>
          )}
        </Row>

        {/* Address 1 */}
        <Row icon={<Home className="w-5 h-5 text-blue-500" />} label="Address" isEdit={isEdit}>
          <div className="flex flex-col w-full gap-1">
            {isEdit ? (
              <>
                <input
                  type="text"
                  value={userData.address.line1}
                  onChange={e => handleAddressChange('line1', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium focus:ring-2 focus:ring-blue-300 placeholder:text-blue-200"
                  placeholder="Address line 1"
                  style={{ marginBottom: 4 }}
                />
                <input
                  type="text"
                  value={userData.address.line2}
                  onChange={e => handleAddressChange('line2', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium focus:ring-2 focus:ring-blue-300 placeholder:text-blue-200"
                  placeholder="Address line 2"
                />
              </>
            ) : (
              <>
                <span className="text-blue-800 font-medium">{userData.address.line1}</span>
                <span className="text-blue-800 font-medium">{userData.address.line2}</span>
              </>
            )}
          </div>
        </Row>

        {/* DOB */}
        <Row icon={<Calendar className="w-5 h-5 text-blue-500" />} label="DOB" isEdit={isEdit}>
          {isEdit ? (
            <input
              type="date"
              value={userData.dob}
              onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium focus:ring-2 focus:ring-blue-300"
            />
          ) : (
            <span className="text-blue-800 font-medium">{userData.dob}</span>
          )}
        </Row>

        {/* Gender */}
        <Row icon={<Venus className="w-5 h-5 text-blue-500" />} label="Gender" isEdit={isEdit}>
          {isEdit ? (
            <select
              value={userData.gender}
              onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium focus:ring-2 focus:ring-blue-300"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <span className="text-blue-800 font-medium">{userData.gender}</span>
          )}
        </Row>

        {/* Edit/Save Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => setIsEdit(prev => !prev)}
            type="button"
            className="flex items-center px-7 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow hover:scale-105 hover:shadow-lg transition gap-2"
          >
            {isEdit ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            {isEdit ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
