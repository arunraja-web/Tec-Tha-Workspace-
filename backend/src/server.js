const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

// Seed Initial System Users (Admin & Employee)
const seedInitialUsers = async () => {
  try {
    // 1. Seed Admin User
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@tectha.com';
    const adminPass = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        secondaryEmail: 'admin.recovery@tectha.com',
        phone: '9999999999',
        password: adminPass,
        role: 'admin',
        isActive: true
      });
      console.log('----------------------------------------------------');
      console.log('INITIAL ADMIN CREATED SUCCESSFULLY:');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPass}`);
      console.log('----------------------------------------------------');
    }

    // 2. Seed Employee User
    const empEmail = process.env.EMPLOYEE_INITIAL_EMAIL || 'test@tectha.com';
    const empPass = process.env.EMPLOYEE_INITIAL_PASSWORD || '123456';
    const existingEmp = await User.findOne({ email: empEmail });

    if (!existingEmp) {
      await User.create({
        name: 'Test Employee',
        email: empEmail,
        secondaryEmail: 'test.recovery@tectha.com',
        phone: '8888888888',
        password: empPass,
        role: 'employee',
        isActive: true
      });
      console.log('----------------------------------------------------');
      console.log('INITIAL EMPLOYEE CREATED SUCCESSFULLY:');
      console.log(`Email: ${empEmail}`);
      console.log(`Password: ${empPass}`);
      console.log('----------------------------------------------------');
    }
  } catch (error) {
    console.error('Error seeding initial users:', error.message);
  }
};

// Connect Database & Start Server
connectDB().then(() => {
  seedInitialUsers();

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception Error: ${err.message}`);
    process.exit(1);
  });
});
