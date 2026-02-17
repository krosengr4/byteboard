"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Typography, Spin, Input, Popconfirm, message } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { getPost, getComments, createComment, updateComment, deleteComment } from "@/lib/api";

const { Title, Text } = Typography;

interface Post {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  author: string;
  date_posted: string;
}

interface Comment {
  comment_id: number;
  user_id: number;
  post_id: number;
  content: string;
  author: string;
  date_posted: string;
}

export default function PostDetail() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params.postId as string);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          getPost(postId),
          getComments(postId),
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data || []);
      } catch {
        message.error("Failed to load post");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const response = await createComment(postId, newComment.trim());
      setComments((prev) => [...prev, response.data]);
      setNewComment("");
    } catch {
      message.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditStart = (comment: Comment) => {
    setEditingCommentId(comment.comment_id);
    setEditContent(comment.content);
  };

  const handleEditSave = async (commentId: number) => {
    if (!editContent.trim()) return;
    try {
      await updateComment(commentId, editContent.trim());
      setComments((prev) =>
        prev.map((c) =>
          c.comment_id === commentId ? { ...c, content: editContent.trim() } : c
        )
      );
      setEditingCommentId(null);
      setEditContent("");
    } catch {
      message.error("Failed to update comment");
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
      message.success("Comment deleted");
    } catch {
      message.error("Failed to delete comment");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !post) return null;

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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <Title level={3}>{post.title}</Title>
          <Text className="text-gray-500">
            by {post.author} · {new Date(post.date_posted).toLocaleDateString()}
          </Text>
          <p className="mt-4 whitespace-pre-wrap">{post.content}</p>
        </Card>

        <div>
          <Title level={4}>Comments ({comments.length})</Title>
          {comments.length === 0 ? (
            <Card>
              <Text className="text-gray-500">No comments yet. Be the first!</Text>
            </Card>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <Card key={comment.comment_id} size="small">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Text strong>{comment.author}</Text>
                        <Text className="text-gray-400 text-xs">
                          {new Date(comment.date_posted).toLocaleDateString()}
                        </Text>
                      </div>
                      {editingCommentId === comment.comment_id ? (
                        <div className="space-y-2">
                          <Input.TextArea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoSize={{ minRows: 2 }}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleEditSave(comment.comment_id)}
                            >
                              Save
                            </Button>
                            <Button size="small" onClick={handleEditCancel}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                      )}
                    </div>
                    {user.id === comment.user_id &&
                      editingCommentId !== comment.comment_id && (
                        <div className="flex gap-1 shrink-0">
                          <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditStart(comment)}
                          />
                          <Popconfirm
                            title="Delete comment?"
                            description="This cannot be undone."
                            onConfirm={() => handleDelete(comment.comment_id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <Button icon={<DeleteOutlined />} size="small" danger />
                          </Popconfirm>
                        </div>
                      )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card>
          <Title level={5}>Leave a comment</Title>
          <Input.TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            autoSize={{ minRows: 3 }}
            className="mb-3"
          />
          <Button
            type="primary"
            onClick={handleAddComment}
            loading={submittingComment}
            disabled={!newComment.trim()}
          >
            Submit
          </Button>
        </Card>
      </main>
    </div>
  );
}
