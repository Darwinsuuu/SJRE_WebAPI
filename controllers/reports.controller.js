const ExcelJS = require('exceljs');
const models = require('../models');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path')
const { Sequelize, QueryTypes, QueryError } = require('sequelize');

async function downloadReports(req, res) {
  try {
    // Fetch data from Table1
    const table1Data = await models.onlineTransaction.findAll();

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


async function downloadPDFReport(req, res) {
  try {

    let DATE = "some value";
    let Numberorders = "some value";
    let percentage = "some value";


    let cashierResult = await models.sequelize.query("SELECT c.id AS id, c.firstname, c.lastname, c.username, SUM(sales.totalPrice) AS sales, c.status FROM cashiers c LEFT JOIN sales ON c.id = sales.cashierId GROUP BY c.id, c.username, c.firstname, c.lastname, c.status ORDER BY c.status DESC", { type: QueryTypes.SELECT });

    let cashierTable = "";

    cashierResult.forEach(element => {
      cashierTable += `<tr>
                        <td style="border: 1px solid black; padding: 5px;">${element.firstname.replace(/\b\w/g, (match) => match.toUpperCase())} ${element.lastname.replace(/\b\w/g, (match) => match.toUpperCase())}</td>
                        <td style="border: 1px solid black; padding: 5px;">₱ ${element.sales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                       </tr>`
    });



    let inventoryResult = await models.sequelize.query(`SELECT * FROM products`);
    let inventoryTable = "";

    inventoryResult[0].forEach(element => {
      inventoryTable += `<tr>
                            <td style="border: 1px solid black; padding: 5px;">${element.product}</td>
                            <td style="border: 1px solid black; padding: 5px;">₱ ${element.price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                            <td style="border: 1px solid black; padding: 5px;">${element.sale}%</td>
                            <td style="border: 1px solid black; padding: 5px;">₱ ${element.computedPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                            <td style="border: 1px solid black; padding: 5px;">${element.quantity}</td>
                         </tr>`
    });



    let htmlContent = `<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    
    <body>
    
        <div
            style="display: block; width: 100%; max-width: 700px; margin: auto; padding: -100px 10px 10px 10px; background: #fff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #1b1b1b !important; text-align: justify;">
    
            <div style="text-align: center;">
                <img src="data:image/jpeg;base64,${
                  fs.readFileSync(process.cwd() + "\\uploads\\images\\SJ_logo.png").toString('base64')
                }" alt="alt text" width="120" />
                <h2 style="margin: -20px 0 0">SJ RENEWABLE ENERGY</h2>
                <p style="margin: 0; font-weight: 700;">OVERALL SUMMARY REPORT</p>
            </div>
    
            <br>

            <p style="font-weight: 800;">ONLINE TRANSACTION REPORT</p>
            <p style="text-indent: 45px;">The Online Transaction Report provides a comprehensive overview of online
                transactions from <b>${DATE}</b> to <b>${DATE}</b>. It encompasses transactions that fall into three
                categories: completed, declined, and pending, all of which occurred during the specified date range.</p>
            <p style="text-indent: 45px;">The Online Store has a total of <b>${Numberorders}</b> between <b>${DATE}</b> and
    <b>${DATE}</b>.Among these requests, <b>${percentage}%</b> have been successfully completed,
      <b>${percentage}%</b> were declined, and the remaining <b> ${percentage}%</b> are currently pending.</p>

        <br>

          <p style="font-weight: 800;">PHYSICAL AND ONLINE STORE SALES REPORT</p>
          <p style="text-indent: 45px;">The table below shows the sales for both physical and online store. Based on the
            data shown, physical store have <b>${percentage}%</b> while online store have <b>${percentage}%</b> out of
            overall sales pesos overall sales.</p>

          <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px !important;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 5px;">Product</th>
                <th style="border: 1px solid black; padding: 5px;">Price</th>
                <th style="border: 1px solid black; padding: 5px;">Quantity</th>
                <th style="border: 1px solid black; padding: 5px;">Physical Store Sales</th>
                <th style="border: 1px solid black; padding: 5px;">Online Store Sales</th>
                <th style="border: 1px solid black; padding: 5px;">Overall Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 5px;">Sample Product Name</td>
                <td style="border: 1px solid black; padding: 5px;">25000</td>
                <td style="border: 1px solid black; padding: 5px;">5</td>
                <td style="border: 1px solid black; padding: 5px;">10,000</td>
                <td style="border: 1px solid black; padding: 5px;">15,000</td>
                <td style="border: 1px solid black; padding: 5px;">25,000</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="border: 1px solid black; padding: 5px;">
                  <b>Grand Total Sales</b>
                </td>
                <td style="border: 1px solid black; padding: 5px;">10,000</td>
                <td style="border: 1px solid black; padding: 5px;">15,000</td>
                <td style="border: 1px solid black; padding: 5px;">25,000</td>
              </tr>
            </tfoot>
          </table>

          <br>

            <p style="font-weight: 800;">CASHIER REPORT</p>
            <p style="text-indent: 45px;">This table represents the overall sales made by the cashier/s in the physical store from <b>${DATE}</b> to <b>${DATE}</b>.</p>

            <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px !important;">
              <thead>
                <tr>
                  <th style="border: 1px solid black; padding: 5px;">Full Name</th>
                  <th style="border: 1px solid black; padding: 5px;">Overall Sales</th>
                </tr>
              </thead>
              <tbody>
                ${cashierTable}
              </tbody>
            </table>

            <br>

              <p style="font-weight: 800;">INVENTORY REPORT</p>
              <p style="text-indent: 45px;">This table shows the list of the products, and their corresponding current price, sale in percentage, computed price after the discount, and remaining stocks as of <b>${DATE}</b>.</p>

              <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px !important;">
                <thead>
                  <tr>
                    <th style="border: 1px solid black; padding: 5px;">Product</th>
                    <th style="border: 1px solid black; padding: 5px;">Current Price</th>
                    <th style="border: 1px solid black; padding: 5px;">Sale(%)</th>
                    <th style="border: 1px solid black; padding: 5px;">Computed Price</th>
                    <th style="border: 1px solid black; padding: 5px;">Remaining Stocks</th>
                  </tr>
                </thead>
                <tbody>
                  ${inventoryTable}
                </tbody>
              </table>

            </div>

          </body>

        </html>`;



    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        bottom: '45px'
      }
    });

    await browser.close();
    // Set response headers for downloading
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.log(error)

    res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message
    });
  }


}

module.exports = {
  downloadReports: downloadReports,
  downloadPDFReport: downloadPDFReport
};
