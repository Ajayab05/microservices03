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

app.get("/products",async(req,res)=>{

    const result=await pool.query(
        "SELECT * FROM products ORDER BY id"
    );

    res.json(result.rows);
});

app.post("/products",async(req,res)=>{

    const {name,price}=req.body;

    const result=await pool.query(
        "INSERT INTO products(name,price) VALUES($1,$2) RETURNING *",
        [name,price]
    );

    res.status(201).json(result.rows[0]);
});

app.put("/products/:id",async(req,res)=>{

    const {name,price}=req.body;

    const result=await pool.query(
        "UPDATE products SET name=$1,price=$2 WHERE id=$3 RETURNING *",
        [name,price,req.params.id]
    );

    res.json(result.rows[0]);
});

app.delete("/products/:id",async(req,res)=>{

    await pool.query(
        "DELETE FROM products WHERE id=$1",
        [req.params.id]
    );

    res.json({message:"deleted"});
});

app.listen(3001,()=>{
    console.log("Product Service Running");
});