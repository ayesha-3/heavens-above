import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send(" Heavens Above is running successfully!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(` Server started on port ${PORT}`));
