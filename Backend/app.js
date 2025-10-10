const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/usersRoutes');
const intakeCalcRoutes = require('./routes/intakeCalcRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});


app.use('/api/users', usersRoutes);
app.use('/api/intakeCalc', intakeCalcRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
