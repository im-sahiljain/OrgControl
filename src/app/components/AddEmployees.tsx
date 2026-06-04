"use client";

import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Image as ImageIcon, Loader2 } from "lucide-react";
import type { RootState } from "../reduxToolkit/store";

const AddEmployees = () => {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const [empName, setEmpName] = useState<string>("");
  const [empAge, setEmpAge] = useState<string>("");
  const [empPosition, setEmpPosition] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [department, setDepartment] = useState<string>("Unassigned");
  const [salary, setSalary] = useState<string>("85000");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Fetch departments dynamically to assign employees (breaks circular deadlock)
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Fetch job positions dynamically
  const { data: positions } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await axios.get(`/api/positions?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Cloudinary image upload simulation mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/cloudinary", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setProfilePhoto(data.url);
      setUploading(false);
    },
    onError: () => {
      alert("Failed to upload image. Please try again.");
      setUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      uploadImageMutation.mutate(file);
    }
  };

  // Add employee mutation using TanStack Query
  const addEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: {
      empName: string;
      empAge: number;
      empPosition: string;
      email: string;
      department: string;
      salary: number;
      profilePhoto: string;
    }) => {
      const res = await axios.post("/api/employees", { ...newEmployee, orgId: user?.orgId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEmpName("");
      setEmpAge("");
      setEmpPosition("");
      setEmail("");
      setProfilePhoto("");
      setDepartment("Unassigned");
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to create employee.");
    },
  });

  const handleAddEmployee = () => {
    if (empName && empAge && empPosition) {
      addEmployeeMutation.mutate({
        empName,
        empAge: Number(empAge),
        empPosition,
        email: email || `${empName.toLowerCase().replace(/\s+/g, ".")}@company.in`,
        department: department || "Unassigned",
        salary: Number(salary) || 85000,
        profilePhoto,
      });
    } else {
      alert("Please fill all the mandatory fields (Name, Age, Position)");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Add Employee
          </h2>
          <p className="text-sm text-zinc-550">
            Fill out the form below to add a new employee record.
          </p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter Employee Name"
            className="w-full"
            onChange={(e) => setEmpName(e.target.value)}
            value={empName}
          />
        </div>

        {/* Age & Position */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Age <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="Age"
              className="w-full"
              onChange={(e) => setEmpAge(e.target.value)}
              value={empAge}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Position <span className="text-red-500">*</span>
            </label>
            <select
              value={empPosition}
              onChange={(e) => setEmpPosition(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100 h-[38px]"
            >
              <option value="" disabled>-- Select Formal Position --</option>
              {positions?.map((p: any) => (
                <option key={p._id || p.id} value={p.title}>
                  {p.title} {p.department !== "Unassigned" ? `(${p.department})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Email & Salary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <Input
              type="email"
              placeholder="Email address"
              className="w-full"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Salary (₹)
            </label>
            <Input
              type="number"
              placeholder="Monthly Salary"
              onChange={(e) => setSalary(e.target.value)}
              value={salary}
            />
          </div>
        </div>

        {/* Department select (Dynamic) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Department (Optional fallback allowed)
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100"
          >
            <option value="Unassigned">-- Unassigned (First Employee) --</option>
            {departments?.map((d: any) => (
              <option key={d._id || d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Profile Image Cloudinary Upload */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Profile Photo (Cloudinary Integrated)
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border-dashed border-2 py-5"
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              {profilePhoto ? "Change Photo" : "Upload File"}
            </Button>
            {profilePhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePhoto}
                alt="Upload preview"
                className="h-10 w-10 rounded-full object-cover border border-zinc-200"
              />
            )}
          </div>
        </div>
      </div>
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
        <Button
          onClick={handleAddEmployee}
          disabled={addEmployeeMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {addEmployeeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adding...
            </>
          ) : (
            "Add Employee"
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddEmployees;
