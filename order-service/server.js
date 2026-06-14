const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432
});

app.get("/health",(req,res)=>{
    res.json({status:"UP"});
});

app.get("/orders",async(req,res)=>{

    const result=await pool.query(
        "SELECT * FROM orders ORDER BY id"
    );

    res.json(result.rows);
});

app.post("/orders",async(req,res)=>{

    const {user_id,product_id,quantity}=req.body;

    const result=await pool.query(
        `INSERT INTO orders(user_id,product_id,quantity)
         VALUES($1,$2,$3)
         RETURNING *`,
        [user_id,product_id,quantity]
    );

    res.status(201).json(result.rows[0]);
});

app.listen(3002,()=>{
    console.log("Order Service Running");
});