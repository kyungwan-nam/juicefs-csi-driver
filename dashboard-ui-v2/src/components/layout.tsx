/**
 * Copyright 2024 Juicedata Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ReactNode, useEffect, useState } from 'react'
import {
  GithubOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import {
  Layout as AntdLayout,
  Button,
  ConfigProvider,
  Menu,
  MenuProps,
  Space,
  Tooltip,
} from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { FormattedMessage, IntlProvider } from 'react-intl'
import { Link, useLocation } from 'react-router-dom'

import ConfigModal from './config-modal'
import { DSIcon, LocaleIcon, PODIcon, PVCIcon, PVIcon, SCIcon } from '@/icons'
import en from '@/locales/en-US'
import cn from '@/locales/zh-CN'

const { Header, Sider, Content } = AntdLayout

const items: MenuProps['items'] = [
  {
    icon: <PODIcon />,
    label: (
      <Link to="/pods">
        <FormattedMessage id="appPodTable" />
      </Link>
    ),
    key: '/pods',
  },
  {
    icon: <DSIcon />,
    label: (
      <Link to="/syspods">
        <FormattedMessage id="sysPodTable" />
      </Link>
    ),
    key: '/syspods',
  },
  {
    icon: <PVIcon />,
    label: <Link to="/pvs">PV</Link>,
    key: '/pvs',
  },
  {
    icon: <PVCIcon />,
    label: <Link to="/pvcs">PVC</Link>,
    key: '/pvcs',
  },
  {
    icon: <SCIcon />,
    label: <Link to="/storageclass">Storage Class</Link>,
    key: '/storageclass',
  },
]

export default function Layout(props: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>()
  const location = useLocation()

  useEffect(() => {
    if (locale) {
      window.localStorage.setItem('locale', locale)
    }
  }, [locale])

  useEffect(() => {
    const locale = window.localStorage.getItem('locale')
    setLocale(locale ?? 'zh')
  }, [])

  return (
    <IntlProvider messages={locale == 'zh' ? cn : en} locale={locale ?? 'zh'}>
      <AntdLayout>
        <Header
          style={{
            position: 'fixed',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            padding: '0 20px',
          }}
        >
          <h2>JuiceFS CSI</h2>
          <Space size={'middle'} style={{ marginLeft: 'auto' }}>
            <Tooltip title="Docs">
              <Button
                icon={<QuestionCircleOutlined />}
                className="header-button"
                onClick={() => {
                  // open a new tab to the JuiceFS CSI documentation
                  window.open(
                    'https://juicefs.com/docs/csi/introduction/',
                    '_blank',
                  )
                }}
              />
            </Tooltip>
            <ConfigModal>
              {({ onClick }) => (
                <Tooltip title={<FormattedMessage id="config" />}>
                  <Button
                    icon={<SettingOutlined />}
                    className="header-button"
                    onClick={onClick}
                  />
                </Tooltip>
              )}
            </ConfigModal>
            <Tooltip title="English / 中文">
              <Button
                icon={<LocaleIcon />}
                className="header-button"
                onClick={() => {
                  setLocale(locale === 'zh' ? 'en' : 'zh')
                }}
              />
            </Tooltip>
            <Button
              icon={<GithubOutlined />}
              className="header-button"
              onClick={() => {
                window.open(
                  'https://github.com/juicedata/juicefs-csi-driver',
                  '_blank',
                )
              }}
            />
          </Space>
        </Header>
        <ConfigProvider locale={locale == 'zh' ? zhCN : enUS}>
          <AntdLayout hasSider>
            <Sider
              style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                marginTop: '64px',
              }}
            >
              <Menu
                mode="inline"
                selectedKeys={[
                  location.pathname == '/'
                    ? '/pods'
                    : `/${location.pathname.split('/')[1]}`,
                ]}
                defaultOpenKeys={['/pods']}
                style={{ height: '100%' }}
                items={items}
              />
            </Sider>
          </AntdLayout>
          <AntdLayout style={{ marginLeft: 200, marginTop: '64px' }}>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#00b96b',
                  borderRadius: 4,
                  colorBgContainer: '#ffffff',
                },
              }}
            >
              <Content>{props.children}</Content>
            </ConfigProvider>
          </AntdLayout>
        </ConfigProvider>
      </AntdLayout>
    </IntlProvider>
  )
}
