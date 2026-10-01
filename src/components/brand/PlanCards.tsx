import Link from "next/link";
import { PLANS, FAMILIES, PASS_VALID_DAYS, type Family, type Plan, type PlanId } from "@/lib/ask/plans";
import PlanCta from "@/components/brand/PlanCta";
import PlanArt from "@/components/brand/PlanArt";
import Reveal from "@/components/brand/Reveal";
import Yen from "@/components/brand/Yen";

// 料金（/plans）。
//
// ══════════════════════════════════════════════════
// 商品ごとに1枚、をやめた
// ══════════════════════════════════════════════════
// 前は4商品を4枚のカードにして、縦に並べていた。
// 1回売りと5回パスは同じ中身なので、
// 「返ってくるもの」の7行が、まったく同じまま2回出ていた。
//
// スマホで見ると、1画面に1枚しか入らない。
// 「文字と声、どちらにするか」を決めたいのに、
// 比べるために3回スクロールすることになる。
//
// 並べ方を変える。
//   家族（文章・画像 / 声）でまとめて、
//   その中に買い方（1回 / 5回パス）を2行だけ置く。
// 中身の説明は家族に1つ。買い方では変わらないので。
//
// ══════════════════════════════════════════════════
// 値引きを売り文句にしない
// ══════════════════════════════════════════════════
// 「○%オフ」「まとめ買いがお得」は書かない。
// 1回あたりの金額を並べれば、見れば分かる。
//
// 5回パスが在るのは安いからではなく、
// 1人の相手と進むあいだに決めることが何度も起きるから。
//   プロフィール → 最初のLINE → 誘う → デートの後 → 次の一手
// その説明は、家族の売り文句（tagline）が持っている。
//
// ══════════════════════════════════════════════════
// 買えないものを、買えるように見せない
// ══════════════════════════════════════════════════
// 押しても課金画面に行かないものは、順番待ちへ渡す。
// ここを曖昧にすると、届けられない約束を売ることになる。

/**
 * 家族の絵。買い方では変えない。
 *
 * 絵は商品ごとではなく家族に1つ。
 * まとめ買いのほうには絵を持たせていないので、
 * list の最後から引くと、声のカードだけ絵が消える（実際に消えた）。
 */
const ART: Record<Family, PlanId> = {
  text: "review",
  call: "call15",
};

/** 1回あたり。まとめ買いだけ出す */
function perUse(p: Plan): number | null {
  return p.uses ? Math.round(p.yen / p.uses) : null;
}

/**
 * 買い方の1行。
 *
 * 左に名前と金額、右にボタン。
 * 狭い画面では折り返すが、金額とボタンの順番は変えない。
 */
function Row({ p, open, from }: { p: Plan; open: boolean; from: string }) {
  const unit = perUse(p);

  // ══════════════════════════════════════════════
  // ボタンの位置を、行ごとにばらつかせない
  // ══════════════════════════════════════════════
  // 前は flex-wrap で並べていた。
  // ボタンの文字数が行ごとに違うので、
  // 短いほう（順番待ちに入る）だけ右に収まり、
  // 長いほう（この恋、5回確カメる）だけ下に落ちた。
  // 同じカードの中で、押すところが右と下に分かれて見えた。
  //
  // 狭い画面では必ず下、広い画面では必ず右に固定する。
  return (
    <li className="grid gap-2.5 border-t border-line py-3.5 first:border-t-0 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
      <div className="min-w-0">
        <p className="text-[14px] font-black leading-[1.4] text-slate">
          {p.name}
          <span className="ml-2.5 text-[21px]">
            <Yen yen={p.yen} from={p.from} />
          </span>
        </p>
        {/* 1回あたりは、まとめ買いのときだけ。
            1回売りに「1回あたり ¥1,980」と書いても意味が無い */}
        {unit !== null && (
          <p className="mt-1 text-[11.5px] tabular-nums text-steel">
            1回あたり ¥{unit.toLocaleString()} ／ 有効期限 {PASS_VALID_DAYS}日
          </p>
        )}
      </div>

      {open ? (
        <PlanCta
          plan={p.id}
          from={from}
          className="min-h-[46px] w-full rounded-pill bg-brand px-5 text-[13.5px] !text-paper shadow-card sm:w-auto"
        >
          {p.tagline.replace(/。$/, "")} <span aria-hidden className="ml-1.5">&rarr;</span>
        </PlanCta>
      ) : (
        <Link
          href="/talk"
          className="inline-flex min-h-[46px] w-full items-center justify-center rounded-pill border border-line bg-paper px-5 text-[13px] font-bold text-steel sm:w-auto"
        >
          順番待ちに入る <span aria-hidden className="ml-1.5">&rarr;</span>
        </Link>
      )}
    </li>
  );
}

