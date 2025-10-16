import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Rate, List, Avatar, Row, Col, message, Tooltip, Alert, Timeline } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  BulbOutlined,
  FileTextOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dataService from '../services/dataService';
import EnhancedTicketModal from './EnhancedTicketModal';

const { TextArea } = Input;
const { Option } = Select;

const ServiceDesk = ({ user }) => {
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketInitialData, setTicketInitialData] = useState({});
  
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'agent',
      agent: 'servicedesk',
      message: 'Hello! I\'m the Service Desk Agent. I can help you create tickets, track existing ones, and provide support. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Create a new ticket',
        'Check ticket status',
        'Get help with common issues',
        'Contact support team'
      ]
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTickets();
    
    // Set up real-time updates
    dataService.subscribe('new_ticket', handleNewTicket);
    dataService.subscribe('ticket_updated', handleTicketUpdate);
    
    return () => {
      dataService.unsubscribe('new_ticket', handleNewTicket);
      dataService.unsubscribe('ticket_updated', handleTicketUpdate);
    };
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await dataService.getTickets({ requester: user?.username });
      setTickets(response.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      // Start with empty tickets array - no mock data
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicket = (ticketData) => {
    setTickets(prev => [ticketData, ...prev]);
  };

  const handleTicketUpdate = (ticketData) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketData.id ? { ...ticket, ...ticketData } : ticket
    ));
  };

  const [knowledgeBase, setKnowledgeBase] = useState([]);

  const supportChannels = [
    {
      name: 'AI Assistant',
      description: 'Get instant help from our AI-powered assistant',
      icon: <MessageOutlined />,
      action: 'Available on Dashboard',
      color: '#1890ff'
    },
    {
      name: 'Phone Support',
      description: 'Call our support hotline for urgent issues',
      icon: <PhoneOutlined />,
      action: '+1-800-IT-HELP',
      color: '#52c41a'
    },
    {
      name: 'Email Support',
      description: 'Send detailed requests via email',
      icon: <MailOutlined />,
      action: 'support@company.com',
      color: '#faad14'
    }
  ];

  const handleCreateTicket = async (values) => {
    try {
      const ticketData = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category,
        requester: user?.username || 'Current User'
      };
      
      const newTicket = await dataService.createTicket(ticketData);
      message.success('Ticket created successfully');
      
      setIsTicketModalVisible(false);
      form.resetFields();
      loadTickets(); // Refresh tickets list
      
      // Add confirmation message to chat
      const confirmationMessage = {
        id: chatMessages.length + 1,
        type: 'agent',
        agent: 'servicedesk',
        message: `Great! I've created ticket ${newTicket.id} for you. The ticket "${newTicket.title}" has been assigned priority ${newTicket.priority} and is now in the queue for assignment.`,
        timestamp: new Date(),
        actions: ['View Ticket', 'Track Status', 'Add Comments']
      };
      
      setChatMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      message.error('Failed to create ticket');
      console.error('Error creating ticket:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate Service Desk Agent response
    setTimeout(() => {
      const response = generateServiceDeskResponse(newMessage);
      setChatMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  const generateServiceDeskResponse = (message) => {
    const messageLower = message.toLowerCase();
    let response = {
      id: Date.now(),
      type: 'agent',
      agent: 'servicedesk',
      timestamp: new Date(),
      actions: []
    };

    if (messageLower.includes('ticket') || messageLower.includes('issue') || messageLower.includes('problem')) {
      response.message = "I can help you create a ticket for your issue. Let me guide you through the process or you can use the 'Create Ticket' button above.";
      response.actions = ['Create New Ticket', 'View Existing Tickets', 'Check Ticket Status'];
    } else if (messageLower.includes('password') || messageLower.includes('login')) {
      response.message = "For password issues, I recommend checking our password reset guide in the knowledge base. Would you like me to create a ticket for password assistance?";
      response.actions = ['View Password Guide', 'Create Password Ticket', 'Contact IT Admin'];
    } else if (messageLower.includes('software') || messageLower.includes('install')) {
      response.message = "For software installation requests, I can create a ticket and route it to our application team. What software do you need installed?";
      response.actions = ['Create Software Request', 'View Software Catalog', 'Check Installation Status'];
    } else if (messageLower.includes('network') || messageLower.includes('internet') || messageLower.includes('wifi')) {
      response.message = "Network issues can be urgent. I can create a high-priority ticket and notify our network team immediately. Are you experiencing a complete outage?";
      response.actions = ['Create Network Ticket', 'Check Network Status', 'View Troubleshooting Guide'];
    } else if (messageLower.includes('email')) {
      response.message = "Email issues are common. I can help you with configuration or create a ticket for our email administrators. What specific email problem are you experiencing?";
      response.actions = ['Create Email Ticket', 'View Email Setup Guide', 'Check Email Status'];
    } else {
      response.message = "I'm here to help with any IT support needs. I can create tickets, provide information from our knowledge base, or connect you with the right support team. What do you need assistance with?";
      response.actions = ['Create General Ticket', 'Browse Knowledge Base', 'Contact Support Team'];
    }

    return response;
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
  };

  const handleActionClick = (action) => {
    if (action === 'Create New Ticket' || (action.includes('Create') && action.includes('Ticket'))) {
      // Generate smart ticket suggestion based on recent conversation
      const recentUserMessages = chatMessages
        .filter(m => m.type === 'user')
        .slice(-2)
        .map(m => m.message)
        .join(' ');
      
      const suggestion = generateTicketFromConversation(recentUserMessages);
      setTicketInitialData(suggestion);
      setIsTicketModalVisible(true);
    } else if (action === 'View Existing Tickets') {
      // Scroll to tickets table
      document.querySelector('.tickets-table')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'Browse Knowledge Base') {
      // Scroll to knowledge base
      document.querySelector('.knowledge-base')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generateTicketFromConversation = (conversationText) => {
    if (!conversationText) return {};

    let title = '';
    let description = conversationText;
    let priority = 'Medium';
    let category = 'Other';

    // Analyze conversation to suggest ticket details
    const text = conversationText.toLowerCase();
    
    if (text.includes('email') || text.includes('outlook')) {
      title = 'Email Issue - ' + conversationText.split(' ').slice(0, 5).join(' ');
      category = 'Email';
    } else if (text.includes('password') || text.includes('login')) {
      title = 'Access Issue - ' + conversationText.split(' ').slice(0, 5).join(' ');
      category = 'Access';
    } else if (text.includes('software') || text.includes('install')) {
      title = 'Software Request - ' + conversationText.split(' ').slice(0, 5).join(' ');
      category = 'Software';
    } else if (text.includes('network') || text.includes('internet')) {
      title = 'Network Issue - ' + conversationText.split(' ').slice(0, 5).join(' ');
      category = 'Network';
      priority = 'High';
    } else {
      title = 'Support Request - ' + conversationText.split(' ').slice(0, 5).join(' ');
    }

    return {
      title: title.substring(0, 100),
      description: description.substring(0, 500),
      priority,
      category
    };
  };

  const handleTicketSuccess = (ticket, routingResult) => {
    setIsTicketModalVisible(false);
    loadTickets(); // Refresh tickets list
    
    // Add success message to chat
    const successMessage = {
      id: chatMessages.length + 1,
      type: 'agent',
      agent: 'servicedesk',
      message: `Perfect! I've created ticket ${ticket.id} and intelligently routed it to the ${routingResult?.recommendedAgent || 'Service Desk'} agent. ${routingResult?.autoRoute ? 'The system will automatically handle the routing and you can track progress in the appropriate module.' : 'You can track its progress in the tickets table below.'}`,
      timestamp: new Date(),
      actions: ['View Ticket Details', 'Track Progress', 'Add Comments']
    };
    
    setChatMessages(prev => [...prev, successMessage]);
  };

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Button type="link" style={{ padding: 0 }}>{text}</Button>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Open' ? 'red' : status === 'In Progress' ? 'blue' : 'green';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        // Check if user is IT staff (admin, ittech, manager, security)
        const isITStaff = user?.role && ['admin', 'ittech', 'manager', 'security'].includes(user.role);
        
        return (
          <Space>
            <Tooltip title="View Details">
              <Button 
                size="small" 
                icon={<FileTextOutlined />}
                onClick={() => {
                  Modal.info({
                    title: `Ticket Details - ${record.id}`,
                    content: (
                      <div>
                        <p><strong>Title:</strong> {record.title}</p>
                        <p><strong>Status:</strong> <Tag color="blue">{record.status}</Tag></p>
                        <p><strong>Priority:</strong> <Tag color="orange">{record.priority}</Tag></p>
                        <p><strong>Assignee:</strong> {record.assignee || 'Unassigned'}</p>
                        <p><strong>Requester:</strong> {record.requester}</p>
                        <p><strong>Category:</strong> {record.category}</p>
                        <p><strong>Created:</strong> {record.created}</p>
                        {!isITStaff && (
                          <Alert
                            message="Ticket Status"
                            description="Your ticket has been submitted and is being processed by our IT team. You will be notified of any updates."
                            type="info"
                            showIcon
                            style={{ marginTop: '16px' }}
                          />
                        )}
                      </div>
                    ),
                    width: 600
                  });
                }}
              >
                View
              </Button>
            </Tooltip>
            
            {/* Only show management actions to IT staff */}
            {isITStaff && (
              <>
                <Tooltip title="Update Status">
                  <Button 
                    size="small" 
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Update Ticket Status',
                        content: `Update status for ticket ${record.id}?`,
                        onOk: () => {
                          const updatedTickets = tickets.map(t => 
                            t.id === record.id 
                              ? { ...t, status: 'In Progress', assignee: user?.username || 'IT Support' }
                              : t
                          );
                          setTickets(updatedTickets);
                          message.success(`Ticket ${record.id} status updated`);
                        }
                      });
                    }}
                  >
                    Update
                  </Button>
                </Tooltip>
                {record.status !== 'Resolved' && (
                  <Tooltip title="Resolve Ticket">
                    <Button 
                      size="small" 
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Resolve Ticket',
                          content: `Mark ticket ${record.id} as resolved?`,
                          onOk: () => {
                            const updatedTickets = tickets.map(t => 
                              t.id === record.id 
                                ? { ...t, status: 'Resolved' }
                                : t
                            );
                            setTickets(updatedTickets);
                            message.success(`Ticket ${record.id} resolved successfully`);
                          }
                        });
                      }}
                      style={{ backgroundColor: '#52c41a' }}
                    >
                      Resolve
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
            
            {/* End users only see a message about their ticket */}
            {!isITStaff && (
              <Tooltip title="Track Status">
                <Button 
                  size="small" 
                  icon={<ClockCircleOutlined />}
                  onClick={() => {
                    Modal.info({
                      title: 'Ticket Status',
                      content: (
                        <div>
                          <p>Your ticket <strong>{record.id}</strong> is currently: <Tag color="blue">{record.status}</Tag></p>
                          <p>Our IT team is working on your request. You will receive updates as the ticket progresses.</p>
                          <Timeline>
                            <Timeline.Item color="green">Ticket Created</Timeline.Item>
                            <Timeline.Item color={record.status === 'In Progress' ? 'blue' : 'gray'}>
                              {record.status === 'In Progress' ? 'In Progress - Being Worked On' : 'Waiting for Assignment'}
                            </Timeline.Item>
                            <Timeline.Item color={record.status === 'Resolved' ? 'green' : 'gray'}>
                              {record.status === 'Resolved' ? 'Resolved' : 'Pending Resolution'}
                            </Timeline.Item>
                          </Timeline>
                        </div>
                      ),
                      width: 600
                    });
                  }}
                >
                  Track Status
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Service Desk AI Agent */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CustomerServiceOutlined style={{ color: '#1890ff' }} />
                <span>Service Desk Agent</span>
                <Tag color="blue">AI Powered</Tag>
              </Space>
            }
            style={{ height: '500px', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, padding: '8px', background: '#fafafa', borderRadius: '8px' }}>
                <List
                  dataSource={chatMessages}
                  renderItem={item => (
                    <List.Item style={{ border: 'none', padding: '8px 0' }}>
                      <div style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: item.type === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '85%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          flexDirection: item.type === 'user' ? 'row-reverse' : 'row',
                          gap: '8px'
                        }}>
                          <Avatar 
                            icon={item.type === 'user' ? <UserOutlined /> : <CustomerServiceOutlined />}
                            style={{ 
                              backgroundColor: item.type === 'user' ? '#1890ff' : '#52c41a'
                            }}
                          />
                          <div style={{
                            backgroundColor: item.type === 'user' ? '#1890ff' : 'white',
                            color: item.type === 'user' ? 'white' : 'black',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: item.type === 'user' ? 'none' : '1px solid #d9d9d9',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            <div>{item.message}</div>
                            
                            {item.actions && item.actions.length > 0 && (
                              <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>
                                  Quick Actions:
                                </div>
                                <Space wrap>
                                  {item.actions.map((action, index) => (
                                    <Button 
                                      key={index}
                                      size="small"
                                      type="link"
                                      onClick={() => handleActionClick(action)}
                                      style={{ padding: '0 8px', height: 'auto' }}
                                    >
                                      {action}
                                    </Button>
                                  ))}
                                </Space>
                              </div>
                            )}
                            
                            {item.suggestions && (
                              <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>
                                  Suggestions:
                                </div>
                                <Space wrap>
                                  {item.suggestions.map((suggestion, index) => (
                                    <Button 
                                      key={index}
                                      size="small"
                                      onClick={() => handleSuggestionClick(suggestion)}
                                      style={{ fontSize: '11px' }}
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </Space>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
                
                {isLoading && (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Space>
                      <RobotOutlined spin />
                      <span>Service Desk Agent is thinking...</span>
                    </Space>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  placeholder="Describe your IT issue or request..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  style={{ flex: 1 }}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleSendMessage}
                  loading={isLoading}
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* Support Channels */}
        <Col xs={24} lg={12}>
          <Card title="Support Channels" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {supportChannels.map((channel, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ border: `1px solid ${channel.color}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px', color: channel.color }}>
                      {channel.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{channel.name}</div>
                      <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                        {channel.description}
                      </div>
                      <div style={{ fontWeight: 'bold', color: channel.color, fontSize: '14px' }}>
                        {channel.action}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Ticket Management */}
      <Card 
        title="Service Desk Tickets" 
        className="tickets-table"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsTicketModalVisible(true)}
          >
            Create Ticket
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        <Table 
          columns={columns} 
          dataSource={tickets}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
        />
      </Card>

      {/* Knowledge Base */}
      <Card title="Knowledge Base" className="knowledge-base" style={{ marginTop: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search knowledge base..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Select placeholder="Category" style={{ width: 150 }}>
            <Option value="all">All Categories</Option>
            <Option value="authentication">Authentication</Option>
            <Option value="network">Network</Option>
            <Option value="applications">Applications</Option>
            <Option value="email">Email</Option>
          </Select>
        </Space>
        
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 4 }}
          dataSource={knowledgeBase}
          renderItem={item => (
            <List.Item>
              <Card size="small" hoverable>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                    <BulbOutlined style={{ color: '#faad14', marginRight: '4px' }} />
                    {item.title}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>{item.category}</div>
                </div>
                <Space>
                  <span style={{ fontSize: '12px' }}>{item.views} views</span>
                  <Rate disabled defaultValue={item.rating} style={{ fontSize: '12px' }} />
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      {/* Enhanced Ticket Creation Modal */}
      <EnhancedTicketModal
        visible={isTicketModalVisible}
        onCancel={() => setIsTicketModalVisible(false)}
        onSubmit={handleCreateTicket}
        user={user}
        initialData={ticketInitialData}
      />
    </div>
  );
};

export default ServiceDesk;