# Character Emotions — Todo

เป้าหมาย: ให้ avatar ของ agent แต่ละตัวเปลี่ยนรูปอารมณ์อัตโนมัติตาม agent state + exitCode + idle duration พร้อม cross-fade transition

ทุก task ในไฟล์นี้ออกแบบให้ **อิสระต่อกัน** โดยใช้ "Shared Contracts" ด้านล่างเป็นสัญญาที่ทุกคนยึดร่วมกัน หากใครเริ่มก่อน อีกฝั่งสามารถ stub/mock ตาม contract ได้ทันที

---

## Shared Contracts (lock ก่อน — ทุก task อ้างอิงจากนี้)

### Types (`packages/core/src/domain/character.ts`)
```ts
export type CharacterEmotion =
  | "idle" | "thinking" | "listening"
  | "happy" | "excited" | "victory" | "love"
  | "surprised" | "angry" | "crying"
  | "sleepy" | "snack" | "done";

export type IdleTier = "fresh" | "lingering" | "deep";

export type CharacterEmotionContext = {
  agentState?: AgentState;
  lifecycleState?: TerminalLifecycleState;
  agentRuntimeState?: AgentRuntimeState;
  exitCode?: number;
  idleTier: IdleTier;
};

export type CharacterEmotionEntry = {
  available: readonly CharacterEmotion[];
  defaultEmotion: CharacterEmotion;
  imageFile: Readonly<Record<CharacterEmotion, string | undefined>>;
};

export const CHARACTER_EMOTION_CATALOG: Readonly<Record<string, CharacterEmotionEntry>>;
export const resolveCharacterEmotion: (characterId: string | undefined, ctx: CharacterEmotionContext) => CharacterEmotion;
export const resolveCharacterEmotionImagePath: (characterId: string | undefined, emotion: CharacterEmotion) => string;
```

### Image filenames (รูปที่มีจริงใน `apps/web/public/characters/<id>/`)
| character | available emotions (filenames)                                                                                |
|-----------|---------------------------------------------------------------------------------------------------------------|
| aki       | 01-thinking, 02-happy, 03-excited, 04-angry, 05-crying, 06-done, 07-sleepy, 08-snack, 09-listening            |
| mika      | 01-idle, 02-victory, 03-crying, 04-thinking, 05-happy, 06-angry, 07-sleepy, 08-excited, 09-surprised          |
| ren       | 01-happy, 02-thinking, 03-angry, 04-crying, 05-love, 06-idle, 07-sleepy, 08-excited, 09-surprised             |
| yui       | 01-happy, 02-thinking, 03-angry, 04-crying, 05-love, 06-idle, 07-sleepy, 08-excited, 09-surprised             |

### State → emotion mapping (ใช้อันนี้ทั้ง implementer และ tester)
| Logical state                      | aki        | mika      | ren       | yui       |
|------------------------------------|------------|-----------|-----------|-----------|
| `agentRuntimeState=processing` / `state=live` | thinking   | thinking  | thinking  | thinking  |
| `agentRuntimeState=waiting_for_permission`    | listening  | surprised | surprised | surprised |
| `agentRuntimeState=waiting_for_user`          | listening  | thinking  | thinking  | thinking  |
| `state=blocked`                    | angry      | angry     | angry     | angry     |
| `state=queued`                     | listening  | idle      | idle      | idle      |
| `state=stopped`                    | sleepy     | sleepy    | sleepy    | sleepy    |
| `state=exited` & `exitCode===0`    | done       | victory   | happy     | happy     |
| `state=exited` & `exitCode!==0`    | crying     | crying    | crying    | crying    |
| `state=stale`                      | sleepy     | sleepy    | sleepy    | sleepy    |
| `state=idle` & `idleTier=fresh`    | listening  | idle      | idle      | idle      |
| `state=idle` & `idleTier=lingering`| sleepy     | sleepy    | sleepy    | sleepy    |
| `state=idle` & `idleTier=deep`     | snack      | sleepy    | love      | love      |

Priority order ใน resolver: `lifecycleState=exited/stopped/stale` ก่อน → `agentRuntimeState` → `agentState` → `idleTier`

