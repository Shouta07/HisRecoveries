// 進捗の保存 — 匿名のまま、ブラウザの中だけで持つ。
//
// 「匿名で読める」はこのサービスの核なので、進捗のためにログインを
// 要求しない。まず localStorage に閉じ、LINE Login が入った段階で
// サーバへ持ち上げる（そのときは上書きではなくマージする。
// それまでに読んだぶんが消えると、体験が無駄になる）。
//
// targetDate はプランナー（planQuery）と同じ意味で持つ。記事で日付を
// 入れた人に、プランナーで再入力させないため。

const KEY = "hr_progress";

export type TaskState = "done" | "later";

export type Progress = {
  /** 選ばれている目的（occasions の id） */
  goal?: string;
  /** 目的がどう決まったか。計測で「推定の当たり具合」を見るために持つ */
  goalSource?: "url" | "picked" | "inferred";
  /** 読了した記事 slug → ISO日時 */
  read: Record<string, string>;
  /** 実践タスクの状態 */
  tasks: Record<string, TaskState>;
  /** 「その日」。プランナーと共有する */
  targetDate?: string;
};

const EMPTY: Progress = { read: {}, tasks: {} };

export function loadProgress(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Progress>;
    return { ...EMPTY, ...p, read: p.read ?? {}, tasks: p.tasks ?? {} };
  } catch {
    return EMPTY; // プライベートモード等。黙って諦める
  }
}

export function saveProgress(next: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 保存できなくても、閲覧は壊さない */
  }
}

export function markRead(slug: string): Progress {
  const p = loadProgress();
  if (!p.read[slug]) {
    p.read[slug] = new Date().toISOString();
    saveProgress(p);
  }
  return p;
}

export function setTask(slug: string, state: TaskState): Progress {
  const p = loadProgress();
  p.tasks[slug] = state;
  saveProgress(p);
  return p;
}

export function setGoal(goal: string, source: Progress["goalSource"]): Progress {
  const p = loadProgress();
  p.goal = goal;
  p.goalSource = source;
  saveProgress(p);
  return p;
}

/** ロードマップの何本を読み終えたか。 */
export function readCount(p: Progress, slugs: string[]): number {
  return slugs.filter((s) => p.read[s]).length;
}
