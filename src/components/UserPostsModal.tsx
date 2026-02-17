"use client";

import { useEffect, useState } from "react";
import { Modal, Spin, Typography, Card } from "antd";
import { useRouter } from "next/navigation";
import { getPostsByUser } from "@/lib/api";

const { Text } = Typography;

interface Post {
  post_id: number;
  title: string;
  date_posted: string;
}

interface UserPostsModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}

export default function UserPostsModal({ open, onClose, userId, username }: UserPostsModalProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await getPostsByUser(userId);
        setPosts(response.data || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [open, userId]);

  const handlePostClick = (postId: number) => {
    onClose();
    router.push(`/posts/${postId}`);
  };

  return (
    <Modal
      title={`Posts by ${username}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <Text className="text-gray-500">No posts yet.</Text>
        </div>
      ) : (
        <div style={{ maxHeight: "60vh", overflowY: "auto" }} className="space-y-2">
          {posts.map((post) => (
            <Card
              key={post.post_id}
              hoverable
              size="small"
              onClick={() => handlePostClick(post.post_id)}
              className="cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <Text strong>{post.title}</Text>
                <Text className="text-gray-400 text-sm">
                  {new Date(post.date_posted).toLocaleDateString()}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Modal>
  );
}
