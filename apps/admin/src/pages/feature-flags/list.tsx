import { useMany } from '@refinedev/core'
import { List } from '@refinedev/antd'
import { Table, Tag } from 'antd'
import { Link } from 'react-router-dom'

export function FeatureFlagList() {
  const { data, isLoading } = useMany({
    resource: 'featureFlags',
    ids: [],
  })

  const items = (data?.data as any[]) ?? []

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Link to={`/feature-flags/edit/${record.id}`}>{name}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>{enabled ? 'ON' : 'OFF'}</Tag>
      ),
    },
    {
      title: 'Allowed Roles',
      dataIndex: 'allowedRoles',
      key: 'allowedRoles',
      render: (roles: string[]) =>
        roles?.length
          ? roles.map((r) => <Tag key={r}>{r}</Tag>)
          : <Tag>all</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
  ]

  return (
    <List title="Feature Flags">
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />
    </List>
  )
}
