import { useMany } from '@refinedev/core'
import { List } from '@refinedev/antd'
import { Table, Tag } from 'antd'

export function UserList() {
  const { data, isLoading } = useMany({
    resource: 'users',
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
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag>{role}</Tag>,
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : '-'),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
  ]

  return (
    <List title="Users">
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