export default function PlanCards({
  from,
  openIds,
  families = ["text", "call"],
}: {
  from: string;
  /**
   * いま実際に買えるIDの一覧（サーバーが call/gate.ts から作る）。
   *
   * 声で話す商品は、コードの available が false のままでも、
   * 鍵が揃っていれば買える。その判定は環境を見るので、
   * サーバー側で作ってここへ渡す（client で見ると答えが変わる）。
   */
  openIds?: string[];
  families?: Family[];
}) {
  const isOpen = (id: string) => (openIds ? openIds.includes(id) : false);

  return (
    <div className="flex flex-col gap-4">
      {families.map((fid, i) => {
        const f = FAMILIES.find((x) => x.id === fid);
        if (!f) return null;
        // 安い買い方から。1回 → 5回パス
        const list = PLANS.filter((p) => p.family === fid).sort((a, b) => a.yen - b.yen);
        if (list.length === 0) return null;
        const open = list.some((p) => isOpen(p.id));
        // 中身は買い方で変わらないので、家族に1つだけ出す。
        // 前は商品ごとに出していて、同じ7行が2回並んでいた。
        //
        // ただし、お試し（はじめの1件）だけは中身が軽い。
        // list[0] は値段順なのでお試しが来る。そこから取ると、
        // ¥1,980 や ¥7,700 で返ってくるものを、少なく見せることになる。
        // 通常の買い方のほうから取り、お試しの差は行の側に書く。
        const normals = list.filter((p) => !p.trial);
        const includes = (normals[0] ?? list[0]).includes;
        const trial = list.find((p) => p.trial);
        // お試しで返らないもの。書いてあるものを引くだけなので、
        // 中身を変えたら、ここも自動で追いつく。
        const notInTrial = trial
          ? includes.filter((x) => !trial.includes.includes(x))
          : [];

        return (
          <Reveal key={fid} delay={i * 60}>
            <section className="rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
              <div className="relative">
                <PlanArt id={ART[fid]} />
                {!open && (
                  <span className="absolute right-1 top-1 rounded-pill bg-paper/95 px-2.5 py-1 text-[10.5px] font-bold text-steel shadow-card">
                    受付前
                  </span>
                )}
              </div>

              <h2 className="text-[19px] font-black leading-[1.4] text-slate sm:text-[21px]">
                {f.label}
              </h2>
              <p className="mt-2 text-[13px] leading-[1.8] text-steel">{f.lead}</p>

              {/* 買い方。ここが比べるところなので、間に説明を挟まない */}
              <ul className="mt-5 flex flex-col border-t border-line pt-4">
                {list.map((p) => (
                  <li key={p.id} className="contents">
                    <Row p={p} open={isOpen(p.id)} from={from} />
                    {p.trial && notInTrial.length > 0 && (
                      /* 安い理由を、買う場所に置く。
                         下の「返ってくるもの」だけ見て買うと、
                         お試しには入っていないものを期待することになる。 */
                      <li className="-mt-1 pb-4 text-[11.5px] leading-[1.7] text-steel">
                        この回だけ、{notInTrial.join("・")}は返りません。
                      </li>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[11.5px] font-bold text-steel">返ってくるもの</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {includes.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                      <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-brand">
                        ✓
                      </span>
                      <span className="min-w-0 text-steel">{x}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11.5px] leading-[1.7] text-steel">
                  税込。月額はありません。自動更新もしません。
                </p>
              </div>
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 家族の中に、1回売りとまとめ買いの両方があること。
  //
  // 片方しか無いと、この並べ方そのものが意味を失う
  // （1行だけの表になる）。
  for (const f of FAMILIES) {
    const list = PLANS.filter((p) => p.family === f.id);
    if (list.length === 0) continue;
    // 絵のある商品を指していること。
    // 1枚だけ絵の無いカードが混ざると、そこだけ手抜きに見える。
    if (!ART[f.id] || !list.some((p) => p.id === ART[f.id])) {
      throw new Error(`「${f.label}」のアイキャッチが、この家族の商品を指していません`);
    }
    if (!list.some((p) => p.uses)) {
      throw new Error(`「${f.label}」にまとめ買いがありません`);
    }
    if (!list.some((p) => !p.uses)) {
      throw new Error(`「${f.label}」に1回だけの買い方がありません`);
    }
    // 同じ家族なら、返ってくるものは同じであること。
    // ここが食い違うと、家族に1つだけ出している説明が嘘になる。
    //
    // お試しだけは外す。中身が軽いのは承知のうえで、
    // 差は行の側に「この回だけ、◯◯は返りません」と出している。
    // 外すかわりに、その差が本当に「引き算」であることを下で確かめる。
    const normalsOf = list.filter((p) => !p.trial);
    const first = JSON.stringify(normalsOf[0].includes);
    for (const p of normalsOf) {
      if (JSON.stringify(p.includes) !== first) {
        throw new Error(
          `「${f.label}」の中で、返ってくるものが商品ごとに違います（${p.id}）。` +
            `違うなら、家族に1つだけ出す書き方をやめてください`,
        );
      }
    }
  }
}
