import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Divider, Row, Col, Space } from 'antd';
import { LogoutOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();

  const baseURL = 'http://localhost:8000';
  // Retrieve purchase details from location.state or fallback to localStorage
  const { product, quantity, totalPrice, paymentMethod, user } =
    location.state || JSON.parse(localStorage.getItem('lastPurchase')) || {};

  useEffect(() => {
    // If state is missing, check localStorage for fallback data
    if (!product || !user) {
      const fallbackData = JSON.parse(localStorage.getItem('lastPurchase'));
      if (!fallbackData) {
        // Redirect to home if no fallback data
        navigate('/login-selection');
      }
    } else {
      // Save current purchase details in localStorage for backup
      localStorage.setItem(
        'lastPurchase',
        JSON.stringify({ product, quantity, totalPrice, paymentMethod, user })
      );
    }
  }, [product, user, quantity, totalPrice, paymentMethod, navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.clear(); // Clear all stored user data
    navigate('/login-selection'); // Redirect to login page
  };

  // If no valid data is found, show the error
  if (!product || !user) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative', // For absolute positioning of the logout button
          padding: '0 24px', // Padding to prevent overflow
        }}
      >
        <Card
          style={{
            maxWidth: 400,
            textAlign: 'center',
            borderRadius: '15px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            background: '#ecf0f1',
            padding: '24px',
          }}
        >
          <Title level={2} style={{ color: '#e74c3c' }}>
            Error
          </Title>
          <Text style={{ color: '#7f8c8d' }}>No purchase details found.</Text>
          <Divider />
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{
              background: '#16a085',
              borderColor: '#16a085',
              padding: '8px 20px',
              fontSize: '16px',
            }}
          >
            Go Back Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden', // Prevents scrolling
      }}
    >
      <Button
        type="text"
        style={{
          color: '#f44336',
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '18px',
        }}
        icon={<LogoutOutlined />}
        onClick={handleLogout}
      >
        Logout
      </Button>

      <Card
        style={{
          maxWidth: 600,
          width: '100%',
          borderRadius: '20px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          overflow: 'hidden',
          padding: '24px',
        }}
      >
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <CheckCircleOutlined
            style={{
              fontSize: '64px',
              color: '#2ecc71',
              marginBottom: '16px',
            }}
          />
          <Title level={2} style={{ color: '#4b6cb7' }}>
            Thank You for Your Purchase!
          </Title>
          <Text style={{ fontSize: '16px', color: '#7f8c8d' }}>
            Your transaction was successful.
          </Text>
        </Space>
        <Divider style={{ borderColor: '#bdc3c7' }} />
        <Title level={4} style={{ textAlign: 'center', color: '#4b6cb7' }}>
          Receipt
        </Title>

        {/* Product Image Section */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img
            src={`${baseURL}/${product.image?.replace(/\\/g, '/')}`}
            alt={product.name}
            style={{
              width: '100%',
              maxWidth: '180px', // Reduced image size to fit better
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={12}>
            <Text strong>Purchased By:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text style={{ color: '#7f8c8d' }}>
              {user.firstname} {user.lastname}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>Product:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text style={{ color: '#7f8c8d' }}>{product.name}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Quantity:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text style={{ color: '#7f8c8d' }}>{quantity}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Price:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text style={{ color: '#7f8c8d' }}>₱{product.price.toFixed(2)}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Total Price:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text style={{ color: '#7f8c8d' }}>₱{totalPrice.toFixed(2)}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Payment Method:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text style={{ color: '#7f8c8d' }}>{paymentMethod}</Text>
          </Col>
        </Row>
        <Divider style={{ borderColor: '#bdc3c7' }} />
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <Text style={{ fontStyle: 'italic', color: '#7f8c8d' }}>
            We hope to see you again!
          </Text>
          <Button
            type="primary"
            style={{
              background: '#4b6cb7',
              borderColor: '#4b6cb7',
              padding: '10px 20px',
              fontSize: '16px',
            }}
            onClick={() => navigate('/scan')}
          >
            Scan Another Product
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default ThankYou;
