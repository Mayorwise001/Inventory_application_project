// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Core & third-party imports
import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import multer from 'multer';
import http from 'http';
import cors from 'cors';
import methodOverride from 'method-override';
import session from "express-session";
import createDebug from 'debug';
import cookieParser from "cookie-parser";
const debug = createDebug('my-express-app:server');

// Routes
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import uploadRouter from './routes/upload.js';
import categoryRouter from './routes/categories.js';


// Middleware
import authMiddleware from './middleware/auth.js';

// ESM equivalent for __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Other middleware

const app = express();
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(
  session({
    secret: "secret", // use dotenv for production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true only with HTTPS
  })
);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));









app.use(cors({
  origin: "http://localhost:3000",  // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use('/upload', uploadRouter)

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/categories', categoryRouter)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Handle 404 - Page Not Found
app.use((req, res, next) => {
  res.status(404).render('404'); 
});



// Error handling
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Get port from environment and store in Express.
 
import mongoose from "mongoose";

mongoose.set("strictQuery", false);
const MONGODB_URI = process.env.MONGODB_URI;
const mongoDB = MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log('connected')
}

const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);
/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, ()=>{
  console.log('server is running on port', port)

});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

// Allow requests from React frontend


export default app;
