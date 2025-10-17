import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Option } = Select;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const users = [
    { username: 'admin', password: 'admin123', name: 'Admin User', role: 'Admin', email: 'admin@company.com', department: 'IT' },
    { username: 'ittech', password: 'admin123', name: 'IT Technician', role: 'IT Staff', email: 'ittech@company.com', department: 'IT' },
    { username: 'manager', password: 'admin123', name: 'IT Manager', role: 'Manager', email: 'manager@company.com', department: 'IT' },
    { username: 'user', password: 'admin123', name: 'End User', role: 'user', email: 'user@company.com', department: 'General' }
  ];

  const handleLogin = async (values) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = users.find(u => u.username === values.username && u.password === values.password);
      
      if (user) {
        // Store user data
        localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(user));
        
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (username) => {
    const user = users.find(u => u.username === username);
    if (user) {
      handleLogin({ username: user.username, password: user.password });
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row gutter={[32, 32]} style={{ width: '100%', maxWidth: '1200px' }}>
        <Col xs={24} lg={12}>
          <div style={{ color: 'white', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              color: 'white'
            }}>
              IT Automation Platform
            </h1>
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '32px',
              opacity: 0.9
            }}>
              Comprehensive enterprise IT automation and management solution
            </p>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '24px', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: 'white', marginBottom: '16px' }}>Key Features</h3>
              <ul style={{ 
                textAlign: 'left', 
                color: 'white', 
                opacity: 0.9,
                listStyle: 'none',
                padding: 0
              }}>
                <li>✅ Change Management & Approval Workflows</li>
                <li>✅ Asset Discovery & Configuration Management</li>
                <li>✅ Automated Software Installation & Patching</li>
                <li>✅ VM Provisioning & Template Management</li>
                <li>✅ User Access Management & Security</li>
                <li>✅ OS Deployment & Hardening</li>
                <li>✅ AI-Powered Assistant & Analytics</li>
                <li>✅ Real-time Monitoring & Reporting</li>
              </ul>
            </div>
          </div>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            style={{ 
              maxWidth: '400px', 
              margin: '0 auto',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <LoginOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <h2 style={{ margin: 0 }}>Welcome Back</h2>
              <p style={{ color: '#666', margin: '8px 0 0 0' }}>Sign in to your account</p>
            </div>

            {error && (
              <Alert 
                message={error} 
                type="error" 
                style={{ marginBottom: '16px' }}
                showIcon 
              />
            )}

            <Form onFinish={handleLogin} layout="vertical">
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  block
                  loading={loading}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            {/*<div style={{ marginTop: '24px' }}>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '16px' }}>
                Quick Login (Demo):
              </p>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => handleQuickLogin('admin')}
                  >
                    Admin
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => handleQuickLogin('ittech')}
                  >
                    IT Staff
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => handleQuickLogin('manager')}
                  >
                    Manager
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => handleQuickLogin('user')}
                  >
                    End User
                  </Button>
                </Col>
              </Row>
            </div>*/}

            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#666'
            }}>
              {/*<strong>Demo Credentials:</strong><br/>
              Admin: admin / admin123<br/>
              IT Tech: ittech / admin123<br/>
              Manager: manager / admin123<br/>
              End User: user / admin123*/}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;