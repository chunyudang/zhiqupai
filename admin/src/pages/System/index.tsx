import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { getConfigs, updateConfig } from '@/api/configs'
import type { SystemConfig } from '@/types'

const { TextArea } = Input

export default function System() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetchData = () => {
    setLoading(true)
    getConfigs()
      .then(setConfigs)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openEditModal = (record: SystemConfig) => {
    setEditingConfig(record)
    let displayValue = record.configValue
    try {
      displayValue = JSON.stringify(JSON.parse(record.configValue), null, 2)
    } catch { /* ignore */ }
    form.setFieldsValue({
      configValue: displayValue,
      description: record.description,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      try {
        JSON.parse(values.configValue)
      } catch {
        message.error('configValue 必须是合法的 JSON 字符串')
        return
      }
      setSubmitting(true)
      await updateConfig(editingConfig!.configKey, {
        configValue: values.configValue,
        description: values.description,
      })
      message.success('更新成功')
      setModalVisible(false)
      fetchData()
    } catch {
      // handled
    } finally {
      setSubmitting(false)
    }
  }

  const formatValue = (value: string) => {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '配置键', dataIndex: 'configKey', width: 180 },
    {
      title: '配置值',
      dataIndex: 'configValue',
      render: (value: string) => (
        <pre
          style={{
            margin: 0,
            maxHeight: 120,
            overflow: 'auto',
            fontSize: 12,
            background: '#f5f5f5',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          {formatValue(value)}
        </pre>
      ),
    },
    { title: '描述', dataIndex: 'description', width: 150 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record: SystemConfig) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>系统配置</h2>
      </div>
      <Table rowKey="id" columns={columns} dataSource={configs} loading={loading} />

      <Modal
        title="编辑配置"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="配置键">
            <Input value={editingConfig?.configKey} disabled />
          </Form.Item>
          <Form.Item
            name="configValue"
            label="配置值 (JSON)"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <TextArea
              rows={6}
              style={{ fontFamily: 'monospace' }}
              placeholder='{"key": "value"}'
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="配置项说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
