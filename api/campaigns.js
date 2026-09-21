import { db } from "hatchable";
export const access = "user";
export const methods = ["GET","POST"];
export default async function(req,res){
  const userId=req.user.id;
  if(req.method==="POST"){
    const b=req.body||{};
    if(!b.name||!b.objective||!b.platform||!b.audience) return res.status(400).json({error:"name, objective, platform and audience are required"});
    const {rows}=await db.query("INSERT INTO campaigns (user_id,name,objective,platform,audience,offer,tone) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",[userId,b.name,b.objective,b.platform,b.audience,b.offer||"",b.tone||"Clear and confident"]);
    return res.json(rows[0]);
  }
  const {rows}=await db.query("SELECT * FROM campaigns WHERE user_id=$1 ORDER BY created_at DESC",[userId]);
  res.json(rows);
}