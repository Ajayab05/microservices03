app.get("/health/live", (req,res)=>{
  res.status(200).json({
    status:"alive"
  });
});

app.get("/health/ready", async(req,res)=>{

  try{

    await pool.query("SELECT 1");

    res.status(200).json({
      status:"ready"
    });

  }catch(err){

    res.status(500).json({
      status:"not ready"
    });

  }
});

process.on("SIGTERM", async()=>{

  console.log("Shutting down");

  await pool.end();

  process.exit(0);

});