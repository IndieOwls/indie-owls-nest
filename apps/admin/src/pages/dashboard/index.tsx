import { useList } from '@refinedev/core'
import { Card, Col, Row, Statistic } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function useCount(resource: string) {
  const { data } = useList({ resource })
  return data?.total ?? 0
}

export function DashboardPage() {
  const userCount = useCount('users')
  const flagCount = useCount('featureFlags')

  const { data: articles } = useList({ resource: 'appNewsArticles' })
  const publishedCount = articles?.data?.filter((a: any) => a.isPublished).length ?? 0
  const draftCount = (articles?.total ?? 0) - publishedCount

  const chartData = [
    { name: 'Users', count: userCount },
    { name: 'Feature Flags', count: flagCount },
    { name: 'Published Articles', count: publishedCount },
  ]

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <h2>Dashboard</h2>
      </Col>

      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="Total Users" value={userCount} />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="Feature Flags" value={flagCount} />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="News Articles" value={articles?.total ?? 0} />
        </Card>
      </Col>

      <Col xs={24} sm={12}>
        <Card title="Content Overview" style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1677ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      <Col xs={24} sm={12}>
        <Card title="Article Status" style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Published', count: publishedCount },
              { name: 'Draft', count: draftCount },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#52c41a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  )
}
