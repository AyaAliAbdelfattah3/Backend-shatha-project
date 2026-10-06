// const dns = require("dns");
// const mongoose = require("mongoose");

// // Some ISP/router DNS resolvers answer normal lookups fine but refuse SRV
// // queries (`querySrv ECONNREFUSED`), which is what `mongodb+srv://` URIs
// // need to find the Atlas cluster's hosts. Falling back to public DNS avoids
// // that class of connection failure without requiring each student to change
// // their OS network settings.
// if (process.env.MONGO_URI?.startsWith("mongodb+srv://")) {
//   dns.setServers(["8.8.8.8", "1.1.1.1"]);
// }

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`MongoDB connection error: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const dns = require("dns");
const mongoose = require("mongoose");

// قراءة المتغير بكلتا التسميتين لضمان عمله في كل الحالات
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (MONGO_URI?.startsWith("mongodb+srv://")) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (dnsErr) {
    console.warn("DNS setServers warning:", dnsErr.message);
  }
}

let isConnected = false;

const connectDB = async () => {
  // إذا كان متصلاً بالفعل، لا تقم بإعادة الاتصال
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  if (!MONGO_URI) {
    throw new Error("Neither MONGO_URI nor MONGODB_URI is defined in Environment Variables");
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // عدم استخدام process.exit(1) هنا لتفادي كراش بيئة Vercel
    throw error;
  }
};

module.exports = connectDB;