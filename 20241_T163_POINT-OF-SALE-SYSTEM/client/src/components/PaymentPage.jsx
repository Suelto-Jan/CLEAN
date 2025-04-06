import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import {Layout,Card,Typography,Button,InputNumber,Radio,Modal,Image,Divider,Space, Row,Col,message,Spin} from 'antd';
import {ShoppingCartOutlined,DollarCircleOutlined,LeftOutlined, ExclamationCircleOutlined,} from '@ant-design/icons';

const { Content } = Layout;

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { productads} = location.state || {};

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const baseURL = 'http://localhost:8000';

  useEffect(() => {
    const fetchedProduct = location.state?.product;
    const storedUser = localStorage.getItem('user');

    if (!fetchedProduct) {
      navigate('/login-selection');
      return;
    }

    setProduct(fetchedProduct);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        setError('Invalid user data. Redirecting...');
        setTimeout(() => navigate('/'), 3000);
      }
    } else {
      setError('User not logged in. Redirecting...');
      setTimeout(() => navigate('/'), 3000);
    }

    setLoading(false);
  }, [location.state, navigate]);

  const handleBack = () => navigate(-1);

  const handlePaymentClick = () => {
    if (!paymentMethod) {
      message.error('Please select a payment method!');
      return;
    }
    setIsModalOpen(true);
  };

  const createTransaction = async () => {
    // Ensure a payment method is selected
    if (!paymentMethod) {
      message.error('Please select a payment method!');
      return;
    }
  
    // Determine payment status based on the selected payment method
    const paymentStatus = paymentMethod === 'Cash' ? 'Paid' : 'Pay Later';
  
    // Log the payment method and status for debugging
    console.log('Payment Method:', paymentMethod);
    console.log('Payment Status:', paymentStatus);
  
    // Ensure user._id is valid
    if (!user?._id) {
      message.error('User is not authenticated!');
      return;
    }
  
    // Create the request data for the transaction
    const requestData = {
      transactionDate: new Date().toISOString(), // Use current date and time
      userId: user._id,  // Ensure the user._id is valid
      products: [{
        name: product?.name || 'Unnamed Product',  // Default to 'Unnamed Product' if no product name
        price: product?.price || 0,  // Default to 0 if no price is available
        quantity: quantity || 1,  // Default to 1 if quantity is not provided
        paymentStatus,  // Payment status for each product
      }],
      paymentStatus,  // Payment status at the root level
      paymentMethod,  // Payment method at the root level
    };
  
    console.log('Request Data:', requestData); // Debug log to verify the request data
  
    try {
      // Make the API request to create the transaction
      const response = await fetch(`${baseURL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      // Check for errors in the response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create transaction.' }));
        console.error('Error creating transaction:', errorData.message);
        throw new Error(errorData.message);
      }
  
      // Parse the response data
      const data = await response.json();
      console.log('Transaction created successfully:', data);
  
      // Optionally, display a success message
      message.success('Payment Successful! Please Wait!');
  
      // Return the transaction data for further processing if needed
      return data;
  
    } catch (error) {
      // Handle any errors during the API call
      console.error('Error creating transaction:', error.message);
      message.error('Error saving transaction. Please try again.');
      return null;
    }
  };

  if (!product) {
    return <div>No product selected from the ad.</div>;
  }
  
  const updatePurchasedItems = () => {
    try {
      // Fetch the existing purchased data from local storage
      const storedData = JSON.parse(localStorage.getItem('purchasedData')) || {};
      const userData = storedData[user._id] || { paidItems: [], payLaterItems: [] };

      // Add the product to the appropriate list based on the payment method
      if (paymentMethod === 'Cash') {
        userData.paidItems.push({
          name: product.name,
          price: product.price * quantity,
          quantity: quantity,
        });
      } else {
        userData.payLaterItems.push({
          name: product.name,
          price: product.price * quantity,
          quantity: quantity,
        });
      }

      // Update the purchased data in local storage
      storedData[user._id] = userData;
      localStorage.setItem('purchasedData', JSON.stringify(storedData));
      console.log('Purchased items updated successfully:', storedData); // Debug log
    } catch (error) {
      console.error('Error updating purchased items:', error.message);
    }
  };

  const updateProductQuantity = async () => {
    try {
      const response = await fetch(`${baseURL}/api/products/${product._id}/decrement`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product quantity.');
      }

      const data = await response.json();
      console.log('Product quantity updated successfully:', data); // Debug log
      return true;
    } catch (error) {
      console.error('Error updating product quantity:', error.message);
      message.error('Failed to update product quantity. Please try again.');
      return false;
    }
  };

  const handleConfirmPayment = async () => {
    try {
      // Ensure the product quantity is updated on the server
      const isUpdated = await updateProductQuantity();

      if (isUpdated) {
        // Create the transaction in the database
        const transaction = await createTransaction();

        if (transaction) {
          // Update local purchased data
          updatePurchasedItems();

          const receiptData = {
            product: {
              name: product.name,
              price: product.price,
            },
            quantity: quantity,
            totalPrice: product.price * quantity,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'Cash' ? 'Paid' : 'Pay Later',
            user: {
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
            },
            transactionId: uuidv4(), // Generate a unique transaction ID
            transactionDate: new Date().toISOString(),
          };

          const response = await fetch(`${baseURL}/api/generate-receipt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(receiptData),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Receipt generated and uploaded:', data);

            // Redirect to Thank You page with transaction details
            navigate('/thank-you', {
              state: {
                product,
                quantity,
                totalPrice: product.price * quantity,
                receiptUrl: data.fileUrl,
                paymentMethod,
                user: {
                  firstname: user.firstname,
                  lastname: user.lastname,
                },
              },
            });
          } else {
            const errorData = await response.json();
            console.error('Error:', errorData.errors);
            alert('Failed to generate receipt');
          }
        }
      }
    } catch (error) {
      console.error('Error during payment confirmation:', error.message);
      message.error('Payment could not be completed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Spin
        tip="Loading product details..."
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      />
    );
  }

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
        color: 'white',
        padding: '24px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={handleBack}
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Back
        </Button>
        <div style={{ textAlign: 'center', flexGrow: 1 }}>
          <Typography.Title level={3} style={{ color: '#FFD700', margin: 0 }}>
            🛒 Enjoy Buying!
          </Typography.Title>
          <Typography.Text style={{ color: '#FFFFFF', fontSize: '14px' }}>
            Double-check your selections before proceeding.
          </Typography.Text>
        </div>
      </div>

      {/* Content */}
      <Content>
        {error && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Typography.Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              {error}
            </Typography.Text>
          </div>
        )}

        <Row gutter={[24, 24]} justify="center">
          {/* Product Section */}
          <Col xs={24} sm={24} md={10}>
            <Card
              hoverable
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={`${baseURL}/${product.image?.replace(/\\/g, '/')}`}
                  alt={product.name}
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    marginBottom: '16px',
                  }}
                  preview={false}
                />
              </div>
              <Divider />
              <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Typography.Title level={4} style={{ color: '#333' }}>
                  {product.name}
                </Typography.Title>
                <Typography.Text style={{ fontSize: '16px', color: '#555' }}>
                  Price: <strong>₱{product.price}</strong>
                </Typography.Text>
                <Typography.Text style={{ fontSize: '16px', color: '#555' }}>
                  Available Quantity: <strong>{product.quantity}</strong>
                </Typography.Text>
              </Space>
              <Divider />
              <Typography.Text
                style={{
                  fontSize: '12px',
                  color: '#888',
                  textAlign: 'center',
                }}
              >
                * Ensure the selected quantity matches the available stock.
              </Typography.Text>
            </Card>
          </Col>

          {/* Payment Section */}
          <Col xs={24} sm={24} md={10}>
            <Card
              hoverable
              style={{
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Typography.Title
                  level={4}
                  style={{ color: '#333', textAlign: 'center', marginBottom: '16px' }}
                >
                  Payment Details
                </Typography.Title>
                <Divider />
                <Typography.Text>Quantity:</Typography.Text>
                <InputNumber
                  min={1}
                  max={product.quantity}
                  value={quantity}
                  onChange={setQuantity}
                  style={{
                    width: '100%',
                    marginBottom: '16px',
                  }}
                />
                <Typography.Text>Choose Payment Method:</Typography.Text>
                <Radio.Group
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  value={paymentMethod}
                  style={{ display: 'block', marginBottom: '16px' }}
                >
                  <Radio value="Cash">
                    <DollarCircleOutlined style={{ color: '#4caf50', marginRight: 10 }} />
                    Cash
                  </Radio>
                  <Radio value="Pay Later">
                    <ShoppingCartOutlined style={{ color: '#f44336', marginRight: 8 }} />
                    Pay Later
                  </Radio>
                </Radio.Group>
                <Typography.Text
                  style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '10px',
                  }}
                >
                  * All payment methods are secure and verified.
                </Typography.Text>
              </div>
              <Divider />
              <Typography.Text style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                Reminder: Confirm your quantity and payment method before proceeding.
              </Typography.Text>
              <Button
                type="primary"
                block
                size="large"
                onClick={handlePaymentClick}
                disabled={!paymentMethod}
                style={{
                  backgroundColor: '#4b6cb7',
                  borderColor: '#4b6cb7',
                }}
              >
                Pay ₱{product.price * quantity}
              </Button>
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Confirmation Modal */}
      <Modal
        title={
          <Typography.Text style={{ color: '#4b6cb7' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            Confirm Payment
          </Typography.Text>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmPayment}
            style={{
              backgroundColor: '#4b6cb7',
              borderColor: '#4b6cb7',
            }}
          >
            Confirm
          </Button>,
        ]}
      >
        <Typography.Text>
          You are about to pay <strong>₱{product.price * quantity}</strong> using{' '}
          <strong>{paymentMethod}</strong>. Do you want to proceed?
        </Typography.Text>
      </Modal>
    </Layout>
  );
}

export default PaymentPage;
