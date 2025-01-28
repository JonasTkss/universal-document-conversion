// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./config/rateLimiter");
const { requestLogger, logger } = require("./utils/logger");
const rapidApiAuth = require("./middleware/rapidApiAuth");

// Import routes
const routes = require("./routes");

// Create Express app
const app = express();

// Basic middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// RapidAPI Authentication
app.use(rapidApiAuth);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes - this will include all routes from routes/index.js
app.use("/v1", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
});

// Error handling
app.use(errorHandler);

const getAllRoutes = (app) => {
  const routes = [];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    }
  });

  const apiRouter = app._router.stack.find(
    (layer) => layer.name === "router" && layer.regexp.test("/v1")
  );
  if (apiRouter) {
    apiRouter.handle.stack.forEach((layer) => {
      if (layer.route) {
        routes.push({
          path: `/v1${layer.route.path}`,
          methods: Object.keys(layer.route.methods),
        });
      } else if (layer.name === "router") {
        layer.handle.stack.forEach((nestedLayer) => {
          if (nestedLayer.route) {
            const basePath = layer.regexp.source
              .replace("^\\/", "")
              .replace("\\/?(?=\\/|$)", "")
              .replace(/\\/g, "");
            const routePath =
              nestedLayer.route.path === "/" ? "" : nestedLayer.route.path;
            routes.push({
              path: `/v1/${basePath}${routePath}`,
              methods: Object.keys(nestedLayer.route.methods),
            });
          }
        });
      }
    });
  }

  return routes;
};

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
  );

  const availableRoutes = getAllRoutes(app);
  logger.info("Available routes:", { routes: availableRoutes });
});

const gracefulShutdown = () => {
  logger.info("Received shutdown signal. Closing HTTP server...");

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;
