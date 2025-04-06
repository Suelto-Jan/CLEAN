import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Snackbar,
  CircularProgress,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  MonetizationOn as MonetizationOnIcon,
  Payment as PaymentIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import bsuLogo from '../images/BSU LOGO.png';
import cotLogo from '../images/COT.png';

// ✅ New imports
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


function TotalSales() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState({
    totalSales: 0,
    paidSales: 0,
    payLaterSales: 0,
    salesDetails: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }
    setAvailableDates(dates);

    const fetchSalesData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/total-sales-details?date=${selectedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }

        const result = await response.json();
        setData({
          totalSales: result.totalSales || 0,
          paidSales: result.paidSales || 0,
          payLaterSales: result.payLaterSales || 0,
          salesDetails: result.salesDetails || [],
        });
      } catch (error) {
        setError('Error fetching total sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const formatDate = (date) => {
    return dayjs(date).format('MMM D');
  };

  const handleExportToExcel = () => {
  const wb = XLSX.utils.book_new();

  const salesSummary = [
    ['Report Date', dayjs().format('MMMM D, YYYY')],
    ['Total Sales', `₱${data.totalSales.toLocaleString()}`],
    ['Paid Sales', `₱${data.paidSales.toLocaleString()}`],
    ['Pay Later Sales', `₱${data.payLaterSales.toLocaleString()}`],
  ];

  const salesDetailsHeader = [
    'Name',
    'No.',
    'Product Quantity',
    'Price Sold',
    'Total Sale',
    'Transaction Time'
  ];

  const salesDetailsRows = data.salesDetails.map(item => {
    // Extract timestamp from MongoDB ObjectId
    const timestamp = item._id
      ? dayjs(new Date(parseInt(item._id.substring(0, 8), 16) * 1000)).format('YYYY-MM-DD HH:mm:ss')
      : 'N/A';

    return [
      item.productName || 'Unnamed Product',
      item.productId || 'N/A',
      `${item.quantitySold || 0}`,
      `₱${(item.priceSold || 0).toLocaleString()}`,
      `₱${(item.totalRevenue || 0).toLocaleString()}`,
      timestamp,
    ];
  });

  const salesDetailsData = [salesDetailsHeader, ...salesDetailsRows];

  const ws1 = XLSX.utils.aoa_to_sheet(salesSummary);
  const ws2 = XLSX.utils.aoa_to_sheet(salesDetailsData);

  XLSX.utils.book_append_sheet(wb, ws1, 'Sales Summary');
  XLSX.utils.book_append_sheet(wb, ws2, 'Products Sold');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'sales_report.xlsx');

  setSnackbarOpen(true);
};


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <motion.img
            src={bsuLogo}
            alt="BSU Logo"
            style={{ height: "80px", marginRight: "20px" }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src={cotLogo}
            alt="COT Logo"
            style={{ height: "80px" }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: '700',
            background: "white",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Sales Dashboard
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker
    label="Select Date"
    value={dayjs(selectedDate)}
    onChange={(newValue) => {
      setSelectedDate(newValue.format('YYYY-MM-DD'));
    }}
    format="MMMM D, YYYY"
    sx={{
      marginBottom: '30px',
      maxWidth: 300,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '12px',
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
      },
    }}
    disableFuture
  />
</LocalizationProvider>


        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                <CircularProgress
                  size={60}
                  sx={{
                    color: "white",
                  }}
                />
                <Typography variant="h6" sx={{ marginTop: '20px', color: 'white' }}>
                  Loading data, please wait...
                </Typography>
              </Box>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                <ErrorIcon sx={{ fontSize: '50px', color: 'white' }} />
                <Typography variant="h6" sx={{ color: 'wite', marginTop: '10px' }}>
                  {error}
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Grid container spacing={3} sx={{ marginBottom: '30px' }}>
                <Grid item xs={12} sm={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: '16px',
                        background: 'white',
                        color: 'black',
                        padding: '20px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                          <MonetizationOnIcon sx={{ marginRight: '10px' }} />
                          Total Sales
                        </Typography>
                        <Typography variant="h4" sx={{ marginTop: '10px', fontWeight: '600' }}>
                          ₱{data.totalSales.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: '16px',
                        background: 'white',
                        color: 'black',
                        padding: '20px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                          <PaymentIcon sx={{ marginRight: '10px' }} />
                          Paid Sales
                        </Typography>
                        <Typography variant="h4" sx={{ marginTop: '10px', fontWeight: '600' }}>
                          ₱{data.paidSales.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: '16px',
                        background: 'white',
                        color: 'black',
                        padding: '20px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                          <HourglassEmptyIcon sx={{ marginRight: '10px' }} />
                          Pay Later Sales
                        </Typography>
                        <Typography variant="h4" sx={{ marginTop: '10px', fontWeight: '600' }}>
                          ₱{data.payLaterSales.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>

              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                  marginTop: '40px',
                  overflowX: 'auto',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No.</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity Sold</TableCell>
                      <TableCell>Price Sold</TableCell>
                      <TableCell>Total Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.salesDetails.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.productName || 'Unnamed Product'}</TableCell>
                        <TableCell>{item.quantitySold}</TableCell>
                        <TableCell>₱{(item.priceSold || 0).toLocaleString()}</TableCell>
                        <TableCell>₱{(item.totalRevenue || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportToExcel}
                    sx={{
                      background: 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #b21f1f, #1a2a6c)',
                      },
                      borderRadius: '12px',
                      padding: '12px 24px',
                      textTransform: 'none',
                      fontWeight: '600',
                    }}
                    disabled={data.totalSales === 0 && data.paidSales === 0 && data.payLaterSales === 0}
                  >
                    Generate Report
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          Report generated successfully
        </Alert>
      </Snackbar>
    </motion.div>
  );
}

export default TotalSales;
