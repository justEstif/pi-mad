/** Shared fixture types. Data only — no imports of the harness here. */

/** One trigger probe: a prompt plus the expected verdict. */
export interface TriggerCase {
  skillId: string;
  prompt: string;
  shouldFire: boolean;
  /** Short human note on what discrimination this case exercises. */
  why: string;
}

/** One baseline-mode case, following skills/skill-evals' eval-format shape. */
export interface BaselineCase {
  id: string;
  input: string;
  rubric: string[];
  statePrefix?: string;
  files?: string[];
}
