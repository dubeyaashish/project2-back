const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Stylist = require('./models/Stylist'); 
const Portfolio = require('./models/Portfolio'); 
const Booking = require('./models/Booking');

const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'wdaadadadefsfsfwesefegsgs';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
}));

console.log(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL);

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

function getStylistDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, stylistData) => {
      if (err) throw err;
      resolve(stylistData);
    });
  });
}

app.get('/test', (req, res) => {
  res.json('test ok');
});

app.post('/signup', async(req,res) => {
  const {name,surname,email,password} = req.body;

  try{
    const userDoc = await User.create({
      name,
      surname,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  }catch(e) {
    res.status(422).json(e);
  }

});

app.post('/login', async (req, res) => {
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email, 
        id:userDoc._id, 
        name:userDoc.name}, 
        jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('password wrong');
    }
  } else {
    res.json('not found');
  }
});

app.post('/stylistlogin', async (req, res) => {
  const {email, password} = req.body;
  const stylistDoc = await Stylist.findOne({email});
  if (stylistDoc) {
    const passOk = bcrypt.compareSync(password, stylistDoc.password);
    if (passOk) {
      jwt.sign({
        email: stylistDoc.email, 
        id: stylistDoc._id, 
        name: stylistDoc.name
      }, 
      jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(stylistDoc);
      });
    } else {
      res.status(422).json('password wrong');
    }
  } else {
    res.json('not found');
  }
});

app.post('/stylistsignup', async(req,res) => {
  const {name,surname,email,password} = req.body;

  try{
    const stylistDoc = await Stylist.create({
      name,
      surname,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(stylistDoc);
  }catch(e) {
    res.status(422).json(e);
  }
});


app.get('/profile', (req, res) => {
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) =>{
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);

      res.json({name,email,_id});
    })
  } else{
    res.json(null);
  }
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json(true);

});

app.get('/stylistprofile', (req, res) => {
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, stylistData) =>{
      if (err) throw err;
      const {name,email,_id} = await Stylist.findById(stylistData.id);

      res.json({name,email,_id});
    })
  } else{
    res.json(null);
  }
});

app.get('/portfolios/:id', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {id} = req.params;
  res.json(await Portfolio.findById(id));
});

app.post('/portfolios', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    id, title,description,experience,address,price,
  } = req.body;
  console.log('Received portfolio data:', req.body); // Add this line for debugging purposes
  jwt.verify(token, jwtSecret, {}, async (err, stylistData) => {
    if (err) throw err;
    const portfolioDoc = await Portfolio.create({
      owner:stylistData.id, title,description, experience,
      address,price,
    });
    console.log('Inserted portfolio data:', portfolioDoc); // Add this line for debugging purposes
    res.json(portfolioDoc);
  });
});
app.get('/stylist-portfolios', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, stylistData) => {
    const {id} = stylistData;
    res.json( await Portfolio.find({owner:id}) );
  });
  
});
app.delete('/portfolios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Portfolio.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(422).json(e);
  }
});

app.put('/portfolios', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    id, title,address,price,description,experience,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, stylistData) => {
    if (err) throw err;
    const portfolioDoc = await Portfolio.findById(id);
    if (stylistData.id === portfolioDoc.owner.toString()) {
      portfolioDoc.set({
        title,address,price,description,experience,
      });
      await portfolioDoc.save();
      res.json('ok');
    }
  });
});

app.get('/portfolios', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json( await Portfolio.find() );
});

app.post('/bookings', async (req, res) => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    const {
      portfolio,
      title,
      price,
      user,
      stylist,
      username,
      stylistname
    } = req.body;
    const booking = await Booking.create({
      portfolio,
      title,
      price,
      user,
      stylist,
      username,
      stylistname
    });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/bookings', async (req,res) => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    const bookings = await Booking.find({user: userData.id}).populate('portfolio');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(3000);