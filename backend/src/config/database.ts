import mongoose, { Connection } from 'mongoose';

interface DatabaseStats {
  dataSize: number;
  collections: number;
}

const connectDB = async (): Promise<Connection> => {
  try {
    const conn = await mongoose.connect(
      process.env['MONGODB_URI'] || 'mongodb://localhost:27017/saas-app'
    );
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Test the connection
    await testConnection();
    
    return conn.connection;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
};

const testConnection = async (): Promise<void> => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Collections found: ${collections.length}`);
    
    // Test a simple query
    const stats = await mongoose.connection.db.stats() as DatabaseStats;
    console.log(`💾 Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('✅ Database connection test successful');
  } catch (error) {
    console.error('❌ Database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error instanceof Error ? error.message : 'Unknown error');
  }
};

export {
  connectDB,
  disconnectDB,
  testConnection
}; 