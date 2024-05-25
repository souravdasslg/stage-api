export default {
  id: "default",
  url: process.env.DATABASE_URL || "mongodb://localhost:27017/default",
  connectionOptions: {}
};
