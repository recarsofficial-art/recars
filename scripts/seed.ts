import { dbInsertCar, dbInsertInquiry, pool } from '../lib/db';
import { INITIAL_CARS } from '../lib/data';
import { CarInquiry } from '../lib/types';

const SAMPLE_INQUIRIES: CarInquiry[] = [
  {
    id: 'inq-101',
    carId: 'recars-101',
    carTitle: '2022 Hyundai Creta SX (O) Turbo',
    carImage: '/car-creta-real.jpg',
    carPrice: 1250000,
    userName: 'Karthik Varma',
    userPhone: '+91 98490 23412',
    userEmail: 'karthik.varma@gmail.com',
    city: 'Hyderabad',
    inquiryType: 'Price Quote / Best Offer',
    message: 'Interested in making immediate payment this weekend. Is any discount available on the handling fee, and can we schedule an OBD diagnostic review?',
    status: 'New',
    createdAt: '2026-10-12T10:30:00Z',
  },
  {
    id: 'inq-102',
    carId: 'recars-102',
    carTitle: '2021 Honda City ZX CVT',
    carImage: '/car-city-real.jpg',
    carPrice: 980000,
    userName: 'Meera Iyer',
    userPhone: '+91 98840 55190',
    userEmail: 'meera.iyer@outlook.com',
    city: 'Bengaluru',
    inquiryType: 'Loan & Financing',
    message: 'Looking for 80% financing with zero down-payment options through HDFC or ICICI bank. What would be the exact EMI for a 5-year tenure?',
    status: 'In Progress',
    createdAt: '2026-10-11T16:15:00Z',
  },
  {
    id: 'inq-103',
    carId: 'recars-103',
    carTitle: '2023 Mahindra Thar LX Hard Top 4x4',
    carImage: '/car-thar-real.jpg',
    carPrice: 1420000,
    userName: 'Vikramaditya Rao',
    userPhone: '+91 97011 88442',
    userEmail: 'vikram.rao@techcorp.in',
    city: 'Hyderabad',
    inquiryType: 'Home Delivery Inquiry',
    message: 'Can this vehicle be delivered directly to my residence in Jubilee Hills for pre-delivery inspection before transferring funds?',
    status: 'Contacted',
    createdAt: '2026-10-10T12:00:00Z',
  },
  {
    id: 'inq-104',
    carId: 'recars-104',
    carTitle: '2020 Toyota Fortuner 2.8 4x4 AT',
    carImage: '/car-fortuner-real.jpg',
    carPrice: 2890000,
    userName: 'Rajesh Singhania',
    userPhone: '+91 98200 44109',
    userEmail: 'rsinghania@corpventures.com',
    city: 'Mumbai',
    inquiryType: 'Inspection Report Request',
    message: 'Please send over the complete 200-point inspection engineering PDF including paint depth gauge readings and suspension status.',
    status: 'New',
    createdAt: '2026-10-12T14:45:00Z',
  },
];

async function seed() {
  console.log('Seeding Supabase database with verified cars...');
  for (const car of INITIAL_CARS) {
    await dbInsertCar(car);
    console.log(`✓ Inserted car: ${car.year} ${car.make} ${car.model} (${car.id})`);
  }

  console.log('\nSeeding Supabase database with sample inquiries & customer profiles...');
  for (const inq of SAMPLE_INQUIRIES) {
    await dbInsertInquiry(inq);
    console.log(`✓ Inserted inquiry: ${inq.id} from ${inq.userName}`);
  }

  console.log('\nDatabase seeding complete!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
