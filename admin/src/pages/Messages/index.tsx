import { useState } from 'react'
import { Form, Input, Button, Alert, Modal } from 'antd'
import { pushMessage } from '@/api/messages'
import type { PushMessageParams } from '@/types'

const { TextArea } = Input

export default function Messages() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: PushMessageParams) => {
    setLoading(true)
    try {
      const result = await pushMessage(values)
      Modal.success({
        title: '推送成功',
        content: `已成功推送给 ${result.pushedCount} 位用户`,
      })
      form.resetFields()
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>消息推送</h2>
      <Alert
        message="系统消息将推送给所有活跃用户，30天后自动过期"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="title"
          label="消息标题"
          rules={[
            { required: true, message: '请输入消息标题' },
            { max: 100, message: '标题不超过100个字符' },
          ]}
        >
          <Input placeholder="请输入消息标题" maxLength={100} showCount />
        </Form.Item>
        <Form.Item
          name="content"
          label="消息内容"
          rules={[
            { required: true, message: '请输入消息内容' },
            { max: 500, message: '内容不超过500个字符' },
          ]}
        >
          <TextArea rows={4} placeholder="请输入消息内容" maxLength={500} showCount />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            推送消息
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
