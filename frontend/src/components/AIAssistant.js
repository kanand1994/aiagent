import React, { useState, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Typography, Space, Tag, Spin } from 'antd';
import { 
  RobotOutlined, 
  SendOutlined, 
  UserOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';

const { TextArea } = Input;
const { Text } = Typography;

const AIAssistant = ({ user, onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState([
    'Take me to change management',
    'Show me asset inventory', 
    'I need to install software',
    'Create a new VM',
    'Check system performance',
    'View my tickets'
  ]);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: `Hello ${user?.name || 'there'}! I'm your IT automation assistant. I can help you with tickets, system monitoring, change management, and more. What can I help you with today?`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Simulate AI response - in real implementation, this would call your AI service
      const response = await simulateAIResponse(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response || response,
        timestamp: new Date(),
        navigating: response.shouldNavigate ? true : false,
        navigationTarget: response.shouldNavigate
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again or contact support.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const simulateAIResponse = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();
    let response = '';
    let shouldNavigate = null;

    // Intelligent routing based on user queries
    if (lowerMessage.includes('change') && (lowerMessage.includes('management') || lowerMessage.includes('request') || lowerMessage.includes('create'))) {
      response = 'I\'ll take you to Change Management where you can create and manage change requests. You\'ll be able to provide a title, description, business justification, and rollback plan. The system will route it through the appropriate approval workflow based on the risk level.';
      shouldNavigate = 'change-management';
    }
    else if (lowerMessage.includes('asset') || (lowerMessage.includes('inventory') || lowerMessage.includes('hardware') || lowerMessage.includes('equipment'))) {
      response = 'Let me take you to Asset Management where you can view and manage all IT assets. You can run asset discovery, check compliance scores, and monitor configuration drift. I\'ll navigate you there now.';
      shouldNavigate = 'asset-management';
    }
    else if (lowerMessage.includes('software') && (lowerMessage.includes('install') || lowerMessage.includes('request') || lowerMessage.includes('catalog'))) {
      response = 'I\'ll navigate you to the Software Installation module where you can browse our approved software catalog and request installations. Many applications are pre-approved for automatic deployment.';
      shouldNavigate = 'application-installation';
    }
    else if (lowerMessage.includes('vm') || lowerMessage.includes('virtual machine') || lowerMessage.includes('provision')) {
      response = 'Taking you to VM Management where you can provision new virtual machines. We have templates for Windows Server 2022, Ubuntu 22.04, and CentOS 8. Typical provisioning time is 5-10 minutes.';
      shouldNavigate = 'vm-management';
    }
    else if (lowerMessage.includes('template') && (lowerMessage.includes('create') || lowerMessage.includes('manage') || lowerMessage.includes('ova'))) {
      response = 'I\'ll take you to Template Management where you can create and manage VM templates and OVA files. You can build custom templates with automated security hardening.';
      shouldNavigate = 'template-management';
    }
    else if (lowerMessage.includes('patch') || lowerMessage.includes('update') || lowerMessage.includes('security update')) {
      response = 'Navigating to Patch Management where you can view and deploy patches. We currently have 15 patches pending deployment, including 3 critical security updates. All patches are tested in our staging environment first.';
      shouldNavigate = 'patch-management';
    }
    else if (lowerMessage.includes('user') && (lowerMessage.includes('access') || lowerMessage.includes('permission') || lowerMessage.includes('onboard'))) {
      response = 'I\'ll take you to User Access Management where you can manage user permissions, onboarding, and access requests. The system provides automated provisioning and access reviews.';
      shouldNavigate = 'user-access-management';
    }
    else if (lowerMessage.includes('os') && (lowerMessage.includes('deploy') || lowerMessage.includes('install') || lowerMessage.includes('management'))) {
      response = 'Taking you to OS Management where you can deploy and manage operating systems. The system provides full lifecycle automation with security hardening and compliance validation.';
      shouldNavigate = 'os-management';
    }
    else if (lowerMessage.includes('ticket') || lowerMessage.includes('incident') || lowerMessage.includes('service desk')) {
      response = 'I\'ll navigate you to the Service Desk where you can create and manage tickets. You currently have access to create tickets and track their progress. Let me take you there now.';
      shouldNavigate = 'service-desk';
    }
    else if (lowerMessage.includes('report') || lowerMessage.includes('analytics') || lowerMessage.includes('dashboard')) {
      response = 'Taking you to Reports & Analytics where you can view comprehensive system metrics, performance data, and executive dashboards. You\'ll find detailed insights about your IT operations.';
      shouldNavigate = 'reports-analytics';
    }
    else if (lowerMessage.includes('notification')) {
      response = 'I\'ll take you to your Notifications center where you can view and manage all system notifications, alerts, and updates.';
      shouldNavigate = 'notifications';
    }
    else if (lowerMessage.includes('profile') || lowerMessage.includes('settings')) {
      response = 'Navigating to your Profile Settings where you can update your personal information, contact details, and account preferences.';
      shouldNavigate = 'profile-settings';
    }
    else if (lowerMessage.includes('preference')) {
      response = 'Taking you to Preferences where you can customize your system settings, appearance, notifications, and regional preferences.';
      shouldNavigate = 'preferences';
    }
    else if (lowerMessage.includes('performance') || lowerMessage.includes('metrics') || lowerMessage.includes('system status')) {
      response = 'Current system performance looks good! CPU usage is at 65%, memory at 78%, and disk at 45%. All systems are within normal operating parameters. Let me take you to the Dashboard for detailed metrics.';
      shouldNavigate = 'dashboard';
    }
    else if (lowerMessage.includes('alert') || lowerMessage.includes('critical')) {
      response = 'I found 2 critical alerts: 1) High memory usage on server SRV-DB-01 (85%), and 2) Network latency spike detected on subnet 192.168.1.0/24. Let me take you to the Dashboard to view all alerts.';
      shouldNavigate = 'dashboard';
    }
    else {
      // Default response with suggestions
      response = 'I can help you navigate to different modules based on your needs. Try asking me about:\n\n• "Take me to change management"\n• "Show me asset inventory"\n• "I need to install software"\n• "Create a new VM"\n• "Check system performance"\n• "View my tickets"\n• "Show me reports"\n\nWhat would you like to do?';
    }

    // Auto-navigate if a route was determined
    if (shouldNavigate && onNavigate) {
      setTimeout(() => {
        onNavigate(shouldNavigate);
      }, 2000); // Navigate after 2 seconds to let user read the response
    }

    return {
      response,
      shouldNavigate
    };
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <Card 
      title={
        <Space>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <span>AI Assistant</span>
          <Tag color="green">Online</Tag>
        </Space>
      }
      style={{ height: 400 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, maxHeight: 250 }}>
          <List
            dataSource={messages}
            renderItem={message => (
              <List.Item style={{ border: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={message.type === 'ai' ? <RobotOutlined /> : <UserOutlined />}
                      style={{ 
                        backgroundColor: message.type === 'ai' ? '#1890ff' : '#52c41a' 
                      }}
                    />
                  }
                  description={
                    <div>
                      <Text>{message.content}</Text>
                      {message.navigating && (
                        <div style={{ 
                          marginTop: 8, 
                          padding: 8, 
                          background: '#e6f7ff', 
                          borderRadius: 4,
                          fontSize: '12px',
                          color: '#1890ff'
                        }}>
                          <ArrowRightOutlined style={{ marginRight: 4 }} />
                          Navigating you to the requested module...
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#999', marginTop: 4 }}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin size="small" />
              <Text style={{ marginLeft: 8, color: '#666' }}>AI is thinking...</Text>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: '12px', color: '#666', marginBottom: 8, display: 'block' }}>
              <BulbOutlined /> Quick suggestions:
            </Text>
            <Space wrap>
              {suggestions.map((suggestion, index) => (
                <Tag 
                  key={index}
                  style={{ cursor: 'pointer', marginBottom: 4 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  {suggestion}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <TextArea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about IT automation..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
            disabled={!inputMessage.trim()}
          />
        </div>
      </div>
    </Card>
  );
};

export default AIAssistant;