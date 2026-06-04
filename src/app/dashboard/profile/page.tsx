"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { RootState } from "../../reduxToolkit/store";
import { User, Mail, Briefcase, Building, Wallet, CalendarDays, Edit3, X, Save, Camera, UploadCloud, Stethoscope, Sun, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    empName: "",
    empAge: 0,
    profilePhoto: "",
  });
  const [uploading, setUploading] = useState(false);

  // Fetch full employee details from the DB
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ["employee", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await axios.get(`/api/employees/${user.id}?orgId=${user.orgId}`);
      return res.data.data;
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.put(`/api/employees/${user?.id}`, {
        ...payload,
        orgId: user?.orgId
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", user?.id] });
      setIsEditing(false);
    }
  });

  const handleEditClick = () => {
    if (employeeData) {
      setEditForm({
        empName: employeeData.empName,
        empAge: employeeData.empAge,
        profilePhoto: employeeData.profilePhoto || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await axios.post("/api/cloudinary", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setEditForm(prev => ({ ...prev, profilePhoto: res.data.url }));
    } catch (err) {
      console.error("Photo upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center text-zinc-500">
        Profile data not found.
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-8 animate-fade-in max-w-5xl mx-auto w-full">
      
      {/* Header Banner & Avatar */}
      <div className="relative w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900"></div>
        
        <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-6 relative -mt-12 md:-mt-16 items-start md:items-end">
          
          <div className="relative shrink-0">
            {employeeData.profilePhoto ? (
              <img 
                src={employeeData.profilePhoto} 
                alt="Profile" 
                className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-zinc-900 object-cover bg-white shadow-md"
              />
            ) : (
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-zinc-900 bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl md:text-5xl font-bold uppercase shadow-md">
                {employeeData.empName.charAt(0)}
              </div>
            )}
            
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-105 border-2 border-white dark:border-zinc-900">
                {uploading ? <UploadCloud className="h-4 w-4 animate-bounce" /> : <Camera className="h-4 w-4" />}
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            )}
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-4">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.empName}
                  onChange={(e) => setEditForm({ ...editForm, empName: e.target.value })}
                  className="text-2xl md:text-3xl font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1 mb-2 focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-sm"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  {employeeData.empName}
                  {employeeData.status === "active" && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                </h1>
              )}
              <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base flex items-center gap-1.5 mt-1">
                <Briefcase className="h-4 w-4" /> {employeeData.empPosition}
              </p>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-1.5 text-zinc-500">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending || uploading} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4" /> {updateMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleEditClick} className="gap-1.5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </Button>
              )}
            </div>
          </div>
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal & Work Info */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Personal Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Email Address</label>
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-medium">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  {employeeData.email}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.empAge}
                    onChange={(e) => setEditForm({ ...editForm, empAge: Number(e.target.value) })}
                    className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1 font-medium w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-medium">
                    <User className="h-4 w-4 text-zinc-400" />
                    {employeeData.empAge} years
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-500" />
              Work & Organization
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Department</label>
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-medium">
                  <Building className="h-4 w-4 text-zinc-400" />
                  {employeeData.department}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Salary</label>
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-medium">
                  <Wallet className="h-4 w-4 text-zinc-400" />
                  ${employeeData.salary?.toLocaleString() || "0"} / yr
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Account Status</label>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    employeeData.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${employeeData.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {employeeData.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Joined Date</label>
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-medium">
                  <CalendarDays className="h-4 w-4 text-zinc-400" />
                  {new Date(employeeData.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Leave Balances */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Leave Balances
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Sun className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Casual Leave</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {employeeData.leaveBalances?.casual || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Sick Leave</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {employeeData.leaveBalances?.sick || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Earned Leave</span>
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {employeeData.leaveBalances?.earned || 0}
                </span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
