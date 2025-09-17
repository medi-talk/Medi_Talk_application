const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});


app.use('/api/users', usersRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
