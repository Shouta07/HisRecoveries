"""
Validator - コンテンツ検証エージェント
投稿前にNG表現・文字数・品質をチェックする。

既定値は旧事業（当事者の独白）向けに厳しく作られている。
言葉の線引きと厳格度は accounts/<id>/persona.json が持ち、
`persona["validation"]` と `persona["character"]["ng_words"]` で
アカウントごとに上書きする（タシカメは連投なので緩和側）。
"""

import logging
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# NG word lists (Quiet Grooming forbidden vocabulary)
# ---------------------------------------------------------------------------

# デート・マチアプ系
#
# ここは前の事業（男性ウェルネス）のときの一覧。
# 恋愛・デートの話をしないアカウントだったので、全部禁止していた。
#
# いまの事業は、送る前の文面を女性に読んでもらうサービス。
# 恋愛・デート・マッチングアプリは主題そのもので、禁止すると何も書けない。
# 実際、この一覧のせいで「デート」を含む投稿が全部落ちていた。
#
# 言葉の線引きは、アカウントごとに persona.json の ng_words が持つ。
# そちらには「脈あり」「モテる」「落とす」「攻略」などが入っている。
# ここは空にして、アカウント側に任せる。
_NG_DATING: list[str] = []

# ---------------------------------------------------------------------------
# 異性全体の代弁（恋亀の NEVER と同じ線）
# ---------------------------------------------------------------------------
# src/lib/koi/prompt.ts の NEVER にこうある:
#   「女性は」「男性は」のように、異性全体をひとまとめにした言い方。
#   言えるのは「わたしはそう感じる」「そう感じる人もいる」まで。
#
# 言葉そのものを NG にはできない。「女性はどう受け取る？」は聞いているだけで、
# むしろ出したい形（GROWTH.md §1）。落としたいのは言い切るほうだけ。
#
# だから「〜は」のあとに断定が続く形だけを見る。
# 取りこぼしは出るが、誤検出で生成が丸ごと止まるほうが高くつく。
# 最後の砦は承認ゲート（人）であって、ここではない。
def _without_quotes(text: str) -> str:
    """「」の中を外した本文を返す。

    恋亀は人の文面を引用する。それは恋亀が言ったことではない。

      プロフィールの一行目。
      ①「はじめまして！よろしくお願いします」
      ②いきなり趣味の話

    これを自己紹介と取ると、引用を含む投稿が全部落ちる（実際に落ちた）。
    言い回しを見る検査は、引用を外してから当てる。
    """
    return re.sub(r"「[^」]*」", "", text)


# 自己紹介・名乗り。
#
# 誰もフォローしていないアカウントの自己紹介は、誰も読まれない
# （accounts/<id>/OPENING.md）。恋亀は名乗らず、いきなり本題から入る。
# AIに「Threadsの投稿を書いて」と言うと、放っておくとここに寄る。
_SELF_INTRO_PATTERNS = [
    r"^(はじめまして|初めまして)",
    r"(です|といいます|と申します)[。、]?\s*$",
    r"(よろしくお願い|よろしくです)",
    r"(喋って|話して|発信して|投稿して)(いき|い)?ます",
    r"^.{0,20}(アカウント|垢)です",
]

_SPEAK_FOR_PATTERNS = [
    # 女性は〜と思っています / 男性はこう感じている
    r"(女性|男性|女子|男子|女|男)は[^。！？\n]{0,20}?(と)?(思って|感じて|考えて|見て)(います|いる|ます|る)",
    # 女性は〜なものです / 男性は〜なんです
    r"(女性|男性|女子|男子)は[^。！？\n]{0,20}?(なもの|なんです|のもの)",
    # 女性側の本音は / 男性の心理は
    r"(女性|男性)側?の(本音|心理|気持ち|考え)(は|って)",
]


# りょうた語彙
_NG_RYOUTA = ["マジで", "実は", "正直", "俺"]

# 断定・主張が強い表現
_NG_ASSERTIVE = ["圧倒的に", "絶対", "すべき", "間違いなく"]

# 完了・克服表現（進行中であることが重要）
_NG_COMPLETION = [
    "克服しました", "治りました", "完治", "治った", "克服した",
]

