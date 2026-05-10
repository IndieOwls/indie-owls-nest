import { Refine } from '@refinedev/core'
import { ThemedLayoutV2, RefineThemes, useNotificationProvider } from '@refinedev/antd'
import routerProvider from '@refinedev/react-router-v6'
import { ConfigProvider, App as AntApp } from 'antd'
import { Routes, Route, Outlet } from 'react-router-dom'

import { authProvider } from './authProvider'
import { dataProvider } from './dataProvider'

import { DashboardPage } from './pages/dashboard'
import { FeatureFlagList } from './pages/feature-flags/list'
import { FeatureFlagCreate } from './pages/feature-flags/create'
import { FeatureFlagEdit } from './pages/feature-flags/edit'
import { UserList } from './pages/users/list'

import '@refinedev/antd/dist/reset.css'

export default function App() {
  return (
    <ConfigProvider theme={RefineThemes.Blue}>
      <AntApp>
        <Refine
          authProvider={authProvider}
          dataProvider={dataProvider}
          routerProvider={routerProvider}
          notificationProvider={useNotificationProvider}
          resources={[
            { name: 'dashboard', list: '/', meta: { label: 'Dashboard' } },
            {
              name: 'featureFlags',
              list: '/feature-flags',
              create: '/feature-flags/create',
              edit: '/feature-flags/edit/:id',
              meta: { label: 'Feature Flags' },
            },
            { name: 'users', list: '/users', meta: { label: 'Users' } },
          ]}
        >
          <Routes>
            <Route
              element={
                <ThemedLayoutV2>
                  <Outlet />
                </ThemedLayoutV2>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="/feature-flags" element={<FeatureFlagList />} />
              <Route path="/feature-flags/create" element={<FeatureFlagCreate />} />
              <Route path="/feature-flags/edit/:id" element={<FeatureFlagEdit />} />
              <Route path="/users" element={<UserList />} />
            </Route>
          </Routes>
        </Refine>
      </AntApp>
    </ConfigProvider>
  )
}
