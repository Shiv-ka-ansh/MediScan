import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/userService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Droplets,
  UserCircle,
  Save,
  Loader2,
  CheckCircle2,
  Activity,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";

export const Profile = () => {
  const { user: authUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        const user = data.user;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: user.gender || "",
          bloodGroup: user.bloodGroup || "",
          address: user.address || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await updateProfile(formData);
      setUser({ ...authUser, ...response.user });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...authUser, ...response.user })
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass-card overflow-hidden border-white/5">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-cyan-900 to-slate-900 flex items-center px-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              <UserCircle size={64} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-outfit font-bold text-white mb-1">
                {formData.name || "User Profile"}
              </h1>
              <p className="text-cyan-400 font-medium capitalize tracking-wide">
                {authUser?.role} Account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {authUser?.role === "patient" && !authUser?.isProfileComplete && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start space-x-3">
              <Activity className="text-cyan-400 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-cyan-100 font-medium">
                  Profile Completion Required
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Please complete your basic medical profile to access the
                  dashboard and AI insights.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-outfit font-bold text-white flex items-center space-x-2">
                <User size={18} className="text-cyan-400" />
                <span>Basic Information</span>
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    name="email"
                    value={formData.email}
                    disabled
                    className="bg-white/5 border-white/10 opacity-60 cursor-not-allowed pl-10"
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={16}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[10px] text-cyan-400/50">Required</span>
                </label>
                <div className="relative">
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    required
                    className="bg-white/5 border-white/10 pl-10"
                  />
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={16}
                  />
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-outfit font-bold text-white flex items-center space-x-2">
                <Activity size={18} className="text-cyan-400" />
                <span>Medical Profile</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Date of Birth</span>
                    <span className="text-[10px] text-cyan-400/50">
                      Required
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer [color-scheme:dark]"
                    />
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Gender</span>
                    <span className="text-[10px] text-cyan-400/50">
                      Required
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">
                        Select Gender
                      </option>
                      <option value="male" className="bg-slate-900">
                        Male
                      </option>
                      <option value="female" className="bg-slate-900">
                        Female
                      </option>
                      <option value="other" className="bg-slate-900">
                        Other
                      </option>
                    </select>
                    <UserCircle
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      size={16}
                    />
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Blood Group
                </label>
                <div className="relative">
                  <Input
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    placeholder="e.g. O+ ve"
                    className="bg-white/5 border-white/10 pl-10"
                  />
                  <Droplets
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500"
                    size={16}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Address
                </label>
                <div className="relative">
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City, State"
                    className="bg-white/5 border-white/10 pl-10"
                  />
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={16}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="flex items-center space-x-2">
              {success && (
                <span className="text-emerald-400 text-sm font-medium flex items-center">
                  <CheckCircle2 size={16} className="mr-1.5" />
                  Profile updated successfully!
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="btn-gradient px-12 py-3 h-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
