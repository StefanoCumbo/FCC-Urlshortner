require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require("dns");
const urlparser = require("url");

const client = new MongoClient(process.env.DB_URL);
const db = client.db("urlshort")
const urls = db.collection("urls")
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
//middlewear to get req.body
app.use(express.urlencoded({extended: true}));
//middlewear to get json
app.use(express.json());


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res)=> {
  console.log(req.body);
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname ,
  async (err, address) =>{
    if (!address){
      res.json({error: "Invalid URL"})
    } else{
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url: url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result)
      res.json({origional_url: url, short_url: urlCount})




    }
  })


  
});

app.get("/api/shorturl/:short_url", async(req, res)=>{
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({ short_url: +shorturl})
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});