### IdleTier thresholds (web hook)
- elapsed `< 30s` → `fresh`
- `30s ≤ elapsed < 90s` → `lingering`
- `≥ 90s` → `deep`

### Image path pattern
`/characters/<characterId>/<filename>.jpg` (fallback `DEFAULT_CHARACTER_AVATAR_PATH`)

### Class names ที่ B + C ใช้ร่วมกัน
- wrapper: `character-avatar__image-stack`
- เลเยอร์: `character-avatar__layer`, `character-avatar__layer--active`, `character-avatar__layer--prev`
- transition: `opacity 250ms ease`

---

## Independent Tasks (ทุกข้อข้างล่างหยิบขึ้นมาทำได้เลย ไม่ต้องรอข้ออื่น)

### T1. นิยาม `CharacterEmotion` + catalog ใน core
- ไฟล์: `packages/core/src/domain/character.ts`
- เพิ่ม types ตาม Shared Contracts (CharacterEmotion, IdleTier, CharacterEmotionContext, CharacterEmotionEntry)
- เพิ่ม `CHARACTER_EMOTION_CATALOG` ครอบคลุม 4 ตัวละครตามตาราง "Image filenames"
- export ทั้งหมดผ่าน `packages/core/src/index.ts`
- ไม่ต้องแตะ resolver function (T2)

### T2. implement `resolveCharacterEmotion` (pure)
- ไฟล์: `packages/core/src/domain/character.ts`
- ทำตาม "State → emotion mapping" ตรงๆ ตาม priority order
- Fallback: ถ้าผลลัพธ์ไม่อยู่ใน `available` ของตัวละครนั้น → ใช้ `defaultEmotion`
- ถ้า `characterId` undefined / ไม่อยู่ใน catalog → คืน `"idle"`
- หยิบทำขนานกับ T1 ได้ (ถ้า T1 ยังไม่ merge ก็ stub catalog ตามตารางได้)

### T3. implement `resolveCharacterEmotionImagePath`
- ไฟล์: `packages/core/src/domain/character.ts`
- คืน `/characters/<id>/<filename>.jpg`
- Fallback ไป `DEFAULT_CHARACTER_AVATAR_PATH` เมื่อ characterId/emotion ไม่ map
- หยิบทำขนานกับ T1/T2 ได้

### T4. Unit tests ของ resolver (4 ตัวละคร × ทุก state)
- ไฟล์: `packages/core/__tests__/character.test.ts` (หรือชื่อตาม convention package)
- cover ทุกแถวในตาราง "State → emotion mapping" × 4 ตัวละคร
- cover exitCode 0 vs 1, idleTier 3 levels, fallback case (characterId ไม่รู้จัก)
- เขียนคู่ขนานกับ T2 ได้ (test เขียนตาม Shared Contracts)

### T5. เพิ่ม prop `emotion` + cross-fade markup ใน CharacterAvatar
- ไฟล์: `apps/web/src/components/character/CharacterAvatar.tsx`
- เพิ่ม prop `emotion?: CharacterEmotion`
- ถ้ามี `emotion`: resolve รูปด้วย `resolveCharacterEmotionImagePath(characterId, emotion)`; ถ้าไม่มี: ใช้ logic เดิม (`resolveCharacterAvatarPath`)
- render `<span class="character-avatar__image-stack">` ภายในที่มี 2 `<img class="character-avatar__layer">` (active + prev)
- ใช้ `useState`/`useEffect` track emotion ที่เปลี่ยน → กำหนด `--active` / `--prev` ตามจังหวะ
- คง error fallback `onError` ทั้งสองเลเยอร์
- รองรับทั้ง path ปกติ และ `mm-sync-avatar` (วาง stack ภายใน core ทั้งสองกรณี)
- อัปเดต `aria-label` ให้รวม emotion ตอน prop ถูกส่งเข้ามา
- ทำได้ทันทีโดยไม่รอ T1–T4 (import type จาก `@octogent/core` — ถ้ายังไม่ merge ก็ inline literal ชั่วคราว)

