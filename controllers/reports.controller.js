const ExcelJS = require('exceljs');
const models = require('../models');

async function downloadReports(req, res) {
  try {
    // Fetch data from Table1
    const table1Data = await models.onlinetransaction.findAll();

    // Fetch data from Table2
    const table2Data = await models.onlineSales.findAll();
    const table3Data = await models.sale.findAll();
    const table4Data = await models.sequelize.query(`SELECT C.id, C.firstname, C.middlename, C.lastname, C.gender, C.mobileNo, CA.email, R.regDesc, P.provDesc, CM.citymunDesc, B.brgyDesc, C.subdivision, C.street, C.houseNo, C.zipCode, C.fullAddress, C.createdAt FROM customers C INNER JOIN cust_accounts CA ON C.id = CA.custId INNER JOIN refregion R ON C.region = R.regCode INNER JOIN refprovince P ON C.province = P.provCode INNER JOIN refcitymun CM ON C.city = CM.citymunCode INNER JOIN refbrgy B ON C.barangay = B.brgyCode`);
    const table5Data = await models.cashier.findAll();
    const table6Data = await models.product.findAll();
    const table7Data = await models.categories.findAll();

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();

    // Create worksheets and add data
    const worksheet1 = workbook.addWorksheet('Online Transaction');
    const worksheet2 = workbook.addWorksheet('Online Sales');
    const worksheet3 = workbook.addWorksheet('Store Sales');
    const worksheet6 = workbook.addWorksheet('Inventory');
    const worksheet7 = workbook.addWorksheet('Categories');
    const worksheet5 = workbook.addWorksheet('Cashiers');
    const worksheet4 = workbook.addWorksheet('Customers');

    // Online Transaction Sheets
    worksheet1.columns = [
      { header: 'Transaction ID', key: 'id', width: 10 },
      { header: 'Customer ID', key: 'custId', width: 10 },
      { header: 'Location', key: 'location', width: 10 },
      { header: 'Remarks', key: 'remarks', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 },
      { header: 'Updated At', key: 'updatedAt', width: 10 },
    ];
    table1Data.forEach((row) => {
      worksheet1.addRow(row.toJSON());
    });


    // Online Sales Sheet
    worksheet2.columns = [
      { header: 'Sales ID', key: 'id', width: 10 },
      { header: 'Transaction ID', key: 'OLTransID', width: 10 },
      { header: 'Product ID', key: 'prodId', width: 10 },
      { header: 'Price(PHP Peso)', key: 'currentPrice', width: 10 },
      { header: 'Sale (%)', key: 'currentSale', width: 10 },
      { header: 'Computed Price', key: 'currentComputedPrice', width: 10 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Total Price', key: 'totalPrice', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 },
      { header: 'Updated At', key: 'updatedAt', width: 10 },
    ];
    table2Data.forEach((row) => {
      worksheet2.addRow(row.toJSON());
    });


    // Store Sales Sheet
    worksheet3.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Transaction ID', key: 'transactionId', width: 10 },
      { header: 'Product ID', key: 'prodId', width: 10 },
      { header: 'Cashier ID', key: 'cashierId', width: 10 },
      { header: 'Price (PHP Peso)', key: 'currentPrice', width: 10 },
      { header: 'Sale (%)', key: 'currentSale', width: 10 },
      { header: 'Computed Price', key: 'currentComputedPrice', width: 10 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Total Price', key: 'totalPrice', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 },
      { header: 'Updated At', key: 'updatedAt', width: 10 },
    ];
    table3Data.forEach((row) => {
      worksheet3.addRow(row.toJSON());
    });


    // Customers Sheet
    worksheet4.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'First Name', key: 'firstname', width: 10 },
      { header: 'Middle Name', key: 'middlename', width: 10 },
      { header: 'Last Name', key: 'lastname', width: 10 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Mobile No.', key: 'mobileNo', width: 10 },
      { header: 'Email Address', key: 'email', width: 10 },
      { header: 'Region', key: 'regDesc', width: 10 },
      { header: 'Province', key: 'provDesc', width: 10 },
      { header: 'City/ Municipality', key: 'citymunDesc', width: 10 },
      { header: 'Subdivision', key: 'subdivision', width: 10 },
      { header: 'Street', key: 'street', width: 10 },
      { header: 'House No.', key: 'houseNo', width: 10 },
      { header: 'Zip Code', key: 'zipCode', width: 10 },
      { header: 'Full Address', key: 'fullAddress', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 },
    ];
    table4Data[0].forEach((row) => {
      worksheet4.addRow(JSON.parse(JSON.stringify(row)));
    });


    // Cashier Sheet
    worksheet5.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Username', key: 'username', width: 10 },
      { header: 'Firstname', key: 'firstname', width: 10 },
      { header: 'Lastname', key: 'lastname', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 },
      { header: 'Updated At', key: 'updatedAt', width: 10 },
    ];
    table5Data.forEach((row) => {
      worksheet5.addRow(row.toJSON());
    });

    // Invetory Sheet
    worksheet6.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Product Name', key: 'product', width: 10 },
      { header: 'Category ID', key: 'categoryId', width: 10 },
      { header: 'Barcode', key: 'barcode', width: 10 },
      { header: 'Product Description', key: 'productDesc', width: 10 },
      { header: 'Price (PHP Peso)', key: 'price', width: 10 },
      { header: 'Sale (%)', key: 'sale', width: 10 },
      { header: 'Computed Price', key: 'computedPrice', width: 10 },
      { header: 'Stocks', key: 'quantity', width: 10 },
      { header: 'Stock Reminder', key: 'stockReminder', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 },
      { header: 'Updated At', key: 'updatedAt', width: 10 },
    ];
    table6Data.forEach((row) => {
      worksheet6.addRow(row.toJSON());
    });


    // Category Sheet
    worksheet7.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Category Name', key: 'category', width: 10 },
      { header: 'Category Description', key: 'categoryDesc', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 10 },
      { header: 'Updated At', key: 'updatedAt', width: 10 },
    ];
    table7Data.forEach((row) => {
      worksheet7.addRow(row.toJSON());
    });

    // Set up response headers for download
    const date = new Date();
    const formattedDate = date.toISOString().replace(/:/g, '-').replace(/\.\d+/, ''); // Format the date as YYYY-MM-DDTHHmmss

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reports-${formattedDate}.xlsx`);

    // Send the Excel file as a response
    await workbook.xlsx.write(res);

  } catch (error) {
    console.error('Error exporting data:', error);

    res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message
    });
  }
}

module.exports = {
  downloadReports: downloadReports
};
