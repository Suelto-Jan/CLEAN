import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import {Layout,Card,Typography,Button,InputNumber,Radio,Modal,Image,Divider,Space, Row,Col,message,Spin} from 'antd';
import {ShoppingCartOutlined,DollarCircleOutlined,LeftOutlined, ExclamationCircleOutlined,} from '@ant-design/icons';
import config from '../config';

const { Content } = Layout;

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { productads, cart } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const baseURL = config.apiUrl;

  useEffect(() => {
    const fetchedProduct = location.state?.product;
    const fetchedCart = location.state?.cart;
    const storedUser = localStorage.getItem('user');

    // Check if we have either a single product or a cart with items
    if (!fetchedProduct && (!fetchedCart || fetchedCart.length === 0)) {
      navigate('/login-selection');
      return;
    }

    // If we have a single product, set it
    if (fetchedProduct) {
      setProduct(fetchedProduct);
    }

    // If we have a cart with items, set the cart items
    if (fetchedCart && fetchedCart.length > 0) {
      setCartItems(fetchedCart);
    }

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

    // Prepare products array based on whether we have a single product or cart items
    let productsArray = [];

    if (cartItems && cartItems.length > 0) {
      // We have cart items, use them
      productsArray = cartItems.map(item => ({
        productId: item.product._id,
        name: item.product.name || 'Unnamed Product',
        price: item.product.price || 0,
        quantity: item.quantity || 1,
        paymentStatus,
      }));
    } else if (product) {
      // We have a single product
      productsArray = [{
        productId: product._id,
        name: product.name || 'Unnamed Product',
        price: product.price || 0,
        quantity: quantity || 1,
        paymentStatus,
      }];
    } else {
      message.error('No products to process!');
      return;
    }

    // Calculate total amount
    const totalAmount = productsArray.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    // Create the request data for the transaction
    const requestData = {
      transactionDate: new Date().toISOString(),
      userId: user._id,
      products: productsArray,
      totalAmount,
      paymentStatus,
      paymentMethod,
    };

    console.log('Request Data:', requestData); // Debug log to verify the request data

    try {
      // Make the API request to create the transaction
      const response = await fetch(`${config.apiUrl}/api/transactions`, {
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

  // Check if we have either a product or cart items
  if (!product && (!cartItems || cartItems.length === 0)) {
    return <div>No products selected for payment.</div>;
  }

  const updatePurchasedItems = () => {
    try {
      // Fetch the existing purchased data from local storage
      const storedData = JSON.parse(localStorage.getItem('purchasedData')) || {};
      const userData = storedData[user._id] || { paidItems: [], payLaterItems: [] };

      // Handle multiple products from cart
      if (cartItems && cartItems.length > 0) {
        // Process each cart item
        cartItems.forEach(item => {
          const purchaseItem = {
            name: item.product.name,
            price: item.product.price * item.quantity,
            quantity: item.quantity,
          };

          // Add the product to the appropriate list based on the payment method
          if (paymentMethod === 'Cash') {
            userData.paidItems.push(purchaseItem);
          } else {
            userData.payLaterItems.push(purchaseItem);
          }
        });
      }
      // Handle single product
      else if (product) {
        const purchaseItem = {
          name: product.name,
          price: product.price * quantity,
          quantity: quantity,
        };

        // Add the product to the appropriate list based on the payment method
        if (paymentMethod === 'Cash') {
          userData.paidItems.push(purchaseItem);
        } else {
          userData.payLaterItems.push(purchaseItem);
        }
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
      let success = true;

      // Handle multiple products from cart
      if (cartItems && cartItems.length > 0) {
        // Process each cart item
        for (const item of cartItems) {
          const response = await fetch(`${baseURL}/api/products/${item.product._id}/decrement`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to update quantity for ${item.product.name}:`, errorData.message);
            success = false;
            break;
          }

          const data = await response.json();
          console.log(`Product ${item.product.name} quantity updated successfully:`, data);
        }
      }
      // Handle single product
      else if (product) {
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
        console.log('Product quantity updated successfully:', data);
      }

      return success;
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

          // Prepare receipt data based on whether we have cart items or a single product
          let receiptData;

          if (cartItems && cartItems.length > 0) {
            // Calculate total price for all cart items
            const totalPrice = cartItems.reduce(
              (total, item) => total + (item.product.price * item.quantity),
              0
            );

            // Create receipt data for multiple products
            receiptData = {
              products: cartItems.map(item => ({
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                totalPrice: item.product.price * item.quantity,
              })),
              totalPrice,
              paymentMethod,
              paymentStatus: paymentMethod === 'Cash' ? 'Paid' : 'Pay Later',
              user: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
              },
              transactionId: uuidv4(),
              transactionDate: new Date().toISOString(),
              isMultipleProducts: true,
            };
          } else {
            // Create receipt data for a single product
            receiptData = {
              product: {
                name: product.name,
                price: product.price,
              },
              quantity,
              totalPrice: product.price * quantity,
              paymentMethod,
              paymentStatus: paymentMethod === 'Cash' ? 'Paid' : 'Pay Later',
              user: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
              },
              transactionId: uuidv4(),
              transactionDate: new Date().toISOString(),
              isMultipleProducts: false,
            };
          }

          const response = await fetch(`${config.apiUrl}/api/generate-receipt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(receiptData),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Receipt generated and uploaded:', data);

            // Prepare state data for the Thank You page
            let thankYouState;

            if (cartItems && cartItems.length > 0) {
              // For multiple products
              thankYouState = {
                cartItems,
                totalPrice: cartItems.reduce(
                  (total, item) => total + (item.product.price * item.quantity),
                  0
                ),
                receiptUrl: data.fileUrl,
                paymentMethod,
                user: {
                  firstname: user.firstname,
                  lastname: user.lastname,
                },
                isMultipleProducts: true
              };
            } else {
              // For a single product
              thankYouState = {
                product,
                quantity,
                totalPrice: product.price * quantity,
                receiptUrl: data.fileUrl,
                paymentMethod,
                user: {
                  firstname: user.firstname,
                  lastname: user.lastname,
                },
                isMultipleProducts: false
              };
            }

            // Redirect to Thank You page with transaction details
            navigate('/thank-you', { state: thankYouState });
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
    background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
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
              {product ? (
                // Single product display
                <>
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={product.image || ''}
                      alt={product?.name || 'Product Image'}
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
                </>
              ) : cartItems && cartItems.length > 0 ? (
                // Cart items display
                <>
                  <div style={{
                    background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)',
                    padding: '16px',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <ShoppingCartOutlined style={{ color: 'white', fontSize: '24px' }} />
                    <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
                      Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </Typography.Title>
                  </div>

                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '16px',
                    background: '#f9f9f9'
                  }}>
                    {cartItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: '12px',
                          background: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          border: '1px solid #eee',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px'
                        }}>
                          <div style={{
                            width: '70px',
                            height: '70px',
                            marginRight: '16px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                          }}>
                            <Image
                              src={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${baseURL}/${item.product.image?.replace(/\\/g, '/')}`) : ''}
                              alt={item.product.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              preview={false}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Typography.Text style={{
                              fontWeight: 'bold',
                              display: 'block',
                              fontSize: '16px',
                              color: '#1a2a6c'
                            }}>
                              {item.product.name}
                            </Typography.Text>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginTop: '4px'
                            }}>
                              <Typography.Text style={{ fontSize: '14px', color: '#555' }}>
                                {item.quantity} x ₱{item.product.price.toFixed(2)}
                              </Typography.Text>
                              <Typography.Text style={{
                                fontSize: '15px',
                                fontWeight: 'bold',
                                color: '#b21f1f'
                              }}>
                                ₱{(item.product.price * item.quantity).toFixed(2)}
                              </Typography.Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: 'linear-gradient(to right, #f9f9f9, white)',
                    padding: '16px',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <Typography.Text style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#333'
                      }}>
                        Total:
                      </Typography.Text>
                      <Typography.Text style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        ₱{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                      </Typography.Text>
                    </div>
                  </div>
                </>
              ) : (
                // Fallback for no products
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <Typography.Text style={{ fontSize: '16px', color: '#555' }}>
                    No products selected for payment.
                  </Typography.Text>
                </div>
              )}
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
                {product && (
                  <>
                    <Typography.Text>Quantity:</Typography.Text>
                    <InputNumber
                      min={1}
                      max={product?.quantity || 1}
                      value={quantity}
                      onChange={setQuantity}
                      style={{
                        width: '100%',
                        marginBottom: '16px',
                      }}
                    />
                  </>
                )}
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
    background: 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
    border: 'none',
  }}
>
  {cartItems && cartItems.length > 0 ? (
    `Pay ₱${cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}`
  ) : product ? (
    `Pay ₱${product.price * quantity}`
  ) : (
    'Pay'
  )}
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
            background: 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
            border: 'none',
          }}
        >
          Confirm
        </Button>
        ,
        ]}
      >
        {cartItems && cartItems.length > 0 ? (
          <>
            <Typography.Text style={{ display: 'block', marginBottom: '10px' }}>
              You are about to pay for the following items using <strong>{paymentMethod}</strong>:
            </Typography.Text>

            {cartItems.map((item, index) => (
              <div key={index} style={{ marginBottom: '8px', padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                <Typography.Text style={{ display: 'block' }}>
                  {item.product.name} - {item.quantity} x ₱{item.product.price} = <strong>₱{(item.product.price * item.quantity).toFixed(2)}</strong>
                </Typography.Text>
              </div>
            ))}

            <Typography.Text style={{ display: 'block', marginTop: '15px', fontWeight: 'bold' }}>
              Total: ₱{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
            </Typography.Text>

            <Typography.Text style={{ display: 'block', marginTop: '15px' }}>
              Do you want to proceed?
            </Typography.Text>
          </>
        ) : product ? (
          <Typography.Text>
            You are about to pay <strong>₱{product.price * quantity}</strong> for <strong>{product.name}</strong> using{' '}
            <strong>{paymentMethod}</strong>. Do you want to proceed?
          </Typography.Text>
        ) : (
          <Typography.Text>
            No product selected. Please go back and select a product.
          </Typography.Text>
        )}
      </Modal>
    </Layout>
  );
}

export default PaymentPage;
