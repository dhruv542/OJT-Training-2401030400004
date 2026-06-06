const express = require("express");
const cors = require("cors");

require("./config/db");

const app = express();

// Allow cross-origin requests so other applications can POST orders
app.use(cors());
app.use(express.json());

// Mount API routes
app.use(require("./routes/orderRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});
