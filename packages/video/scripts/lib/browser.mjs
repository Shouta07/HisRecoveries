// playwright-core を、プリインストール済み Chromium で起動する共通ヘルパー。
// ブラウザのダウンロードはしない（PW_CHROME で実行ファイルを指定）。
import { chromium } from "playwright-core";

const CHROME =
  process.env.PW_CHROME ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

export async function withPage(viewport, fn) {
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({
      viewport,
      deviceScaleFactor: 2, // Retina 相当（書き出しをくっきり）
    });
    return await fn(page);
  } finally {
    await browser.close();
  }
}
