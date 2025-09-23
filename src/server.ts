import express from "express";
import { Router } from "express";

const app = express();
const PORT = process.env.PORT || 8000;

const router = Router();

app.use(express.json());
app.use('/', router);

router.get("/ping", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
