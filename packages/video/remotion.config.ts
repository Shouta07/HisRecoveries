// Remotion 設定（レンダリング品質・出力）。Next.js の設定とは独立。
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
