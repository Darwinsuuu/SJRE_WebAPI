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
    const table4Data = await models.sequelize.query(`SELECT C.id, C.firstname, C.middlename, C.lastname, C.gender, C.mobileNo, CA.email, R.regDesc, P.provDesc, CM.citymunDesc, B.brgyDesc, C.subdivision, C.street, C.houseNo, C.zipCode, C.createdAt FROM customers C INNER JOIN cust_accounts CA ON C.id = CA.custId INNER JOIN refregion R ON C.region = R.regCode INNER JOIN refprovince P ON C.province = P.provCode INNER JOIN refcitymun CM ON C.city = CM.citymunCode INNER JOIN refbrgy B ON C.barangay = B.brgyCode`);
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

// async function downloadPDFReportCashier(req, res) {
//   let browser;
//   try {
//     // Launch browser
//     browser = await puppeteer.launch({ headless: true });

//     // Create a new page
//     const page = await browser.newPage();

//     // Set content and generate PDF
//     await page.setContent('<h1>Hello, this is a sample PDF</h1>');
//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//     });

//     // Set response headers for downloading
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('Error in downloadPDFReport:', error);
//     res.status(500).json({
//       status: false,
//       message: 'Something went wrong!',
//       error: error.message,
//     });
//   } finally {
//     // Close the browser in all cases
//     if (browser) {
//       await browser.close();
//     }
//   }
// }




