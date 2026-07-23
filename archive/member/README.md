# アーカイブ：会員ページ（/member）

2026-07 に、公開サイトから **一時撤去** した。削除ではなくアーカイブ。いつでも戻せる。

## なぜ外したか（意思決定の記録）

- 体験・コミュニケーションは **LINE ベース** で組む方針。会員体験は LINE 側に置く。
- 公開サイト上の作り込んだ会員ダッシュボード（RPG的ゲーミフィケーション／チャート／
  道のり）は、**「男性がシンプルに求めている価値」とズレていた**。まず価値を単純化し、
  男性のニーズに合わせてから作り直したい。
- よって、いまは公開サイトに置かず、思想が固まるまで寝かせる。

## 何を外したか（このフォルダの中身）

`src/` の構造をそのまま保存している。復元は下記の逆操作。

| アーカイブ内 | 元の場所 |
|---|---|
| `app/member/page.tsx` | `src/app/member/page.tsx`（ルート `/member`） |
| `app/api/member/line/login/route.ts` | `src/app/api/member/line/login/route.ts` |
| `app/api/member/line/callback/route.ts` | `src/app/api/member/line/callback/route.ts` |
| `app/api/member/line/logout/route.ts` | `src/app/api/member/line/logout/route.ts` |
| `components/MemberApp.tsx` | `src/components/MemberApp.tsx`（ゲーミフィケーションUI本体） |
| `components/MemberGate.tsx` | `src/components/MemberGate.tsx`（LIFF/セッションのゲート） |
| `lib/hrb.ts` | `src/lib/hrb.ts`（会員配信データ：マーカー・スコア・ランク・Feed） |
| `lib/line.ts` | `src/lib/line.ts`（LINE ログイン設定・擬似ログイン） |

- 依存は自己完結：外したファイル群は互いにしか参照していない（撤去時点で確認済み）。
- `tsconfig.json` の `exclude` に `archive` を追加してあるため、ここは型チェック・
  ビルド対象外。ルートにもならない。

## 復元手順

1. 8ファイルを上表の「元の場所」へ戻す（`git mv archive/member/... src/...`）。
2. 会員ページへの導線を戻す：`src/app/page.tsx` のフッターに
   `<Link href="/member">会員ページ（β）</Link>` を再追加。
3. `next build` で確認。LINE を実接続するなら env（`LINE_*` / `NEXT_PUBLIC_LIFF_ID`）を設定。

## 撤去時に触った箇所（サイト側）

- `src/app/page.tsx`：フッターの「会員ページ（β）」リンクを削除。
- `tsconfig.json`：`exclude` に `archive` を追加。
- 注：`src/lib/checkReport.ts` に残る `…/membership` は別パス（このルートとは無関係）。
