import { useOne, useUpdate, useNavigation } from '@refinedev/core'
import { Edit } from '@refinedev/antd'
import { Form, Input, Switch, Select, Button, Spin, App } from 'antd'
import { useParams } from 'react-router-dom'

export function FeatureFlagEdit() {
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const { mutate, isLoading: updating } = useUpdate()
  const { list } = useNavigation()
  const { message } = App.useApp()

  const { data, isLoading } = useOne({ resource: 'featureFlags', id: id ?? '' })

  const handleSubmit = (values: any) => {
    mutate(
      {
        resource: 'featureFlags',
        id: id ?? '',
        values: {
          ...values,
          allowedRoles: values.allowedRoles ?? [],
        },
      },
      {
        onSuccess: () => {
          message.success('Feature flag updated')
          list('featureFlags')
        },
        onError: (err: any) => {
          message.error(err.message)
        },
      },
    )
  }

  if (isLoading) return <Spin />

  return (
    <Edit title="Edit Feature Flag">
      <Form
        form={form}
        layout="vertical"
        initialValues={data?.data}
        onFinish={handleSubmit}
      >
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
          <Button type="primary" htmlType="submit" loading={updating}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Edit>
  )
}
