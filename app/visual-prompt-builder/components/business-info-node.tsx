"use client";

import type React from "react";

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessInfoProps {
  data: {
    businessName: string;
    businessType: string;
    role: string;
  };
  isConnectable: boolean;
}

export function BusinessInfoNode({ data, isConnectable }: BusinessInfoProps) {
  const [businessName, setBusinessName] = useState(data.businessName);
  const [businessType, setBusinessType] = useState(data.businessType);
  const [role, setRole] = useState(data.role);

  // Update data when inputs change
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusinessName(value);
    data.businessName = value;
  };

  const handleBusinessTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusinessType(value);
    data.businessType = value;
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRole(value);
    data.role = value;
  };

  return (
    <Card className="w-80">
      <CardHeader className="bg-primary text-primary-foreground py-2">
        <CardTitle className="text-base">Business Information</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={handleBusinessNameChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              value={businessType}
              onChange={handleBusinessTypeChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role">AI Role</Label>
            <Input
              id="role"
              value={role}
              onChange={handleRoleChange}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-primary"
      />
    </Card>
  );
}
