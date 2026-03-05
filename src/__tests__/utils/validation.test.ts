import {
  loginSchema,
  registerSchema,
  editProfileSchema,
  commentSchema,
  captionSchema,
} from '@/utils/validation';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'user@example.com',
    username: 'john_doe',
    fullName: 'John Doe',
    password: 'secret123',
  };

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects username shorter than 3 chars', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'ab' }).success).toBe(false);
  });

  it('rejects username longer than 30 chars', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'a'.repeat(31) }).success).toBe(false);
  });

  it('rejects username with special characters', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'john@doe' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, username: 'john doe' }).success).toBe(false);
  });

  it('allows dots and underscores in username', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'john.doe_123' }).success).toBe(true);
  });

  it('rejects empty fullName', () => {
    expect(registerSchema.safeParse({ ...valid, fullName: '' }).success).toBe(false);
  });
});

describe('editProfileSchema', () => {
  it('accepts valid profile data', () => {
    const result = editProfileSchema.safeParse({
      username: 'john_doe',
      fullName: 'John Doe',
      bio: 'Hello world',
      website: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty website', () => {
    const result = editProfileSchema.safeParse({
      username: 'john_doe',
      fullName: 'John Doe',
      website: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects bio longer than 150 chars', () => {
    const result = editProfileSchema.safeParse({
      username: 'john_doe',
      fullName: 'John',
      bio: 'a'.repeat(151),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid website URL', () => {
    const result = editProfileSchema.safeParse({
      username: 'john_doe',
      fullName: 'John',
      website: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('commentSchema', () => {
  it('accepts valid comment', () => {
    expect(commentSchema.safeParse({ content: 'Nice post!' }).success).toBe(true);
  });

  it('rejects empty comment', () => {
    expect(commentSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('rejects comment over 2200 chars', () => {
    expect(commentSchema.safeParse({ content: 'a'.repeat(2201) }).success).toBe(false);
  });
});

describe('captionSchema', () => {
  it('accepts valid caption', () => {
    expect(captionSchema.safeParse({ caption: 'My art #digital' }).success).toBe(true);
  });

  it('accepts empty/missing caption', () => {
    expect(captionSchema.safeParse({}).success).toBe(true);
    expect(captionSchema.safeParse({ caption: '' }).success).toBe(true);
  });

  it('rejects caption over 2200 chars', () => {
    expect(captionSchema.safeParse({ caption: 'a'.repeat(2201) }).success).toBe(false);
  });

  it('rejects location over 100 chars', () => {
    expect(captionSchema.safeParse({ location: 'a'.repeat(101) }).success).toBe(false);
  });
});
