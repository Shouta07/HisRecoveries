---
# ── 商品/サービス テンプレート ─────────────────────
# このファイル（_ で始まる）は公開されません。コピーして使ってください。
#
# 公開条件: status を "published" にし、links のいずれかに
# アフィリエイトリンクを 1 つ以上入れること。リンクが空だと
# 公開されません（リンク切れ防止）。

title: "商品・サービス名"
slug: "product-slug"           # URL 用の半角英数（ファイル名と揃える）
territory: "sweat-odor"        # 関連する地形図の slug:
                               #   sweat-odor / skin-acne / face-impression /
                               #   mind-awareness / hair-loss / beard-body-hair

kind: "product"                # "product"（物販）or "service"（クリニック/サロン/定期便）
productType: "種別ラベル"       # 「制汗剤」「医療脱毛」「AGAオンライン診療」など

# ↓ service のときに使う（product では省略可）
provider: ""                   # 提供元（クリニック名・ブランド名）
highlights:                    # 特徴の箇条書き（service で効く）
  # - "オンライン診療に対応"
  # - "初回カウンセリング無料"
ctaLabel: ""                   # service の CTA 文言（既定:「詳しく見る」）
                               #   例:「無料カウンセリングを見る」

excerpt: "何のための道具/サービスか、1〜2 文で。"
note: "正直な一言メモ（合わなかった点・注意点など）。任意。"
priceLabel: ""                 # 「参考価格 ¥1,500」「カウンセリング無料」など自由
order: 1                       # 並び順（小さいほど上）
status: "draft"                # 公開時に "published" に変更

# 登録済みの ASP のリンクだけ入れる（未登録は空のままでOK）
# クリニック等のサービスは、ASP のリンクを links.asp に入れるのが基本。
links:
  amazon: ""                   # Amazon アソシエイト
  rakuten: ""                  # 楽天アフィリエイト
  asp: ""                      # A8 / もしも / クリニックのASPリンク
---

ここに本文（任意）。使ってみた実感、合う人・合わない人、
整える上での位置づけなどを、正直に。
