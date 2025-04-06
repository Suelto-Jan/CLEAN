import Transaction from '../Models/transaction.js';
import User from '../Models/user.js';

import mongoose from 'mongoose';

export const getTotalSalesDetails = async (req, res) => {
  try {
    const { date } = req.query; // Get the date from query params
    let selectedDate = date ? new Date(date) : new Date();

    // Validate the date format
    if (isNaN(selectedDate)) {
      return res.status(400).json({
        message: 'Invalid date format. Please provide a valid date.',
      });
    }

    console.log('Fetching total sales details for:', selectedDate);

    // Ensure dateStart and dateEnd are set correctly, without modifying the original selectedDate object
    const dateStart = new Date(selectedDate);
    dateStart.setHours(0, 0, 0, 0); // Start of the selected day
    const dateEnd = new Date(selectedDate);
    dateEnd.setHours(23, 59, 59, 999); // End of the selected day

    // Aggregate total sales, paid sales, and pay later sales in one pipeline
    const salesData = await Transaction.aggregate([
      {
        $match: {
          transactionDate: {
            $gte: dateStart,
            $lt: dateEnd,
          },
        },
      },
      {
        $facet: {
          totalSales: [
            {
              $project: {
                totalRevenue: { $sum: '$products.totalPrice' }, // Keep the sum of total price for each transaction
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$totalRevenue' },
              },
            },
          ],
          paidSales: [
            { $unwind: '$products' },
            { $match: { 'products.paymentStatus': 'Paid' } },
            { $group: { _id: null, total: { $sum: '$products.totalPrice' } } },
          ],
          payLaterSales: [
            { $unwind: '$products' },
            { $match: { 'products.paymentStatus': 'Pay Later' } },
            { $group: { _id: null, total: { $sum: '$products.totalPrice' } } },
          ],
          salesDetails: [
            { $unwind: '$products' },
            {
              $group: {
                _id: '$products.name',
                productId: { $first: '$products.productId' },
                quantitySold: { $sum: '$products.quantity' },
                priceSold: { $first: '$products.price' }, // Assuming each product has a price field
                totalRevenue: { $sum: '$products.totalPrice' },
                buyerIds: { $addToSet: '$userId' },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: { userIds: '$buyerIds' },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', { $map: { input: '$$userIds', as: 'id', in: { $toObjectId: '$$id' } } }] } } },
                  { $project: { firstname: 1, _id: 0 } },
                ],
                as: 'buyerDetails',
              },
            },
            {
              $project: {
                productName: '$_id',
                quantitySold: '$quantitySold',
                priceSold: '$priceSold', // Use individual product price
                totalRevenue: '$totalRevenue',
                buyers: {
                  $map: {
                    input: '$buyerDetails',
                    as: 'buyer',
                    in: '$$buyer.firstname',
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    console.log('Sales Data:', salesData); // Log the result

    // Extracting results from aggregation
    const totalSales = salesData[0]?.totalSales[0]?.total || 0;
    const paidSales = salesData[0]?.paidSales[0]?.total || 0;
    const payLaterSales = salesData[0]?.payLaterSales[0]?.total || 0;
    const combinedDetails = salesData[0]?.salesDetails || [];

    res.json({
      totalSales,
      paidSales,
      payLaterSales,
      salesDetails: combinedDetails,
    });
  } catch (error) {
    console.error('Error fetching sales details:', error);
    res.status(500).json({
      message: 'Failed to fetch sales details',
      error: error.message,
    });
  }
};




export const createOrUpdateSales = async (req, res) => {
  try {
    const { date, totalSales, paidSales, payLaterSales, salesDetails } = req.body;

    const salesDate = new Date(date); // Ensure date format
    const dateStart = new Date(salesDate.setHours(0, 0, 0, 0)); // Start of the day
    const dateEnd = new Date(salesDate.setHours(23, 59, 59, 999)); // End of the day

    // Try to find an existing sales record for the given date
    let salesData = await Sales.findOne({ date: { $gte: dateStart, $lt: dateEnd } });

    if (salesData) {
      // Update the existing record
      salesData.totalSales = totalSales;
      salesData.paidSales = paidSales;
      salesData.payLaterSales = payLaterSales;
      salesData.salesDetails = salesDetails;
      await salesData.save();
    } else {
      // Create a new record for the day
      salesData = new Sales({
        date: salesDate,
        totalSales,
        paidSales,
        payLaterSales,
        salesDetails,
      });
      await salesData.save();
    }

    res.status(200).json({ message: 'Sales data successfully created/updated.' });
  } catch (error) {
    console.error('Error saving sales data:', error);
    res.status(500).json({ message: 'Failed to save sales data', error: error.message });
  }
};

