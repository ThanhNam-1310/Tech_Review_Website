import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { User, Mail, AtSign, Shield, Pencil } from "lucide-react";

const Profile = ({ user }) => {
  const mockUser = {
    id: "0199c123-4567-7890-abcd-123456789abc",
    fullName: "Nguyễn Văn Nam",
    userName: "nguyenvannam",
    email: "nam@example.com",
    avatarUrl: "",
    roleName: "User",
  };

  const profile = user || mockUser;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Thông tin cá nhân</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>

          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="h-28 w-28">
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />

              <AvatarFallback className="text-3xl">
                {profile.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <h2 className="mt-4 text-xl font-semibold">{profile.fullName}</h2>

            <p className="text-sm text-muted-foreground">@{profile.userName}</p>
          </div>

          {/* Information */}
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label>Họ và tên</Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input value={profile.fullName} readOnly className="pl-9" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Tên đăng nhập</Label>

              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input value={profile.userName} readOnly className="pl-9" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input value={profile.email} readOnly className="pl-9" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Vai trò</Label>

              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input value={profile.roleName} readOnly className="pl-9" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
