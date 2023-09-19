const app = require("./app");
require("dotenv").config();
const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
