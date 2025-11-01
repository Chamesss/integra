import { logger } from "../utils/logger";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./.database/_.db",
  logging: false,
  pool: {
    max: 1, // SQLite doesn't support concurrent writes well
    min: 0,
    acquire: 60000, // Increased to 60 seconds
    idle: 10000,
  },
  dialectOptions: {
    // Enhanced SQLite configuration for better concurrency
    options: [
      "PRAGMA journal_mode = WAL;", // Write-Ahead Logging for better concurrency
      "PRAGMA synchronous = NORMAL;", // Balance between safety and performance
      "PRAGMA cache_size = 2000000;", // Increased cache size (2GB)
      "PRAGMA temp_store = memory;", // Store temp tables in memory
      "PRAGMA busy_timeout = 60000;", // Increased busy timeout to 60 seconds
      "PRAGMA wal_autocheckpoint = 1000;", // Checkpoint WAL file more frequently
      "PRAGMA optimize;", // Enable query planner optimizations
    ],
  },
  retry: {
    match: [/SQLITE_BUSY/, /database is locked/, /SequelizeTimeoutError/],
    max: 10, // Increased retry attempts
  },
});

export async function initDB() {
  try {
    logger.info("Initializing database...");

    const { registerModels } = await import("../models/index");
    registerModels();

    await sequelize.authenticate();
    logger.info("Database authenticated successfully");

    // Run database optimization queries
    await sequelize.query("PRAGMA optimize;");
    await sequelize.query("PRAGMA wal_checkpoint(RESTART);");
    logger.info("Database optimized");

    await sequelize.sync();
    logger.info("Database synchronized successfully");

    const { insertDefaultRoles } = await import("../models/role");
    await insertDefaultRoles();
    logger.info("Default roles inserted");

    // Remove automatic category sync from init - let the frontend handle it
    logger.info("SQLite3 with Sequelize initialized successfully.");
  } catch (error) {
    logger.error("DB initialization error:", error);
    throw error;
  }
}

export async function optimizeDatabase() {
  try {
    logger.info("Running database optimization...");
    await sequelize.query("PRAGMA optimize;");
    await sequelize.query("PRAGMA wal_checkpoint(RESTART);");
    await sequelize.query("PRAGMA analysis_limit=1000;");
    await sequelize.query("PRAGMA optimize;");
    logger.info("Database optimization completed");
  } catch (error) {
    logger.error("Database optimization error:", error);
  }
}

export async function getDatabaseInfo() {
  try {
    const [walMode] = await sequelize.query("PRAGMA journal_mode;");
    const [busyTimeout] = await sequelize.query("PRAGMA busy_timeout;");
    const [cacheSize] = await sequelize.query("PRAGMA cache_size;");
    const [walCheckpoint] = await sequelize.query("PRAGMA wal_checkpoint;");

    return {
      journalMode: walMode,
      busyTimeout: busyTimeout,
      cacheSize: cacheSize,
      walCheckpoint: walCheckpoint,
    };
  } catch (error) {
    logger.error("Error getting database info:", error);
    return null;
  }
}
