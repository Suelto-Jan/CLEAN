import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Divider, List, ListItem, ListItemText, TextField, MenuItem, Select, InputLabel, FormControl, Snackbar, IconButton, CircularProgress, Button, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import dayjs from 'dayjs';
import ErrorIcon from '@mui/icons-material/Error';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';


function TotalSales() {
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

    // Sales Summary Data
    const salesSummary = [
      ['Report Date', dayjs().format('MMMM D, YYYY')],
      ['Total Sales', `₱${data.totalSales.toLocaleString()}`],
      ['Paid Sales', `₱${data.paidSales.toLocaleString()}`],
      ['Pay Later Sales', `₱${data.payLaterSales.toLocaleString()}`],
    ];

    // Sales Details Data
    const salesDetailsHeader = ['Name', 'No.', 'Product Quantity', 'Price Sold', 'Total Sale'];
    const salesDetailsRows = data.salesDetails.map(item => [
      item.productName || 'Unnamed Product',
      item.productId || 'N/A',
      `${item.quantitySold || 0}`, // Display as fraction
      `₱${(item.priceSold || 0).toLocaleString()}`,
      `₱${(item.totalRevenue || 0).toLocaleString()}`,
    ]);

    const salesDetailsData = [salesDetailsHeader, ...salesDetailsRows];

    const ws1 = XLSX.utils.aoa_to_sheet(salesSummary);
    const ws2 = XLSX.utils.aoa_to_sheet(salesDetailsData);

    XLSX.utils.book_append_sheet(wb, ws1, 'Sales Summary');
    XLSX.utils.book_append_sheet(wb, ws2, 'Products Sold');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'sales_report.xlsx');

    setSnackbarOpen(true); // Show success message
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Chart Data Preparation
  const chartData = [
    { name: 'Total Sales', value: data.totalSales },
    { name: 'Paid Sales', value: data.paidSales },
    { name: 'Pay Later Sales', value: data.payLaterSales },
  ];

  return (
    <Box sx={{ padding: '30px', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
  {/* Snackbar */}
  <Snackbar
    open={snackbarOpen}
    autoHideDuration={3000}
    onClose={handleCloseSnackbar}
    message="Report generated successfully"
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  />

  <Typography
    variant="h4"
    sx={{
      textAlign: 'center',
      marginBottom: '30px',
      fontWeight: '700',
      color: '#2c3e50',
    }}
  >
    Sales Dashboard
  </Typography>

  {/* Date Selector */}
  <FormControl fullWidth sx={{ marginBottom: '30px', maxWidth: 300, marginLeft: 'auto', display: 'block' }}>
    <InputLabel>Select Date</InputLabel>
    <Select value={selectedDate} onChange={handleDateChange} label="Select Date">
      {availableDates.map((date, index) => (
        <MenuItem key={index} value={date}>
          {formatDate(date)}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  {/* Loading State */}
  {loading ? (
    <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
      <CircularProgress color="primary" />
      <Typography variant="h6" sx={{ marginTop: '20px', color: '#2b6cb0' }}>
        Loading data, please wait...
      </Typography>
    </Box>
  ) : error ? (
    <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
      <ErrorIcon sx={{ fontSize: '50px', color: 'red' }} />
      <Typography variant="h6" sx={{ color: 'red', marginTop: '10px' }}>
        {error}
      </Typography>
    </Box>
  ) : (
    <>
      {/* Sales Cards */}
      <Grid container spacing={3} sx={{ marginBottom: '30px' }}>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={4}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#3498db',
              color: '#fff',
              padding: '20px',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
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
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={4}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#27ae60',
              color: '#fff',
              padding: '20px',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
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
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={4}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#f39c12',
              color: '#fff',
              padding: '20px',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
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
        </Grid>
      </Grid>

      {/* Sales Details Table */}
      <Box sx={{ marginTop: '40px' }}>
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
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.productName || 'Unnamed Product'}</TableCell>
                <TableCell>
                  {item.quantitySold}
                </TableCell>
                <TableCell>₱{(item.priceSold || 0).toLocaleString()}</TableCell>
                <TableCell>₱{(item.totalRevenue || 0).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Export Button */}
      <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
  <Button
    variant="contained"
    color="primary"
    onClick={handleExportToExcel}
    sx={{ padding: '10px 30px', fontWeight: '600' }}
    disabled={data.totalSales === 0 && data.paidSales === 0 && data.payLaterSales === 0} // Disable if all sales values are 0
  >
    Generate Report
  </Button>
</Box>

    </>
  )}
</Box>
  );
}

export default TotalSales;
