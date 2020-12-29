# 遠隔患者モニタリングシステム

## これは何？

自宅療養や宿泊療養中の患者にスマートフォン上で必要項目を入力してもらい、患者の健康状態の把握を保健所で行いやすくするためのシステムです。

背景情報についてぇあ、[BACKGROUND.md](docs/BACKGROUND.md)もご覧ください。

## 手伝ってくださる方へ

本システムは現状ボランティアベースでの開発となっており、コントリビューターを募集しております。

Issues に手伝って欲しいタスクを記載していますのでご確認ください。
お手伝いいただける方は、必ず[CONTRIBUTING.md](docs/CONTRIBUTING.md)をご一読いただけますようよろしくおねがいします。

また、ボランティアベースで本番環境の運用を行うことは難しいため、ある程度まで開発が進んだ段階からは、運営能力のある法人が自治体等からの委託事業としてシステムの保守/運用を行う事を想定していますのでご了承ください。

## システム概要

![システム概要図](docs/images/system-overview.png)

※本システムは赤字で囲んだ部分が対象

詳細については、[システム仕様](docs/SPECIFICATION.md)をご覧ください。

本リポジトリは、全体的なIssue管理及び、API サーバの開発のためのリポジトリとなります。

保健師用ダッシュボード については、[remote-patient-monitoring-dashboard](https://github.com/codeforjapan/remote-patient-monitoring-dashboard)を、
患者用クライアント については、[remote-patient-monitoring-client](https://github.com/codeforjapan/remote-patient-monitoring-client)をご覧ください。


## これまでの歩み

| 日付 | 内容 |
| --- | --- |
| 2020/12/30  | ユースケース及びワイヤーフレームが8割方完成。開発に着手。リポジトリを3つに分ける |
| 2020/12/26  | 本リポジトリを作成 |
| 2020/12/23  | 奥村先生とボランティアチームのミーティングを実施、ざっくりとしたシステム要件が固まる |
| 2020/12/14  | 奥村先生の呼びかけに応じ、調査を開始 |


## ライセンス

MIT ライセンスです。

## CONTRIBUTORS

[docs/CONTRIBUTORS.md](docs/CONTRIBUTORS.md)をご確認ください。
