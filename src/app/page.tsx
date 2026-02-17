"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Typography, Spin, Switch } from "antd";
import { MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import { getPosts } from "@/lib/api";

const { Title, Text } = Typography;

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts();
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <header className={theme === "dark" ? "bg-gray-800 shadow-sm" : "bg-white shadow-sm"}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Title level={2} className="!mb-0">
            ByteBoard
          </Title>
          <div className="flex gap-4 items-center">
            <Text>Welcome, {user.username}!</Text>
            <Switch
              checked={theme === "dark"}
              onChange={toggleTheme}
              checkedChildren={<SunOutlined />}
              unCheckedChildren={<MoonOutlined />}
            />
            <Button
              icon={<UserOutlined />}
              onClick={() => router.push(`/profile/${user.id}`)}
            >
              My Profile
            </Button>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Title level={3}>Posts Feed</Title>
        </div>

        {posts.length === 0 ? (
          <Card>
            <Text>No posts yet. Be the first to create one!</Text>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post.post_id}
                hoverable
                onClick={() => router.push(`/posts/${post.post_id}`)}
                className="cursor-pointer"
              >
                <Title level={4}>{post.title}</Title>
                <Text className="text-gray-600">by {post.author}</Text>
                <p className="mt-2">{post.content}</p>
                <Text className="text-sm text-gray-400">
                  {new Date(post.date_posted).toLocaleDateString()}
                </Text>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