# 完全否定表現（Nagi v2: 半歩先であり、完全に消えてはいない）
_NG_COMPLETE_DENIAL = [
    "もう揺れない", "二度と", "完全に克服", "別人になった",
]

# 布教・啓蒙表現
_NG_EVANGELISM = ["あなたも変われる", "誰でもできる", "あなたも", "僕にできたから", "簡単に"]

# 商業・宣伝表現
_NG_COMMERCIAL = ["おすすめです", "ぜひ", "詳しくはこちら"]

# カジュアル・バズ語彙（Nagi v2 禁止）
_NG_CASUAL_BUZZ = ["ぶっちゃけ", "ガチで", "神", "最強"]

# リアクション誘導表現（内密な読者: 反応を求めない）
_NG_REACTION_SOLICITATION = [
    "いいねして", "シェアして", "コメントで教えて", "フォロー必須", "拡散して",
]

# ──────────────────────────────────────────────────────────────
# 旧事業の一覧は、アカウントが選んで使う
# ──────────────────────────────────────────────────────────────
# 上の一覧は、前のペルソナ（Nagi / りょうた）のために作られたもの。
# それが**アカウントに関係なく全投稿に効いていた**。
#
# 恋亀にとっては、これが実害になる。
#   「マジで」「正直」「ぶっちゃけ」「ガチで」
# は、恋亀がいちばん使うはずの語で、前のペルソナが使いすぎたから
# 禁止されただけのもの。落ちた投稿は黙って作り直されるので、
# 口調が平板になっていることに気づけない。
#
# `_NG_DATING` は「アカウント側に任せる」と空にしてあったのに、
# 他の一覧は手が付いていなかった。同じ扱いにする。
#
# persona["validation"]["legacy_ng_sets"] に名前を並べたぶんだけ効く。
# 書かなければ全部効く（今までと同じ）。
_NG_SETS: dict[str, list[str]] = {
    "dating": _NG_DATING,
    "ryouta": _NG_RYOUTA,                       # マジで / 実は / 正直 / 俺
    "assertive": _NG_ASSERTIVE,                 # 圧倒的に / 絶対 / すべき
    "completion": _NG_COMPLETION,               # 克服しました / 完治
    "complete_denial": _NG_COMPLETE_DENIAL,     # 二度と / 別人になった
    "evangelism": _NG_EVANGELISM,               # あなたも変われる / 簡単に
    "commercial": _NG_COMMERCIAL,               # おすすめです / ぜひ
    "casual_buzz": _NG_CASUAL_BUZZ,             # ぶっちゃけ / ガチで / 神
    "reaction_solicitation": _NG_REACTION_SOLICITATION,  # いいねして / 拡散して
}


def _legacy_ng_words(persona: dict) -> list[str]:
    """このアカウントに効かせる、旧事業の禁止語。"""
    names = persona.get("validation", {}).get("legacy_ng_sets")
    if names is None:
        return _ALL_NG_WORDS          # 指定が無ければ今までどおり全部
    out: list[str] = []
    for n in names:
        if n not in _NG_SETS:
            logger.warning("validation.legacy_ng_sets に知らない名前: %s", n)
            continue
        out.extend(_NG_SETS[n])
    return out


# 全NGワードを統合（指定が無いアカウントの既定値）
_ALL_NG_WORDS: list[str] = (
    _NG_DATING
    + _NG_RYOUTA
    + _NG_ASSERTIVE
    + _NG_COMPLETION
    + _NG_COMPLETE_DENIAL
    + _NG_EVANGELISM
    + _NG_COMMERCIAL
    + _NG_CASUAL_BUZZ
    + _NG_REACTION_SOLICITATION
)

# ---------------------------------------------------------------------------
# 推奨ワード（少なくとも1つ含むべき）
# ---------------------------------------------------------------------------

_RECOMMENDED_WORDS = [
    "気づいた", "思った", "だった", "整える", "向き合う",
    "続けている", "静かに", "観察", "記録",
    "超えた", "変わった", "整った", "戻ってきた",
]

# ---------------------------------------------------------------------------
# トピックキーワード（許可されたテーマ）
# ---------------------------------------------------------------------------

