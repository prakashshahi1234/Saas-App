export const setupGracefulShutdown = (): void => {
  const gracefulShutdown = (signal: string) => {
    console.log(`🛑 ${signal} received, shutting down gracefully`);
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}; 