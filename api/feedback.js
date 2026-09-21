import { db, knowledge, ai } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const userId=req.user.id;
  const b=req.body||{};
  if(!b.creative_id||!b.rating) return res.status(400).json({error:"creative_id and rating are required"});
  const own=await db.query("SELECT c.*,ca.name campaign_name FROM creatives c LEFT JOIN campaigns ca ON ca.id=c.campaign_id WHERE c.id=$1 AND c.user_id=$2",[b.creative_id,userId]);
  if(!own.rows[0]) return res.status(404).json({error:"Creative not found"});
  const r=await db.query("INSERT INTO feedback (user_id,creative_id,rating,note,metric_name,metric_value) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",[userId,b.creative_id,Math.max(1,Math.min(5,Number(b.rating))),b.note||"",b.metric_name||"",b.metric_value??null]);
  const c=own.rows[0];
  const learn=`Campaign: ${c.campaign_name}\nCreative: ${c.headline}\nPrimary text: ${c.primary_text}\nRating: ${b.rating}/5\nNote: ${b.note||"none"}\nMetric: ${b.metric_name||"none"} ${b.metric_value??""}`;
  await knowledge.base("creative_learnings",{dimensions:1536}).add([{id:"f:"+userId+":r:"+r.rows[0].id,text:learn,metadata:{user_id:userId,creative_id:String(b.creative_id),rating:Number(b.rating)}}]);
  res.json(r.rows[0]);
}