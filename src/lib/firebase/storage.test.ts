/**
 * Tests for the Storage wrapper. Validates:
 *  - getStorage() singleton
 *  - uploadFile(path, blob) returns a public URL
 *  - deleteFile(path) resolves
 *  - penPhotoPath / inkPhotoPath / avatarPath builders
 */
import { getStorage, uploadFile, deleteFile, penPhotoPath, inkPhotoPath, avatarPath } from './storage';

describe('getStorage', () => {
  it('returns a Firebase Storage instance', () => {
    const s = getStorage();
    expect(s).toBeDefined();
  });

  it('returns the same instance on repeated calls (singleton)', () => {
    expect(getStorage()).toBe(getStorage());
  });
});

describe('uploadFile', () => {
  it('returns a public URL after upload', async () => {
    const url = await uploadFile('avatars/uid/file.png', new Blob(['x']));
    expect(typeof url).toBe('string');
    expect(url).toMatch(/^https?:\/\//);
  });
});

describe('deleteFile', () => {
  it('resolves without throwing', async () => {
    await expect(deleteFile('avatars/uid/file.png')).resolves.toBeUndefined();
  });
});

describe('path builders', () => {
  it('penPhotoPath builds avatars/pens/{uid}/{penId}/{fileName}', () => {
    expect(penPhotoPath('u1', 'p1', 'photo.jpg')).toBe('photos/pens/u1/p1/photo.jpg');
  });

  it('inkPhotoPath builds photos/inks/{uid}/{inkId}/{fileName}', () => {
    expect(inkPhotoPath('u1', 'i1', 'photo.jpg')).toBe('photos/inks/u1/i1/photo.jpg');
  });

  it('avatarPath builds avatars/{uid}/{fileName}', () => {
    expect(avatarPath('u1', 'me.png')).toBe('avatars/u1/me.png');
  });
});
