import { db, knowledge } from "hatchable";
export const access = "user";
export const methods = ["GET","POST"];
const kb=()=>knowledge.base("brand_brain",{dimensions:1536});
export default async function(req,res){
  const userId=req.user.id;
  if(req.method==="POST"){
    const b=req.body||{};
    if(!b.title||!b.content) return res.status(400).json({error:"title and content are required"});
    const {rows}=await db.query("INSERT INTO brand_sources (user_id,title,source_type,content) VALUES ($1,$2,$3,$4) RETURNING *",[userId,b.title,b.source_type||"brand-note",b.content]);
    const row=rows[0];
    await kb().add([{id:"u:"+userId+":s:"+row.id,text:b.content,metadata:{user_id:userId,source_id:String(row.id),title:b.title,source_type:b.source_type||"brand-note"}}]);
    return res.json(row);
  }
  const {rows}=await db.query("SELECT id,title,source_type,created_at FROM brand_sources WHERE user_id=$1 ORDER BY created_at DESC",[userId]);
  res.json(rows);
}