# アカウントが persona.json に allowed_topics を持っていればそちらが優先。
# ここは持っていないアカウント用の既定値（旧事業＝男性ウェルネスの語彙）。
# 事業の語彙をコードに固定すると、アカウントを入れ替えても前の事業の
# 言葉しか通らなくなるので、既定値としてだけ残している。
_ALLOWED_TOPICS = [
    "多汗症", "ニキビ", "ワキガ", "顔の自信",
    "清潔感", "匂い", "体臭", "汗", "肌", "脇",
    "鏡", "スキンケア", "整える", "皮膚科",
    "疲", "自信", "美容", "身だしなみ", "自意識",
    "印象", "信頼", "緊張", "習慣", "朝",
    "におい", "跡", "薄", "髪", "毛", "髭", "顔", "写真", "手入れ",
    "気にする", "気になる", "見た目", "洗っ", "剃る", "毛包",
]

# ---------------------------------------------------------------------------
# 完了言語パターン（独立チェック用）
# ---------------------------------------------------------------------------

_COMPLETION_PATTERNS = ["治った", "克服した", "完治した", "治りました"]

# ---------------------------------------------------------------------------
# 3段階構造の自意識コネクター（Nagi v2: 必須）
# ---------------------------------------------------------------------------

_SELF_AWARENESS_CONNECTORS = ["ただ、", "でも、", "まだ ", "覚えて", "忘れて"]

# ---------------------------------------------------------------------------
# 教示型パターン（警告対象）
# ---------------------------------------------------------------------------

_TEACHING_PATTERNS = [
    r"[０-９0-9]+つの方法",
    r"[０-９0-9]+ステップ",
    r"[０-９0-9]+選",
]

# ---------------------------------------------------------------------------
# メタ情報漏洩パターン
# ---------------------------------------------------------------------------

_META_LEAK_PATTERNS = [
    r"（ネタ元[:：]",
    r"\(ネタ元[:：]",
    r"（参考[:：]",
    r"\(参考[:：]",
    r"（出典[:：]",
    r"\(出典[:：]",
    r"（元ネタ[:：]",
    r"\(元ネタ[:：]",
    r"【ネタ元】",
    r"【参考】",
    r"【元ネタ】",
    r"※この投稿は",
    r"この記事は.*を参考に",
]

# ---------------------------------------------------------------------------
# 薬機法 + 医療広告ガイドライン リスクワード
# ---------------------------------------------------------------------------

_LEGAL_RISK_WORDS = [
    # 薬機法
    "確実に", "100%", "必ず治る", "絶対に治る",
    "誰でも簡単に", "ノーリスク",
    "今だけ無料", "残りわずか",
    # 医療広告ガイドライン
    "最先端治療", "日本一", "最高の治療",
    "芸能人も通う", "口コミNo.1",
    "before after", "ビフォーアフター",
    "患者様の声", "体験談※",
    "〇〇専門医が推薦",
]

# ---------------------------------------------------------------------------
# プライバシーチェック用パターン
# ---------------------------------------------------------------------------

_PRIVACY_PATTERNS = [
    # クリニック名パターン
    r"[ぁ-ん゠-ヿa-zA-Zａ-ｚＡ-Ｚ]+クリニック",
    r"[ぁ-ん゠-ヿa-zA-Zａ-ｚＡ-Ｚ]+病院",
    r"[ぁ-ん゠-ヿa-zA-Zａ-ｚＡ-Ｚ]+皮膚科",
    # 医師名パターン
    r"[一-龥]{1,4}先生",
    r"[一-龥]{1,4}医師",
    r"[一-龥]{1,4}ドクター",
    # 地名（区レベルより具体的）
    r"[一-龥ぁ-ん]{1,6}[0-9０-９]+丁目",
    r"[一-龥ぁ-ん]{2,6}通り[0-9０-９]*番地",
]

# ---------------------------------------------------------------------------
# 最近の投稿を保持するバッファ（類似度チェック用）
# ---------------------------------------------------------------------------

_recent_posts: list[str] = []
_SIMILARITY_WINDOW = 30
_SIMILARITY_THRESHOLD = 0.5


def _check_similarity(text: str) -> str | None:
    """直近の投稿との類似度をチェックする。"""
    for i, prev in enumerate(_recent_posts[-_SIMILARITY_WINDOW:]):
        ratio = SequenceMatcher(None, text, prev).ratio()
        if ratio >= _SIMILARITY_THRESHOLD:
            return (
                f"類似投稿を検出: 直近{i + 1}件前の投稿と"
                f"{ratio:.0%}の類似度（閾値{_SIMILARITY_THRESHOLD:.0%}）"
            )
    return None


