import { db } from "hatchable";
export const access = "user";
export const methods = ["GET"];
export default async function(req,res){
  const userId=req.user.id;
  const [a,b,d]=await Promise.all([
    db.query("SELECT count(*)::int AS count FROM campaigns WHERE user_id=$1",[userId]),
    db.query("SELECT count(*)::int AS count FROM creatives WHERE user_id=$1",[userId]),
    db.query("SELECT coalesce(avg(rating),0)::numeric(10,2) AS avg_rating,count(*)::int AS feedback_count FROM feedback WHERE user_id=$1",[userId])
  ]);
  res.json({campaigns:a.rows[0].count,creatives:b.rows[0].count,avg_rating:d.rows[0].avg_rating,feedback_count:d.rows[0].feedback_count});
}