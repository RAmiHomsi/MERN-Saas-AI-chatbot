import app from "./app";
import { connectToDatabase } from "./db/connection";

const PORT = process.env.PORT || 5000;
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => console.log("Server Open & Connected To Database"));
  })
  .catch((err) => console.log(err));
