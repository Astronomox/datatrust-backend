const logger = {
  info: (message, meta = {}) => {
    console.log(`info: ${message}`, JSON.stringify({ ...meta, timestamp: new Date().toISOString() }));
  },
  
  warn: (message, meta = {}) => {
    console.warn(`warn: ${message}`, JSON.stringify({ ...meta, timestamp: new Date().toISOString() }));
  },
  
  error: (message, meta = {}) => {
    console.error(`error: ${message}`, JSON.stringify({ ...meta, timestamp: new Date().toISOString() }));
  },
  
  debug: (message, meta = {}) => {
    console.debug(`debug: ${message}`, JSON.stringify({ ...meta, timestamp: new Date().toISOString() }));
  }
};

module.exports = logger;