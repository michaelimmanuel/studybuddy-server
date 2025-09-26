import express from "express";
import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { auth } from "./lib/auth";
import { Request, Response } from "express";
import { healthCheck } from "./controller";
import { signUp, login } from "./controller/auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8000;

const router = Router();



// app.use("/api/auth", auth.handler);

app.use(
  cors({
    origin: "http://localhost:8000", 
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);



app.use('/api', router);

router.post('/auth/register', signUp);
router.post('/auth/login', login);

// Integrate better-auth routes
// app.use('/api/auth', toNodeHandler(auth));
router.get('/health', healthCheck);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
