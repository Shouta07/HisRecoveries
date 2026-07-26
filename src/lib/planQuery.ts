// 編成条件の URL 表現。入力（LP のフォーム）と結果（/plan）を
// つなぐのはこの query だけ、という約束にしておく。
//
// こうしておくと、
//   ・結果を見返せる／相談前に共有できる
//   ・広告から条件つきで着地させられる（/plan?occasion=bigday&pref=tokyo…）
//   ・状態を持ち回るための store が要らない
// 逆に、ここに載らない情報は結果に出ない、が守るべき制約になる。

export type PlanQuery = {
  pref: string;
  age: string;
  goals: string[];
  text: string;
  date: string;
  occasion: string;
};

export function planQuery(q: PlanQuery): string {
  const p = new URLSearchParams();
  if (q.pref) p.set("pref", q.pref);
  if (q.age) p.set("age", q.age);
  if (q.goals.length) p.set("goals", q.goals.join(","));
  if (q.text.trim()) p.set("text", q.text.trim());
  if (q.date) p.set("date", q.date);
  if (q.occasion) p.set("occasion", q.occasion);
  return p.toString();
}

export function parsePlanQuery(search: string): PlanQuery {
  const p = new URLSearchParams(search);
  return {
    pref: p.get("pref") ?? "",
    age: p.get("age") ?? "",
    goals: (p.get("goals") ?? "").split(",").filter(Boolean),
    text: p.get("text") ?? "",
    date: p.get("date") ?? "",
    occasion: p.get("occasion") ?? "",
  };
}
