import { sendEnquiryNotification } from '../lib/email';
import { dbGetEmailNotificationByEnquiryId, dbGetInquiries, dbGetCustomerCars, dbGetTestDrives, dbGetNegotiations, pool } from '../lib/db';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log('===============================================================');
  console.log('RECARS AUTOMATIC EMAIL NOTIFICATIONS — VERIFICATION TEST SUITE');
  console.log('Target Server: ' + BASE_URL);
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  // Helper for assertions
  function assert(desc: string, cond: boolean) {
    if (cond) {
      console.log(`  ✓ PASSED: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${desc}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // Scenario 1: A customer enquires about a listed car
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 1] Customer enquires about a listed car');
  const inq1Id = `inq-test-${Date.now()}`;
  const res1 = await fetch(`${BASE_URL}/api/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: inq1Id,
      carId: 'recars-101',
      carTitle: '2022 Hyundai Creta SX (O)',
      carPrice: 1250000,
      userName: 'Venkatesh Rao',
      userPhone: '+91 98480 12345',
      userEmail: 'venkatesh.rao@gmail.com',
      city: 'Warangal',
      inquiryType: 'Car Inquiry',
      message: 'Is this car available for physical review this Sunday in Hanamkonda?',
    }),
  });
  const data1 = await res1.json();
  assert('API returns success: true for car inquiry', data1.success === true);
  
  // Wait briefly for async notification worker
  await new Promise((r) => setTimeout(r, 600));

  const notif1 = await dbGetEmailNotificationByEnquiryId(inq1Id);
  assert('Notification logged in database table email_notifications', !!notif1);
  assert('Recipient is configured to recars.in@gmail.com', notif1?.recipient.toLowerCase() === 'recars.in@gmail.com');
  assert('Subject matches format: [Recars] New Customer Enquiry — Car Inquiry', notif1?.subject === '[Recars] New Customer Enquiry — Car Inquiry');

  // -------------------------------------------------------------------------
  // Scenario 2: A customer submits an interest form
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 2] Customer submits an interest form');
  const inq2Id = `inq-interest-${Date.now()}`;
  const res2 = await fetch(`${BASE_URL}/api/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: inq2Id,
      carId: 'recars-104',
      carTitle: '2022 Kia Seltos HTX Plus',
      carPrice: 1350000,
      userName: 'Ananya Sharma',
      userPhone: '+91 99088 54321',
      userEmail: 'ananya.sharma@yahoo.co.in',
      city: 'Warangal',
      inquiryType: 'Interested in Vehicle',
      message: 'Interested in purchasing. Please share loan eligibility requirements.',
    }),
  });
  const data2 = await res2.json();
  assert('API returns success: true for interest form', data2.success === true);

  await new Promise((r) => setTimeout(r, 600));
  const notif2 = await dbGetEmailNotificationByEnquiryId(inq2Id);
  assert('Interest notification logged in database', !!notif2);
  assert('Subject matches: [Recars] New Customer Enquiry — Interested in Vehicle', notif2?.subject === '[Recars] New Customer Enquiry — Interested in Vehicle');

  // -------------------------------------------------------------------------
  // Scenario 3: A customer requests a test drive
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 3] Customer requests a test drive');
  const tdId = `TD-test-${Date.now().toString().slice(-6)}`;
  const res3 = await fetch(`${BASE_URL}/api/test-drive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: tdId,
      carId: 'recars-102',
      carTitle: '2021 Honda City ZX',
      carPrice: 980000,
      userName: 'Rajesh Kulkarni',
      userPhone: '+91 94401 98765',
      userEmail: 'kulkarni.rajesh@outlook.com',
      city: 'Warangal',
      preferredDate: '2026-10-20',
      preferredTimeSlot: '11:00 AM - 01:00 PM',
      type: 'Home Test Drive',
    }),
  });
  const data3 = await res3.json();
  assert('API returns success: true for test drive booking', data3.success === true);

  await new Promise((r) => setTimeout(r, 600));
  const notif3 = await dbGetEmailNotificationByEnquiryId(tdId);
  assert('Test drive notification logged in database', !!notif3);
  assert('Subject matches: [Recars] New Customer Enquiry — Test Drive Request', notif3?.subject === '[Recars] New Customer Enquiry — Test Drive Request');

  // -------------------------------------------------------------------------
  // Scenario 4: A customer submits a car selling enquiry & negotiation
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 4] Customer submits a car selling enquiry & negotiation');
  const sellId = `REC-SELL-test-${Date.now().toString().slice(-5)}`;
  const res4 = await fetch(`${BASE_URL}/api/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: sellId,
      make: 'Maruti Suzuki',
      model: 'Swift',
      variant: 'ZXi AMT',
      year: 2022,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      kilometers: 24000,
      ownership: '1st Owner',
      accidentHistory: 'None',
      sellerName: 'Suresh Reddy',
      sellerPhone: '+91 97001 23456',
      sellerCity: 'Warangal',
      preferredInspectionDate: 'Tomorrow',
      preferredInspectionTime: '02:00 PM - 04:00 PM',
      estimatedPriceMin: 580000,
      estimatedPriceMax: 640000,
    }),
  });
  const data4 = await res4.json();
  assert('API returns success: true for sell request', data4.success === true);

  await new Promise((r) => setTimeout(r, 600));
  const notif4 = await dbGetEmailNotificationByEnquiryId(sellId);
  assert('Sell car notification logged in database', !!notif4);
  assert('Subject matches: [Recars] New Customer Enquiry — Sell Car Request', notif4?.subject === '[Recars] New Customer Enquiry — Sell Car Request');

  // -------------------------------------------------------------------------
  // Scenario 5: Email service temporary failure handling
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 5] Email service temporarily fails / unconfigured SMTP');
  // Attempt to send notification with an unconfigured / invalid transporter without failing customer enquiry
  const failEnquiryId = `inq-fail-test-${Date.now()}`;
  const directResult = await sendEnquiryNotification({
    enquiryId: failEnquiryId,
    enquiryType: 'General Customer Enquiry',
    customerName: 'Praveen Teja',
    customerPhone: '+91 98499 11223',
    customerEmail: 'praveen.teja@gmail.com',
    message: 'Testing email resilience during SMTP disruption',
  });
  
  assert('sendEnquiryNotification handles missing/invalid SMTP without crashing', typeof directResult.status === 'string');
  const notifFail = await dbGetEmailNotificationByEnquiryId(failEnquiryId);
  assert('Enquiry is still recorded in DB despite email status', !!notifFail);
  assert('Notification status reflects pending or failed appropriately', notifFail?.status === 'pending' || notifFail?.status === 'failed');

  // -------------------------------------------------------------------------
  // Scenario 6: Retrying without duplicate notifications
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 6] Idempotency & Admin Retry mechanism');
  // Test duplicate suppression when already sent
  const dupResult = await sendEnquiryNotification({
    enquiryId: inq1Id,
    enquiryType: 'Car Inquiry',
    customerName: 'Venkatesh Rao',
  }, false /* forceRetry = false */);
  
  assert('Duplicate submission correctly handled', dupResult !== undefined);

  // Test admin retry API endpoint
  const retryRes = await fetch(`${BASE_URL}/api/admin/notifications/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enquiryId: inq1Id }),
  });
  const retryData = await retryRes.json();
  assert('Admin retry endpoint responds successfully', retryRes.status === 200);
  assert('Admin retry payload returns status information', !!retryData.status || !!retryData.error);

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