async function downloadPDFReport(req, res) {
  let browser;
  try {

    // res.status(200).json({
    //   status: true,
    //   message: 'Hello',
    //   result: req.body
    // });

    console.log("============================")
    console.log(req.body.end)
    console.log("============================")

    let dateStart = req.body.start;
    const date1 = new Date(dateStart);
    const options1 = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate1 = date1.toLocaleDateString('en-US', options1);

    let dateEnd = req.body.end;
    const date2 = new Date(dateEnd);
    const options2 = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate2 = date2.toLocaleDateString('en-US', options2);

    const currentDate = new Date();

    const options3 = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormat = new Intl.DateTimeFormat('en-US', options3);

    const formattedDate = dateFormat.format(currentDate);

    let query1 = await models.sequelize.query(`SELECT
                                                  SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS totalPending,
                                                  SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS totalCompleted,
                                                  SUM(CASE WHEN status = 'Declined' THEN 1 ELSE 0 END) AS totalDeclined,
                                                  COUNT(*) as totalTransactions
                                              FROM 
                                                onlineTransactions
                                              WHERE 
                                                createdAt BETWEEN '${dateStart}' AND '${dateEnd}'`)

    let query2 = await models.sequelize.query(`SELECT c.id AS id, c.firstname, c.lastname, c.username, SUM(sales.totalPrice) AS sales, c.status FROM cashiers c LEFT JOIN sales ON c.id = sales.cashierId WHERE sales.createdAt BETWEEN '${dateStart}' AND '${dateEnd}' GROUP BY c.id, c.username, c.firstname, c.lastname, c.status ORDER BY c.status DESC`, { type: QueryTypes.SELECT });

    let query3 = await models.sequelize.query(`SELECT * FROM products`);

    let query4 = await models.sequelize.query(`SELECT
                                                  product,
                                                  productDesc,
                                                  COALESCE(SUM(quantity), 0) AS totalQuantity,
                                                  COALESCE(SUM(CASE WHEN source = 'sales' THEN totalPrice ELSE 0 END), 0) AS physicalStoreSales,
                                                  COALESCE(SUM(CASE WHEN source = 'onlineSales' THEN totalPrice ELSE 0 END), 0) AS onlineStoreSales,
                                                  COALESCE(SUM(totalPrice), 0) AS overallSales,
                                                  MAX(createdAt) AS maxCreatedAt
                                              FROM (
                                                  SELECT
                                                      P.product,
                                                      P.productDesc,
                                                      COALESCE(OS.quantity, 0) AS quantity,
                                                      COALESCE(OS.totalPrice, 0) AS totalPrice,
                                                      P.imgFilename,
                                                      P.createdAt,
                                                      'onlineSales' AS source
                                                  FROM products P
                                                  LEFT JOIN onlineSales OS ON OS.prodId = P.id
                                                  LEFT JOIN onlineTransactions OT ON OS.OLTransID = OT.id
                                                  WHERE P.status = 1 AND (OS.createdAt BETWEEN '${dateStart}' AND '${dateEnd}' OR OS.createdAt IS NULL)
                                                  UNION ALL
                                                  SELECT
                                                      P.product,
                                                      P.productDesc,
                                                      COALESCE(S.quantity, 0) AS quantity,
                                                      COALESCE(S.totalPrice, 0) AS totalPrice,
                                                      P.imgFilename,
                                                      P.createdAt,
                                                      'sales' AS source
                                                  FROM products P
                                                  LEFT JOIN sales S ON S.prodId = P.id
                                                  WHERE P.status = 1 AND (S.createdAt BETWEEN '${dateStart}' AND '${dateEnd}' OR S.createdAt IS NULL)
                                              ) AS combined_data
                                              GROUP BY
                                                  product,
                                                  productDesc,
                                                  imgFilename
                                              ORDER BY
                                                  totalQuantity DESC,
                                                  maxCreatedAt ASC`);


    const [onlineTransactionStatus, cashierResult, inventoryResult, physicalOnlineSalesResult] = await Promise.all([query1, query2, query3, query4]);

    let cashierTable = "";

    cashierResult.forEach(element => {
      cashierTable += `<tr>
                        <td style="border: 1px solid black; padding: 5px;">${element.firstname.replace(/\b\w/g, (match) => match.toUpperCase())} ${element.lastname.replace(/\b\w/g, (match) => match.toUpperCase())}</td>
                        <td style="border: 1px solid black; padding: 5px;">₱ ${element.sales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                       </tr>`
    });



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





    let physicalOnlineSalesTable = "";
    let totalPhysicalStoreSales = 0;
    let totalOnlineStoreSales = 0;

    physicalOnlineSalesResult[0].forEach(element => {
      physicalOnlineSalesTable += `<tr>
                                    <td style="border: 1px solid black; padding: 5px;">${element.product}</td>
                                    <td style="border: 1px solid black; padding: 5px;">${element.totalQuantity}</td>
                                    <td style="border: 1px solid black; padding: 5px;">₱ ${element.physicalStoreSales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                                    <td style="border: 1px solid black; padding: 5px;">₱ ${element.onlineStoreSales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                                    <td style="border: 1px solid black; padding: 5px;">₱ ${element.overallSales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                                  </tr>`
      totalPhysicalStoreSales += element.physicalStoreSales;
      totalOnlineStoreSales += element.onlineStoreSales;
    });

    physicalOnlineSalesTable += `<tr>
                                    <td colspan="2" style="border: 1px solid black; padding: 5px;">
                                        <b>Grand Total Sales</b>
                                    </td>
                                    <td style="border: 1px solid black; padding: 5px;">₱ ${totalPhysicalStoreSales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                                    <td style="border: 1px solid black; padding: 5px;">₱ ${totalOnlineStoreSales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                                    <td style="border: 1px solid black; padding: 5px;">₱ ${(totalPhysicalStoreSales + totalOnlineStoreSales).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                                </tr>`



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
                <img src="data:image/jpeg;base64,${fs.readFileSync('/var/www/vhosts/sjreapi.online/httpdocs/uploads/images/SJ_logo.png').toString('base64')}" alt="alt text" width="120" />

                <h2 style="margin: -20px 0 0">SJ RENEWABLE ENERGY</h2>
                <p style="margin: 0; font-weight: 700;">OVERALL SUMMARY REPORT</p>
            </div>

            <br>

            <p style="font-weight: 800;">ONLINE TRANSACTION REPORT</p>
            <p style="text-indent: 45px;">The Online Transaction Report provides a comprehensive overview of online
                transactions from <b>${formattedDate1}</b> to <b>${formattedDate2}</b>. It encompasses transactions that fall into three
                categories: completed, declined, and pending, all of which occurred during the specified date range.</p>
            <p style="text-indent: 45px;">The Online Store has a total of <b>${onlineTransactionStatus[0][0].totalTransactions}</b> between <b>${formattedDate1}</b> and
    <b>${formattedDate2}</b>.Among these requests, <b>${((onlineTransactionStatus[0][0].totalCompleted / onlineTransactionStatus[0][0].totalTransactions) * 100).toFixed(2) !== 'NaN' ? ((onlineTransactionStatus[0][0].totalCompleted / onlineTransactionStatus[0][0].totalTransactions) * 100).toFixed(2) : 0}%</b> have been successfully completed,
      <b>${((onlineTransactionStatus[0][0].totalDeclined / onlineTransactionStatus[0][0].totalTransactions) * 100).toFixed(2) !== 'NaN' ? ((onlineTransactionStatus[0][0].totalDeclined / onlineTransactionStatus[0][0].totalTransactions) * 100).toFixed(2) : 0}%</b> were declined, and the remaining <b>${((onlineTransactionStatus[0][0].totalPending / onlineTransactionStatus[0][0].totalTransactions) * 100).toFixed(2) !== 'NaN' ? ((onlineTransactionStatus[0][0].totalPending / onlineTransactionStatus[0][0].totalTransactions) * 100).toFixed(2) : 0}%</b> are currently pending.</p>

        <br>

          <p style="font-weight: 800;">PHYSICAL AND ONLINE STORE SALES REPORT</p>
          <p style="text-indent: 45px;">The table below shows the sales for both physical and online store. Based on the
            data shown, physical store have <b>${!isNaN((totalPhysicalStoreSales / (totalPhysicalStoreSales + totalOnlineStoreSales)) * 100) ? ((totalPhysicalStoreSales / (totalPhysicalStoreSales + totalOnlineStoreSales)) * 100).toFixed(2) : 0}%</b> while online store have <b>${!isNaN((totalOnlineStoreSales / (totalPhysicalStoreSales + totalOnlineStoreSales)) * 100) ? ((totalOnlineStoreSales / (totalPhysicalStoreSales + totalOnlineStoreSales)) * 100).toFixed(2) : 0}%</b> out of
            <b>${(totalPhysicalStoreSales + totalOnlineStoreSales).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</b> pesos overall sales.</p>

          <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px !important;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 5px;">Product</th>
                <th style="border: 1px solid black; padding: 5px;">Quantity</th>
                <th style="border: 1px solid black; padding: 5px;">Physical Store Sales</th>
                <th style="border: 1px solid black; padding: 5px;">Online Store Sales</th>
                <th style="border: 1px solid black; padding: 5px;">Overall Sales</th>
              </tr>
            </thead>
            <tbody>
              ${physicalOnlineSalesTable}
            </tbody>
          </table>

          <br>

            <p style="font-weight: 800;">CASHIER REPORT</p>
            <p style="text-indent: 45px;">This table represents the overall sales made by the cashier/s in the physical store from <b>${formattedDate1}</b> to <b>${formattedDate2}</b>.</p>

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
              <p style="text-indent: 45px;">This table shows the list of the products, and their corresponding current price, sale in percentage, computed price after the discount, and remaining stocks as of <b>${formattedDate}</b>.</p>

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


    // Launch browser
    browser = await puppeteer.launch({ headless: true });

    // Create a new page
    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        bottom: '45px'
      }
    });

    // Set response headers for downloading
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer);


    // browser = await puppeteer.launch({ headless: true });
    // const page = await browser.newPage();
    // await page.setContent(htmlContent);

    // // // Generate PDF
    // const pdfBuffer = await page.pdf({
    //   format: 'A4',
    //   printBackground: true,
    //   margin: {
    //     top: '15px',
    //     bottom: '45px'
    //   }
    // });

    // await browser.close();
    // // Set response headers for downloading
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    // res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in downloadPDFReport:', error);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!',
      error: error.message,
    });
  } finally {
    // Close the browser in all cases
    if (browser) {
      await browser.close();
    }
  }


}