def _record_post(text: str) -> None:
    """投稿を履歴バッファに追加する。"""
    _recent_posts.append(text)
    # ウィンドウサイズを超えたら古いものを削除
    while len(_recent_posts) > _SIMILARITY_WINDOW:
        _recent_posts.pop(0)


def validate_post(
    text: str,
    persona: dict,
    strict: bool = True,
) -> tuple[bool, list[str]]:
    """
    投稿テキストを総合検証する（Nagi/Quiet Grooming版）。
    Returns: (is_valid, list of error messages)
    """
    errors: list[str] = []
    warnings: list[str] = []

    # ------------------------------------------------------------------
    # バリデーション・プロファイル（アカウント別に厳格度を調整）
    # 既定値はNagi(当事者メディア)の厳格ルールを維持し、後方互換を保つ。
    # giftトラックなどはpersona["validation"]で個別に緩和する。
    # ------------------------------------------------------------------
    vcfg = persona.get("validation", {})
    require_first_person = vcfg.get("require_first_person_boku", True)
    max_emoji = vcfg.get("max_emoji", 0)
    max_hashtags = vcfg.get("max_hashtags", 0)
    require_recommended = vcfg.get("require_recommended_words", True)
    require_topics = vcfg.get("require_allowed_topics", True)
    require_three_stage = vcfg.get("require_three_stage", True)
    check_similarity = vcfg.get("check_similarity", True)

    # ------------------------------------------------------------------
    # 1. 文字数チェック（200-450文字）
    # ------------------------------------------------------------------
    min_chars = persona.get("posting", {}).get("min_chars", 30)
    max_chars = persona.get("posting", {}).get("max_chars", 450)
    char_count = len(text)

    if char_count < min_chars:
        errors.append(f"文字数不足: {char_count}/{min_chars}文字以上必要")
    if char_count > max_chars:
        errors.append(f"文字数超過: {char_count}/{max_chars}")

    # ------------------------------------------------------------------
    # 2. 一人称チェック（「僕」必須、禁止: 俺, 自分は, 私は）
    # ------------------------------------------------------------------
    if require_first_person:
        forbidden_first_persons = ["俺", "自分は", "私は"]
        for fp in forbidden_first_persons:
            if fp in text:
                errors.append(
                    f"一人称不一致: 「{fp.rstrip('は')}」が使われています"
                    "（Nagiの一人称は「僕」）"
                )

    # ------------------------------------------------------------------
    # 3. 絵文字チェック（ゼロトレランス）
    # ------------------------------------------------------------------
    emoji_count = sum(
        1 for c in text
        if unicodedata.category(c) in ("So",)  # Symbol, Other
    )
    if emoji_count > max_emoji:
        errors.append(
            f"絵文字超過: {emoji_count}個検出（上限{max_emoji}個）"
        )

    # ------------------------------------------------------------------
    # 4. ハッシュタグチェック（ゼロトレランス）
    # ------------------------------------------------------------------
    hashtags = re.findall(r"#\S+", text)
    if len(hashtags) > max_hashtags:
        errors.append(
            f"ハッシュタグ超過: {len(hashtags)}個検出（上限{max_hashtags}個）"
        )

    # ------------------------------------------------------------------
    # 5. NGワードチェック（Quiet Grooming禁止語彙）
    # ------------------------------------------------------------------
    legacy = _legacy_ng_words(persona)
    for word in legacy:
        if word in text:
            errors.append(f"NG表現を検出: 「{word}」")

    # persona 側に追加NGワードがあれば併せてチェック
    extra_ng = persona.get("character", {}).get("ng_words", [])
    for word in extra_ng:
        if word not in legacy and word in text:
            errors.append(f"NG表現を検出: 「{word}」")

    # 自己紹介（validation.forbid_self_intro が true のときだけ）。
    if vcfg.get("forbid_self_intro", False):
        own_words = _without_quotes(text)
        for pat in _SELF_INTRO_PATTERNS:
            m = re.search(pat, own_words, re.MULTILINE)
            if m:
                errors.append(
                    f"自己紹介になっています: 「{m.group(0).strip()}」"
                    "（名乗らない。いきなり本題から入る）"
                )
                break

    # 異性全体の代弁（validation.forbid_speaking_for が true のときだけ）。
    # 聞くのは通す。言い切るのだけ落とす。
    if vcfg.get("forbid_speaking_for", False):
        own_words = _without_quotes(text)
        for pat in _SPEAK_FOR_PATTERNS:
            m = re.search(pat, own_words)
            if m:
                errors.append(
                    f"異性全体を代弁しています: 「{m.group(0)}」"
                    "（聞くのは可。言い切るのは不可）"
                )

    # ------------------------------------------------------------------
    # 6. 推奨ワードチェック（少なくとも1つ含むこと。短文100字以下は免除）
    # ------------------------------------------------------------------
    if require_recommended and char_count > 100 and not any(w in text for w in _RECOMMENDED_WORDS):
        errors.append(
            "推奨ワード不足: 以下のいずれかを含めてください: "
            + "、".join(f"「{w}」" for w in _RECOMMENDED_WORDS)
        )

    # ------------------------------------------------------------------
    # 7. トピックチェック（許可テーマに関連すること）
    # ------------------------------------------------------------------
    topics = [
        str(t).strip() for t in (persona.get("allowed_topics") or []) if str(t).strip()
    ] or _ALLOWED_TOPICS
    if require_topics and not any(topic in text for topic in topics):
        errors.append(
            "トピック不一致: 許可されたテーマに関連するキーワードが"
            "見つかりません（"
            + "、".join(topics)
            + "）"
        )

    # ------------------------------------------------------------------
    # 8. メタ情報漏洩チェック
    # ------------------------------------------------------------------
    for pat in _META_LEAK_PATTERNS:
        if re.search(pat, text):
            errors.append(
                "メタ情報漏洩: 内部情報がそのまま本文に含まれています"
                f"（パターン: {pat}）"
            )

    # ------------------------------------------------------------------
    # 9. 完了言語チェック（治療中であることが重要）
    # ------------------------------------------------------------------
    for phrase in _COMPLETION_PATTERNS:
        if phrase in text:
            errors.append(
                f"完了表現を検出: 「{phrase}」— Nagiは治療・改善の"
                "過程にいるため完了表現は使えません"
            )

    # ------------------------------------------------------------------
    # 10. 二人称チェック（「あなた」使用は警告）
    # ------------------------------------------------------------------
    if "あなた" in text:
        warnings.append(
            "二人称注意: 「あなた」が使われています。"
            "Nagiは読者に直接語りかけません"
        )

    # ------------------------------------------------------------------
    # 11. プライバシーチェック（具体的地名・クリニック名・医師名）
    # ------------------------------------------------------------------
    for pat in _PRIVACY_PATTERNS:
        match = re.search(pat, text)
        if match:
            errors.append(
                f"プライバシー違反: 具体的な固有名詞を検出"
                f"「{match.group()}」— 区レベルより詳細な地名、"
                "クリニック名、医師名は使用禁止です"
            )

    # ------------------------------------------------------------------
    # 12. 類似投稿チェック（閾値0.5、直近30件）
    # ------------------------------------------------------------------
    if check_similarity:
        sim_error = _check_similarity(text)
        if sim_error:
            errors.append(sim_error)

    # ------------------------------------------------------------------
    # 13. 法的リスクチェック（薬機法 + 医療広告ガイドライン）
    # ------------------------------------------------------------------
    for word in _LEGAL_RISK_WORDS:
        if word in text:
            errors.append(f"法的リスク表現: 「{word}」")

    # ------------------------------------------------------------------
    # 14. 3段階構造チェック（Nagi v2: 自意識コネクター必須。短文100字以下は免除）
    # ------------------------------------------------------------------
    if require_three_stage and char_count > 100 and not any(conn in text for conn in _SELF_AWARENESS_CONNECTORS):
        errors.append(
            "3段階構造不足: 自意識の残り方を示すコネクターが見つかりません。"
            "以下のいずれかを含めてください: "
            + "、".join(f"「{c}」" for c in _SELF_AWARENESS_CONNECTORS)
        )

    # ------------------------------------------------------------------
    # 15. リアクション誘導チェック（内密な読者: 反応を求めない）
    # ------------------------------------------------------------------
    for phrase in _NG_REACTION_SOLICITATION:
        if phrase in text:
            errors.append(
                f"リアクション誘導を検出: 「{phrase}」— "
                "Nagiは読者に反応を求めません"
            )

    # ------------------------------------------------------------------
    # 16. 完全否定チェック（Nagi v2: 半歩先であり完全克服ではない）
    # ------------------------------------------------------------------
    for phrase in _NG_COMPLETE_DENIAL:
        if phrase in text:
            errors.append(
                f"完全否定表現を検出: 「{phrase}」— "
                "Nagiは「半歩先」にいるだけで、完全に消えてはいない"
            )

    # ------------------------------------------------------------------
    # 17. 教示型チェック（警告: リスト記事風の表現）
    # ------------------------------------------------------------------
    for pat in _TEACHING_PATTERNS:
        match = re.search(pat, text)
        if match:
            warnings.append(
                f"教示型パターンを検出: 「{match.group()}」— "
                "Nagiはアドバイザーではなく当事者として語ります"
            )

    # ------------------------------------------------------------------
    # 結果集計
    # ------------------------------------------------------------------
    # 警告はログに出すがバリデーション失敗にはしない
    for w in warnings:
        logger.warning("Validation warning: %s", w)

    is_valid = len(errors) == 0
    if not is_valid:
        for e in errors:
            logger.warning("Validation: %s", e)

    # バリデーション成功なら履歴に記録
    if is_valid:
        _record_post(text)

    # 警告もエラーリストに含めて返す（呼び出し側が区別できるよう prefix 付き）
    all_messages = errors + [f"[WARNING] {w}" for w in warnings]

    return is_valid, all_messages


