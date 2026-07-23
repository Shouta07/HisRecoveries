// LINE ログイン（LINE Login v2.1 / OAuth2）の設定。
// 将来のコミュニケーションは LINE ベースにするため、会員ページ(/member)の
// 認証は LINE ログインを本線にする。チャネル未設定（環境変数が空）の間は、
// 会員ページはデモ（擬似ログイン）で動作し、壊れない。
//
// 本番で有効化するには、LINE Developers で「LINE Login」チャネルを作成し、
// コールバックURL に {SITE}/api/member/line/callback を登録して、
// 次の環境変数を設定する：
//   LINE_LOGIN_CHANNEL_ID
//   LINE_LOGIN_CHANNEL_SECRET

export const lineLogin = {
  channelId: process.env.LINE_LOGIN_CHANNEL_ID ?? "",
  channelSecret: process.env.LINE_LOGIN_CHANNEL_SECRET ?? "",
};

export function lineConfigured(): boolean {
  return Boolean(lineLogin.channelId && lineLogin.channelSecret);
}

export function lineAuthorizeUrl(redirectUri: string, state: string): string {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: lineLogin.channelId,
    redirect_uri: redirectUri,
    state,
    scope: "profile openid",
  });
  return `https://access.line.me/oauth2/v2.1/authorize?${p.toString()}`;
}

export const MEMBER_COOKIE = "hr_member";
export const STATE_COOKIE = "hr_line_state";
