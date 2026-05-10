import { useCreate, useNavigation } from '@refinedev/core'
import { Create } from '@refinedev/antd'
import { Form, Input, Switch, Select, Button, App } from 'antd'

export function FeatureFlagCreate() {
  const [form] = Form.useForm()
  const { mutate, isLoading } = useCreate()
  const { list } = useNavigation()
  const { message } = App.useApp()

  const handleSubmit = (values: any) => {
    mutate(
      {
        resource: 'featureFlags',
        values: {
          ...values,
          enabled: values.enabled ?? false,
          allowedRoles: values.allowedRoles ?? [],
        },
      },
      {
        onSuccess: () => {
          message.success('Feature flag created')
          list('featureFlags')
        },
        onError: (err: any) => {
          message.error(err.message)
        },
      },
    )
  }

  return (
    <Create title="Create Feature Flag">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="special" label="Special">
          <Input />
        </Form.Item>
        <Form.Item name="enabled" label="Enabled" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="allowedRoles" label="Allowed Roles">
          <Select mode="tags" placeholder="Admin, User, etc." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create
          </Button>
        </Form.Item>
      </Form>
    </Create>
  )
}