def sanitize_post(text: str, persona: dict) -> str:
    """検証で問題があった場合に自動修正を試みる（Nagi/Quiet Grooming版）"""

    # ------------------------------------------------------------------
    # メタ情報漏洩の自動除去
    # ------------------------------------------------------------------
    text = re.sub(r"\n*（ネタ元[:：][^）]*）", "", text)
    text = re.sub(r"\n*\(ネタ元[:：][^)]*\)", "", text)
    text = re.sub(r"\n*（参考[:：][^）]*）", "", text)
    text = re.sub(r"\n*\(参考[:：][^)]*\)", "", text)
    text = re.sub(r"\n*（出典[:：][^）]*）", "", text)
    text = re.sub(r"\n*（元ネタ[:：][^）]*）", "", text)
    text = re.sub(r"\n*【ネタ元】[^\n]*", "", text)
    text = re.sub(r"\n*【参考】[^\n]*", "", text)
    text = re.sub(r"\n*【元ネタ】[^\n]*", "", text)
    text = text.strip()

    # ------------------------------------------------------------------
    # 絵文字の自動除去
    # ------------------------------------------------------------------
    text = "".join(
        c for c in text
        if unicodedata.category(c) not in ("So",)
    )

    # ------------------------------------------------------------------
    # ハッシュタグの自動除去
    # ------------------------------------------------------------------
    text = re.sub(r"\s*#\S+", "", text).strip()

    # ------------------------------------------------------------------
    # 禁止一人称の置換（俺 → 僕）
    # ------------------------------------------------------------------
    text = text.replace("俺", "僕")

    # ------------------------------------------------------------------
    # 「あなた」の除去（文脈依存のため単純削除ではなく警告ログ）
    # ------------------------------------------------------------------
    if "あなた" in text:
        logger.warning("sanitize_post: 「あなた」を含む投稿です。手動修正を推奨します")

    # ------------------------------------------------------------------
    # 文字数調整（200-450文字の範囲に収める）
    # ------------------------------------------------------------------
    min_chars = persona.get("posting", {}).get("min_chars", 30)
    max_chars = persona.get("posting", {}).get("max_chars", 450)

    if len(text) > max_chars:
        # 末尾を切り詰め（句点 or 読点で区切る）
        truncated = text[:max_chars]
        # 最後の句点・読点の位置を探す
        last_period = max(
            truncated.rfind("。"),
            truncated.rfind("、"),
            truncated.rfind("\n"),
        )
        if last_period > min_chars:
            text = truncated[:last_period + 1]
        else:
            text = truncated.rstrip() + "…"

    return text
