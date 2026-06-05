/**
 * Regression test for firestore.rules. The Firebase emulator would
 * catch this at runtime, but a static test gives us a tighter
 * feedback loop in CI.
 *
 * Rules:
 *   - All reads require auth.
 *   - All writes require auth.
 *   - A user can read/write only their own users/{uid}/** subtrees
 *     (pens, inks, sessions, nibSwaps, user profile).
 *   - No one can read or write any other user's data.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rules = readFileSync(join(__dirname, 'firestore.rules'), 'utf8');

describe('firestore.rules', () => {
  it('exists', () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it('denies unauthenticated reads by default', () => {
    expect(rules).toMatch(/match\s+\/\{document=\*\*\}\s*\{[\s\S]*allow\s+read,\s+write:\s+if\s+false/);
  });

  it('allows auth users to read their own users/{uid}/* subtree', () => {
    // match /users/{uid}/{document=**} { allow read, write: if request.auth != null && request.auth.uid == uid; }
    expect(rules).toMatch(
      /match\s+\/users\/\{uid\}\/\{document=\*\*\}[\s\S]*allow\s+read,\s+write:\s+if\s+request\.auth\s*!=\s*null\s*&&\s*request\.auth\.uid\s*==\s*uid/,
    );
  });

  it('locks down the top-level users/{uid} doc to its owner', () => {
    expect(rules).toMatch(
      /match\s+\/users\/\{uid\}[\s\S]*allow\s+read,\s+write:\s+if\s+request\.auth\s*!=\s*null\s*&&\s*request\.auth\.uid\s*==\s*uid/,
    );
  });

  it('does NOT allow wildcard admin access (no "allow read, write: if true")', () => {
    // Trim out comments before scanning so a comment that says
    // "allow read, write: if true" doesn't fail the test.
    const code = rules.replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/allow\s+read,\s*write:\s*if\s+true/);
  });
});
