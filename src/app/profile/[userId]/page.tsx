"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Typography, Spin, Form, Input, Divider, message } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { getProfile, updateProfile } from "@/lib/api";
import UserPostsModal from "@/components/UserPostsModal";

const { Title, Text } = Typography;

interface Profile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  github_link: string;
  city: string;
  state: string;
  date_registered: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [postsModalOpen, setPostsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const response = await getProfile(userId);
        setProfile(response.data);
      } catch {
        message.error("Failed to load profile");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userId]);

  const handleEditStart = () => {
    form.setFieldsValue({
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      email: profile?.email,
      github_link: profile?.github_link,
      city: profile?.city,
      state: profile?.state,
    });
    setIsEditing(true);
  };

  const handleSave = async (values: {
    first_name: string;
    last_name: string;
    email: string;
    github_link: string;
    city: string;
    state: string;
  }) => {
    setSaving(true);
    try {
      await updateProfile(userId, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        github_link: values.github_link,
        city: values.city,
        state: values.state,
      });
      setProfile((prev) => (prev ? { ...prev, ...values } : prev));
      setIsEditing(false);
      message.success("Profile updated!");
    } catch {
      message.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <header className={theme === "dark" ? "bg-gray-800 shadow-sm" : "bg-white shadow-sm"}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/")}>
            Back to Feed
          </Button>
          <Title level={2} className="!mb-0">
            ByteBoard
          </Title>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>
                {profile.first_name} {profile.last_name}
              </span>
              {!isEditing && (
                <div className="flex gap-2">
                  <Button onClick={() => setPostsModalOpen(true)}>My Posts</Button>
                  {isOwnProfile && (
                    <Button icon={<EditOutlined />} onClick={handleEditStart}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          }
        >
          {isEditing ? (
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <div className="grid grid-cols-2 gap-x-4">
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Enter a valid email" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="github_link" label="GitHub">
                <Input placeholder="https://github.com/username" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-x-4">
                <Form.Item name="city" label="City">
                  <Input />
                </Form.Item>
                <Form.Item name="state" label="State">
                  <Input />
                </Form.Item>
              </div>

              <Divider />

              <div className="flex justify-end gap-2">
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-gray-500 text-sm block">First Name</Text>
                  <Text strong>{profile.first_name || "—"}</Text>
                </div>
                <div>
                  <Text className="text-gray-500 text-sm block">Last Name</Text>
                  <Text strong>{profile.last_name || "—"}</Text>
                </div>
                <div>
                  <Text className="text-gray-500 text-sm block">Email</Text>
                  <Text strong>{profile.email || "—"}</Text>
                </div>
                <div>
                  <Text className="text-gray-500 text-sm block">GitHub</Text>
                  {profile.github_link ? (
                    <a
                      href={profile.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {profile.github_link}
                    </a>
                  ) : (
                    <Text strong>—</Text>
                  )}
                </div>
                <div>
                  <Text className="text-gray-500 text-sm block">City</Text>
                  <Text strong>{profile.city || "—"}</Text>
                </div>
                <div>
                  <Text className="text-gray-500 text-sm block">State</Text>
                  <Text strong>{profile.state || "—"}</Text>
                </div>
              </div>

              <Divider />

              <div>
                <Text className="text-gray-500 text-sm block">Member Since</Text>
                <Text strong>
                  {new Date(profile.date_registered).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </div>
            </div>
          )}
        </Card>
      </main>

      <UserPostsModal
        open={postsModalOpen}
        onClose={() => setPostsModalOpen(false)}
        userId={userId}
        username={`${profile.first_name} ${profile.last_name}`}
      />
    </div>
  );
}
