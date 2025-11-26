"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createSupabaseClient } from "@/lib/supabase/client";
import { UserProfile, UserAddress } from "@/types";
import { User, MapPin, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "@/components/Toast";
import { getBrandColors } from "@/lib/brand";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ProfilePage() {
  const [fullUser, setFullUser] = useState<any>(null);

  const loadFullUser = async () => {
    try {
      const res = await fetch("/api/auth/full-user");
      const data = await res.json();
      setFullUser(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to load full user:", error);
      }
    }
  };

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const supabase = createSupabaseClient();
  const brandColors = getBrandColors();

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    label: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    is_default: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      loadProfile();
      loadAddresses();
      loadFullUser();
    }
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      setProfile(data);

      // If no profile exists, create one
      if (!data) {
        const { data: newProfile } = await supabase
          .from("user_profiles")
          .insert({ id: user.id })
          .select()
          .single();
        setProfile(newProfile);
      } else {
        // Initialize formData with profile data
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || "",
          phone: data.phone || "",
        }));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error loading profile:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error loading addresses:", error);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Get current values from formData (which is now synced with profile)
    const fullName = (formData.full_name || "").trim();
    const phone = (formData.phone || "").trim();

    // Validate that at least one field has data
    if (!fullName && !phone) {
      toast.error("Please enter at least your name or phone number before saving.");
      return;
    }

    // Check if data has actually changed
    const currentFullName = (profile?.full_name || "").trim();
    const currentPhone = (profile?.phone || "").trim();
    
    if (fullName === currentFullName && phone === currentPhone) {
      toast.info("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: fullName || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      
      // Reload profile to get updated data
      await loadProfile();
      
      // Show success message
      toast.success("Profile updated successfully! ✨");
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error saving profile:", error);
      }
      toast.error("Oops! We couldn't update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.full_name?.trim()) {
      toast.error("Please enter the recipient's full name.");
      return;
    }

    if (!formData.phone?.trim()) {
      toast.error("Please enter a phone number.");
      return;
    }

    if (!formData.address_line1?.trim()) {
      toast.error("Please enter the street address.");
      return;
    }

    if (!formData.city?.trim()) {
      toast.error("Please enter the city.");
      return;
    }

    if (!formData.state?.trim()) {
      toast.error("Please enter the state or province.");
      return;
    }

    if (!formData.postal_code?.trim()) {
      toast.error("Please enter the postal code.");
      return;
    }

    if (!formData.country?.trim()) {
      toast.error("Please enter the country.");
      return;
    }

    // Prepare address data
    const addressData = {
      user_id: user.id,
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      label: formData.label.trim() || null,
      address_line1: formData.address_line1.trim(),
      address_line2: formData.address_line2.trim() || null,
      city: formData.city.trim(),
      state: formData.state.trim(),
      postal_code: formData.postal_code.trim(),
      country: formData.country.trim(),
      is_default: formData.is_default,
    };

    // Check if data has actually changed (only for editing)
    if (editingAddress) {
      const hasChanged = 
        addressData.full_name !== editingAddress.full_name ||
        addressData.phone !== editingAddress.phone ||
        (addressData.label || "") !== (editingAddress.label || "") ||
        addressData.address_line1 !== editingAddress.address_line1 ||
        (addressData.address_line2 || "") !== (editingAddress.address_line2 || "") ||
        addressData.city !== editingAddress.city ||
        addressData.state !== editingAddress.state ||
        addressData.postal_code !== editingAddress.postal_code ||
        addressData.country !== editingAddress.country ||
        addressData.is_default !== editingAddress.is_default;

      if (!hasChanged) {
        toast.info("No changes to save.");
        return;
      }
    }

    setSaving(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from("user_addresses")
          .update(addressData)
          .eq("id", editingAddress.id);

        if (error) throw error;
        toast.success("Address updated successfully! 🎉");
      } else {
        const { error } = await supabase
          .from("user_addresses")
          .insert(addressData);

        if (error) throw error;
        toast.success("Address added successfully! 🎉");
      }

      await loadAddresses();
      resetForm();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error saving address:", error);
      }
      
      // Provide more specific error messages
      if (error?.code === '23505') {
        toast.error("This address already exists. Please check your saved addresses.");
      } else if (error?.message) {
        toast.error(`Unable to save address: ${error.message}`);
      } else {
        toast.error("We couldn't save your address. Please check the information and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddressToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", addressToDelete);

      if (error) throw error;
      await loadAddresses();
      toast.success("Address deleted successfully");
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting address:", error);
      }
      toast.error("We couldn't delete the address. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user!.id);

      // Then set this one as default
      const { error } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
      await loadAddresses();
      toast.success("Default address updated! This will be used for future orders.");
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error setting default address:", error);
      }
      toast.error("We couldn't set the default address. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      phone: "",
      label: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "United States",
      is_default: false,
    });
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const startEditAddress = (address: UserAddress) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      label: address.label || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  // User object logging removed for production

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          My Profile
        </h1>
        <p className="text-gray-600">
          Manage your personal information and delivery addresses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'}, ${brandColors.secondary || '#3B82F6'})`
                }}
              >
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Personal Information
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name || profile?.full_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || profile?.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Enter your phone number"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6" style={{ color: brandColors.primary || '#10B981' }} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Delivery Addresses
                </h2>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddressForm(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Address
              </button>
            </div>

            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No addresses saved yet</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-primary"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {address.is_default && (
                          <span 
                            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2"
                            style={{
                              backgroundColor: `${brandColors.primary || '#10B981'}20`,
                              color: brandColors.primary || '#10B981'
                            }}
                          >
                            Default
                          </span>
                        )}
                        {address.label && (
                          <span className="ml-2 text-gray-600 font-medium">
                            {address.label}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 mt-2">
                          {address.full_name}
                        </h3>
                        <p className="text-gray-600 mt-1">{address.phone}</p>
                        <p className="text-gray-600 mt-2">
                          {address.address_line1}
                          {address.address_line2 &&
                            `, ${address.address_line2}`}
                          <br />
                          {address.city}, {address.state} {address.postal_code}
                          <br />
                          {address.country}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              color: brandColors.primary || '#10B981'
                            }}
                            onMouseEnter={(e) => {
                              const hex = brandColors.primary || '#10B981'
                              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                              if (result) {
                                const r = parseInt(result[1], 16)
                                const g = parseInt(result[2], 16)
                                const b = parseInt(result[3], 16)
                                e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.1)`
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                            title="Set as default"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => startEditAddress(address)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Address Form */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="mt-6 p-6 bg-gray-50 rounded-xl space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label (e.g., Home, Work)
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                      placeholder="Home"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address_line1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address_line1: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.address_line2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address_line2: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{
                    '--focus-ring': brandColors.primary || '#10B981'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_default: e.target.checked,
                          })
                        }
                        className="w-4 h-4 border-gray-300 rounded"
                        style={{
                          accentColor: brandColors.primary || '#10B981'
                        }}
                      />
                      <span className="text-sm text-gray-700">
                        Set as default address
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    {saving
                      ? "Saving..."
                      : editingAddress
                      ? "Update Address"
                      : "Add Address"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div 
            className="rounded-2xl shadow-lg p-8 text-white sticky top-24"
            style={{
              background: `linear-gradient(to bottom right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
            }}
          >
            <h3 className="text-xl font-bold mb-4">Account Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Member Since</p>
                <p className="font-semibold">
                  {/* {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"} */}
                  {fullUser?.created_at
                    ? new Date(fullUser.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Saved Addresses</p>
                <p className="font-semibold text-2xl">{addresses.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDeleteAddress}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setAddressToDelete(null);
        }}
      />
    </div>
  );
}
