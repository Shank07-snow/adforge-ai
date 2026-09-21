import { db, knowledge, ai } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const userId=req.user.id;
  const b=req.body||{};
  if(!b.campaign_id) return res.status(400).json({error:"campaign_id is required"});
  const c=await db.query("SELECT * FROM campaigns WHERE id=$1 AND user_id=$2",[b.campaign_id,userId]);
  if(!c.rows[0]) return res.status(404).json({error:"Campaign not found"});
  const campaign=c.rows[0];
  const query=[campaign.name,campaign.objective,campaign.platform,campaign.audience,campaign.offer,campaign.tone].filter(Boolean).join("\n");
  const hits=await knowledge.base("brand_brain",{dimensions:1536}).search(query,{topK:6,filter:{user_id:userId}});
  const context=hits.map((h,i)=>"["+String(i+1)+"] "+(h.metadata.title||"Brand source")+"\n"+h.metadata._text).join("\n\n");
  const system=`You are AdForge AI, a senior performance creative strategist. Generate useful, specific ad creative grounded in the provided brand context. Never invent testimonials, prices, guarantees, certifications, customer counts, or product capabilities. Prefer concrete benefits, proof points and audience language from context. Return ONLY valid JSON array with 4 objects containing headline, primary_text, cta, visual_direction, rationale. Make the four angles meaningfully different: benefit-led, problem-solution, proof-led, and curiosity-led. Respect platform conventions for ${campaign.platform}.\n\nBRAND CONTEXT:\n${context || "No brand context found. Keep claims generic and explicitly avoid unsupported facts."}`;
  const result=await ai.generateText({model:"sonnet",system,prompt:"Create 4 ad variations for this campaign:\n"+query,purpose:"ad-creative-generation",userId});
  let items=[];
  try{ items=JSON.parse(result.text); }catch{ return res.status(502).json({error:"Model returned invalid creative JSON",raw:result.text}); }
  const saved=[];
  for(const x of items.slice(0,4)){
    const r=await db.query("INSERT INTO creatives (user_id,campaign_id,platform,format,headline,primary_text,cta,visual_direction,rationale,source_ids) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",[userId,campaign.id,campaign.platform,b.format||"Feed ad",x.headline,x.primary_text,x.cta||"",x.visual_direction||"",x.rationale||"",hits.map(h=>h.metadata.source_id).filter(Boolean).join(",")]);
    saved.push(r.rows[0]);
  }
  res.json({campaign,sources:hits.map(h=>({title:h.metadata.title,score:h.similarity,source_id:h.metadata.source_id})),creatives:saved});
}