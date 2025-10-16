import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  Steps, 
  Card, 
  Row, 
  Col, 
  Tag, 
  Timeline, 
  Upload, 
  message,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const EnhancedTicketModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  ticket = null, 
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showRouting, setShowRouting] = useState(false);
  const [ticketData, setTicketData] = useState({});

  useEffect(() => {
    if (ticket && mode !== 'create') {
      form.setFieldsValue(ticket);
      setTicketData(ticket);
    } else {
      form.resetFields();
      setTicketData({});
    }
  }, [ticket, mode, form]);

  const handleFormChange = (changedFields, allFields) => {
    const formData = {};
    allFields.forEach(field => {
      formData[field.name[0]] = field.value;
    });
    setTicketData(formData);
  };

  const handleNext = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      message.error('Please fill in all required fields');
    });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const ticketData = {
        ...values,
        attachments,
        createdAt: new Date().toISOString(),
        status: 'Open',
        id: ticket?.id || Date.now()
      };

      await onSubmit(ticketData);
      form.resetFields();
      setCurrentStep(0);
      setAttachments([]);
      message.success(`Ticket ${mode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (error) {
      message.error('Failed to save ticket');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: (file) => {
      setAttachments(prev => [...prev, file]);
      return false; // Prevent auto upload
    },
    onRemove: (file) => {
      setAttachments(prev => prev.filter(item => item.uid !== file.uid));
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Ticket Title"
                  rules={[{ required: true, message: 'Please enter ticket title' }]}
                >
                  <Input placeholder="Brief description of the issue" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category">
                    <Option value="Hardware">Hardware</Option>
                    <Option value="Software">Software</Option>
                    <Option value="Network">Network</Option>
                    <Option value="Security">Security</Option>
                    <Option value="Access">Access Request</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Priority"
                  rules={[{ required: true, message: 'Please select priority' }]}
                >
                  <Select placeholder="Select priority">
                    <Option value="Low">Low</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="High">High</Option>
                    <Option value="Critical">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="urgency"
                  label="Urgency"
                  rules={[{ required: true, message: 'Please select urgency' }]}
                >
                  <Select placeholder="Select urgency">
                    <Option value="Low">Low</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="High">High</Option>
                    <Option value="Critical">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Detailed description of the issue, including steps to reproduce if applicable"
              />
            </Form.Item>
          </div>
        );

      case 1:
        return (
          <div>
            <Form.Item
              name="businessImpact"
              label="Business Impact"
              rules={[{ required: true, message: 'Please describe business impact' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="How does this issue affect business operations?"
              />
            </Form.Item>

            <Form.Item
              name="stepsToReproduce"
              label="Steps to Reproduce (if applicable)"
            >
              <TextArea 
                rows={4} 
                placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
              />
            </Form.Item>

            <Form.Item
              name="expectedBehavior"
              label="Expected Behavior"
            >
              <TextArea 
                rows={2} 
                placeholder="What should happen normally?"
              />
            </Form.Item>

            <Form.Item
              name="actualBehavior"
              label="Actual Behavior"
            >
              <TextArea 
                rows={2} 
                placeholder="What is actually happening?"
              />
            </Form.Item>
          </div>
        );

      case 2:
        return (
          <div>
            <Form.Item
              name="attachments"
              label="Attachments"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>
                  Upload Files (Screenshots, logs, etc.)
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="contactInfo"
              label="Contact Information"
            >
              <Input placeholder="Phone number or alternative contact method" />
            </Form.Item>

            <Form.Item
              name="preferredContactTime"
              label="Preferred Contact Time"
            >
              <Select placeholder="When is the best time to contact you?">
                <Option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</Option>
                <Option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</Option>
                <Option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</Option>
                <Option value="Anytime">Anytime</Option>
              </Select>
            </Form.Item>

            <Card title="Ticket Summary" size="small" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <strong>Title:</strong> {ticketData.title || 'Not specified'}
                </Col>
                <Col span={12}>
                  <strong>Category:</strong> {ticketData.category || 'Not specified'}
                </Col>
                <Col span={12}>
                  <strong>Priority:</strong> 
                  <Tag color={
                    ticketData.priority === 'Critical' ? 'red' :
                    ticketData.priority === 'High' ? 'orange' :
                    ticketData.priority === 'Medium' ? 'blue' : 'green'
                  } style={{ marginLeft: 8 }}>
                    {ticketData.priority || 'Not specified'}
                  </Tag>
                </Col>
                <Col span={12}>
                  <strong>Urgency:</strong>
                  <Tag color={
                    ticketData.urgency === 'Critical' ? 'red' :
                    ticketData.urgency === 'High' ? 'orange' :
                    ticketData.urgency === 'Medium' ? 'blue' : 'green'
                  } style={{ marginLeft: 8 }}>
                    {ticketData.urgency || 'Not specified'}
                  </Tag>
                </Col>
              </Row>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    {
      title: 'Basic Info',
      description: 'Ticket details'
    },
    {
      title: 'Impact & Details',
      description: 'Business impact'
    },
    {
      title: 'Attachments & Contact',
      description: 'Additional info'
    }
  ];

  return (
    <Modal
      title={
        mode === 'create' ? 'Create New Ticket' :
        mode === 'edit' ? 'Edit Ticket' : 'View Ticket'
      }
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFieldsChange={handleFormChange}
      >
        {mode === 'view' ? (
          // View mode - show ticket details
          <div>
            <Timeline>
              <Timeline.Item 
                dot={<UserOutlined />} 
                color="blue"
              >
                <strong>Ticket Created</strong>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  {ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'Unknown'}
                </div>
              </Timeline.Item>
              <Timeline.Item 
                dot={<ClockCircleOutlined />} 
                color="orange"
              >
                <strong>In Progress</strong>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  Assigned to IT Support Team
                </div>
              </Timeline.Item>
            </Timeline>
          </div>
        ) : (
          // Create/Edit mode - show form steps
          <div>
            <Steps current={currentStep} style={{ marginBottom: 24 }}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} description={item.description} />
              ))}
            </Steps>

            <div style={{ minHeight: 300 }}>
              {getStepContent(currentStep)}
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              {currentStep > 0 && (
                <Button style={{ marginRight: 8 }} onClick={handlePrev}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button 
                  type="primary" 
                  onClick={handleSubmit}
                  loading={loading}
                >
                  {mode === 'create' ? 'Create Ticket' : 'Update Ticket'}
                </Button>
              )}
              <Button style={{ marginLeft: 8 }} onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default EnhancedTicketModal;