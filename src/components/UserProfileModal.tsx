"use client";

import { useEffect, useState } from "react";
import { Modal, Spin, Typography, Divider } from "antd";
import { getProfile } from "@/lib/api";

const { Text } = Typography;

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

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}

export default function UserProfileModal({ open, onClose, userId, username }: UserProfileModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getProfile(userId);
        setProfile(response.data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [open, userId]);

  return (
    <Modal
      title={`@${username}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : !profile ? (
        <div className="text-center py-8">
          <Text className="text-gray-500">Profile not found.</Text>
        </div>
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
    </Modal>
  );
}
