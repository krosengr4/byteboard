"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { createPost } from "@/lib/api";

interface Post {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  author: string;
  date_posted: string;
}

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export default function CreatePostModal({ open, onClose, onPostCreated }: CreatePostModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { title: string; content: string }) => {
    setLoading(true);
    try {
      const response = await createPost(values.title, values.content);
      onPostCreated(response.data);
      message.success("Post created!");
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create Post"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: "Please enter a title" },
            { max: 255, message: "Title cannot exceed 255 characters" },
          ]}
        >
          <Input placeholder="Enter post title" size="large" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[{ required: true, message: "Please enter content" }]}
        >
          <Input.TextArea
            placeholder="Write your post..."
            autoSize={{ minRows: 4 }}
            size="large"
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