### T6. Cross-fade CSS
- ไฟล์: เพิ่มหรือต่อใน `apps/web/src/styles/` (หาตำแหน่งของ `.character-avatar` ปัจจุบันก่อน — น่าจะอยู่ใน `styles/character.css` หรือใกล้เคียง)
- styles ตาม Shared Contracts (class names + transition 250ms)
- `position: absolute` ในเลเยอร์, wrapper เป็น `position: relative` + `display: block`
- ไม่กระทบ size sm/md/lg เดิม (เลเยอร์ inherit `width/height: 100%` ของ wrapper)
- ทำได้ทันทีโดยไม่รอ T5 (ทั้งคู่ยึด class name จาก contract)

### T7. สร้าง `useCharacterEmotion` hook
- ไฟล์ใหม่: `apps/web/src/components/character/useCharacterEmotion.ts`
- signature: `useCharacterEmotion(snapshot: TerminalSnapshot, options?: { now?: () => number; thresholds?: { lingeringMs: number; deepMs: number } }): CharacterEmotion`
- คำนวณ `idleTier` จาก `Date.now() - (snapshot.lifecycleUpdatedAt ?? snapshot.startedAt ?? snapshot.createdAt)` เมื่อ `state === "idle"`
- ใช้ `setInterval(10_000)` แค่ตอน state เป็น idle เพื่อ re-evaluate (cleanup ใน useEffect)
- เรียก `resolveCharacterEmotion(snapshot.characterId, ctx)` ส่งคืน
- ทำได้ทันทีโดยไม่รอ task อื่น (import contract จาก core)

### T8. Wire `Terminal.tsx`
- ไฟล์: `apps/web/src/components/Terminal.tsx`
- ที่ `<CharacterAvatar … />` ปัจจุบัน → ใช้ `useCharacterEmotion(snapshot)` แล้วส่ง `emotion` prop เข้าไป
- ไม่แตะ logic อื่น
- ทำได้ทันที ถ้า T5+T7 ยังไม่ merge ใช้ stub emotion='idle' ชั่วคราว

### T9. Wire `canvas/SessionNode.tsx`
- ไฟล์: `apps/web/src/components/canvas/SessionNode.tsx`
- เหมือน T8 (อยู่ใน `<foreignObject>` — ใส่ hook ที่ component นี้ได้ตามปกติ)
- ทำได้ทันที

### T10. Wire `canvas/CanvasTerminalColumn.tsx`
- ไฟล์: `apps/web/src/components/canvas/CanvasTerminalColumn.tsx`
- เหมือน T8
- ทำได้ทันที

### T11. Wire `character/CharacterPicker.tsx`
- ไฟล์: `apps/web/src/components/character/CharacterPicker.tsx`
- ส่ง `emotion={CHARACTER_EMOTION_CATALOG[template.characterId].defaultEmotion}` (ไม่ใช้ hook — ไม่มี snapshot)
- ทำได้ทันที

### T12. Verification — `pnpm lint` ผ่าน
### T13. Verification — `pnpm test` ผ่าน (รวม T4)
### T14. Verification — `pnpm build` ผ่าน
### T15. Manual QA — `pnpm dev` แล้วเช็ค

- dispatch agent → thinking ขณะ run → done/victory/happy เมื่อ exit success
- บังคับ error exit → crying
- ปล่อย idle 30s → sleepy; 90s → snack/love/sleepy (ตามตัวละคร)
- blocked / waiting state → ตรง mapping
- CharacterPicker แสดง default emotion ของแต่ละตัวละคร ไม่กระตุก
- ตรวจ cross-fade ที่ size sm / md / lg

---

## หมายเหตุการขนาน
- T1–T11 ทุกตัว "เริ่มได้ทันที" เพราะ Shared Contracts ด้านบนล็อกทุกอย่างที่ต้องรู้ ระหว่างที่ดำเนินงาน แต่ละ task เพียง import จาก contract; ถ้ายังไม่ merge ก็ stub type/literal ตามตารางไปก่อน
- T12–T15 ต้องรอ T1–T11 รวมเข้าสาขาเดียวก่อน