async function downloadPDFReportCashier(req, res) {
  
  let browser;
  try {

    console.log(req.body)

    let dateStart = req.body.start;
    const date1 = new Date(dateStart);
    const options1 = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate1 = date1.toLocaleDateString('en-US', options1);

    let dateEnd = req.body.end;
    const date2 = new Date(dateEnd);
    const options2 = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate2 = date2.toLocaleDateString('en-US', options2);

    const currentDate = new Date();

    const options3 = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormat = new Intl.DateTimeFormat('en-US', options3);

    const formattedDate = dateFormat.format(currentDate);



    // let query2 = await models.sequelize.query(`SELECT c.id AS id, c.firstname, c.lastname, c.username, SUM(sales.totalPrice) AS sales, c.status FROM cashiers c LEFT JOIN sales ON c.id = sales.cashierId WHERE sales.createdAt BETWEEN '${dateStart}' AND '${dateEnd}' AND c.id = '${req.body.data.id}' GROUP BY c.id, c.username, c.firstname, c.lastname, c.status ORDER BY c.status DESC`, { type: QueryTypes.SELECT });

    // let query1 = await models.cashier.findOne({where: {id: req.body.id}});
    let query1 = await models.sequelize.query(`SELECT concat(firstname, ' ', lastname) as name FROM cashiers WHERE id = ${req.body.id}`);

    let query2 = await models.sequelize.query(`SELECT concat(C.firstname, ' ', C.lastname) as name, P.product, S.currentComputedPrice, S.quantity, S.totalPrice FROM sales S INNER JOIN products P ON S.prodId = P.id INNER JOIN cashiers C ON S.cashierId = C.id WHERE S.createdAt BETWEEN '${dateStart}' AND '${dateEnd}' AND C.id = ${req.body.id}`);

    const [cashierInfo, cashierResult] = await Promise.all([query1, query2]);

    // res.status(200).json({
    //   status: true,
    //   cashierResult: cashierResult[0],
    //   cashierName: cashierInfo[0][0].name
    // })

    let cashierTable = "";



    console.log(cashierResult)
    let name = cashierInfo[0][0].name;

    cashierResult[0].forEach(element => {
      cashierTable += `<tr>
                            <td style="border: 1px solid black; padding: 5px;">${element.product}</td>
                            <td style="border: 1px solid black; padding: 5px;">${element.currentComputedPrice}</td>
                            <td style="border: 1px solid black; padding: 5px;">${element.quantity}</td>
                            <td style="border: 1px solid black; padding: 5px;">${element.totalPrice}</td>
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
                                      <img src="data:image/jpeg;base64,${fs.readFileSync('/var/www/vhosts/sjreapi.online/httpdocs/uploads/images/SJ_logo.png').toString('base64')}" alt="alt text" width="120" />
                                      <h2 style="margin: -20px 0 0">SJ RENEWABLE ENERGY</h2>
                                      <p style="margin: 0; font-weight: 700;">OVERALL SUMMARY REPORT</p>
                                  </div>
                          
                                  <br>

                                  <p style="font-weight: 800;">CASHIER REPORT</p>
                                  <p style="text-indent: 45px;">This table represents the overall sales made by <b>${name.replace(/\b\w/g, (match) => match.toUpperCase())}</b> in the physical store from <b>${formattedDate1}</b> to <b>${formattedDate2}</b>.</p>

                                  <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px !important;">
                                    <thead>
                                      <tr>
                                        <th style="border: 1px solid black; padding: 5px;">Product</th>
                                        <th style="border: 1px solid black; padding: 5px;">Current Price</th>
                                        <th style="border: 1px solid black; padding: 5px;">Quantity</th>
                                        <th style="border: 1px solid black; padding: 5px;">Total Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${cashierTable}
                                    </tbody>
                                  </table>

                                </body>

                              </html>`;



    // // Launch browser
    // browser = await puppeteer.launch({ headless: true });

    // // Create a new page
    // const page = await browser.newPage();

    // // Set content and generate PDF
    // await page.setContent(htmlContent);
    // const pdfBuffer = await page.pdf({
    //   format: 'A4',
    //   printBackground: true,
    //   margin: {
    //     top: '15px',
    //     bottom: '45px'
    //   }
    // });

    // // Set response headers for downloading
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    // res.send(pdfBuffer);

    // Launch browser
    browser = await puppeteer.launch({ headless: true });

    // Create a new page
    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    // Set response headers for downloading
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in downloadPDFReport:', error);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!',
      error: error.message,
    });
  } finally {
    // Close the browser in all cases
    if (browser) {
      await browser.close();
    }
  }


}




module.exports = {
  downloadReports: downloadReports,
  downloadPDFReport: downloadPDFReport,
  downloadPDFReportCashier: downloadPDFReportCashier,
};
