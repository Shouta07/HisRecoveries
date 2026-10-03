# 週次の集計

`weekly.md` は、毎朝の `threads-collect` が**上書き**する（直近7日ぶん）。

日付つきのファイルを増やしていくより、1枚を上書きするほうが
「いまどうなっているか」を見るのが早い。
推移は、このファイルの git の履歴がそのまま持つ。

```
git log -p reports/weekly.md
```

手で出すなら:

```
python -m core.main report mens-body-lab --days 7
python -m core.main report mens-body-lab --days 30 --out reports/monthly.md
```

中身の読み方は `../GROWTH.md` §5 と §7。
**着地率・購入率で型やテーマを止めるのは、母数が溜まってから。**
