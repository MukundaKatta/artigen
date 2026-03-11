import {
  loginSchema,
  registerSchema,
  passwordSchema,
  editProfileSchema,
  commentSchema,
  captionSchema,
  generateImageSchema,
  createListingSchema,
  createCommunitySchema,
  messageSchema,
  reportSchema,
} from '@/utils/validation';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'Secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Secret123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'user@example.com',
    username: 'john_doe',
    fullName: 'John Doe',
    password: 'Secret123',
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

  it('rejects password without uppercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'secret123' }).success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'SECRET123' }).success).toBe(false);
  });

  it('rejects password without number', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'SecretPass' }).success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Sec1' }).success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('accepts strong password', () => {
    expect(passwordSchema.safeParse('MyPass123').success).toBe(true);
  });

  it('rejects all lowercase', () => {
    expect(passwordSchema.safeParse('password123').success).toBe(false);
  });

  it('rejects no digits', () => {
    expect(passwordSchema.safeParse('SecretPass').success).toBe(false);
  });

  it('rejects too short', () => {
    expect(passwordSchema.safeParse('Ab1').success).toBe(false);
  });

  it('rejects over 128 chars', () => {
    expect(passwordSchema.safeParse('Aa1' + 'x'.repeat(126)).success).toBe(false);
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

describe('generateImageSchema', () => {
  const valid = { prompt: 'A beautiful sunset', modelId: 'flux-schnell' };

  it('accepts valid generation params', () => {
    expect(generateImageSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects short prompt', () => {
    expect(generateImageSchema.safeParse({ ...valid, prompt: 'ab' }).success).toBe(false);
  });

  it('rejects prompt over 2000 chars', () => {
    expect(generateImageSchema.safeParse({ ...valid, prompt: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('rejects missing modelId', () => {
    expect(generateImageSchema.safeParse({ prompt: 'test' }).success).toBe(false);
  });

  it('accepts optional dimensions', () => {
    expect(generateImageSchema.safeParse({ ...valid, width: 1024, height: 1024 }).success).toBe(true);
  });

  it('rejects dimensions out of range', () => {
    expect(generateImageSchema.safeParse({ ...valid, width: 100 }).success).toBe(false);
    expect(generateImageSchema.safeParse({ ...valid, width: 5000 }).success).toBe(false);
  });
});

describe('createListingSchema', () => {
  const valid = { title: 'My Artwork', priceInCents: 500 };

  it('accepts valid listing', () => {
    expect(createListingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects price below $1', () => {
    expect(createListingSchema.safeParse({ ...valid, priceInCents: 50 }).success).toBe(false);
  });

  it('rejects price above $10,000', () => {
    expect(createListingSchema.safeParse({ ...valid, priceInCents: 1_000_001 }).success).toBe(false);
  });

  it('rejects short title', () => {
    expect(createListingSchema.safeParse({ ...valid, title: 'ab' }).success).toBe(false);
  });
});

describe('createCommunitySchema', () => {
  it('accepts valid community', () => {
    expect(createCommunitySchema.safeParse({ name: 'AI Art Lovers' }).success).toBe(true);
  });

  it('rejects short name', () => {
    expect(createCommunitySchema.safeParse({ name: 'ab' }).success).toBe(false);
  });
});

describe('messageSchema', () => {
  it('accepts valid message', () => {
    expect(messageSchema.safeParse({ content: 'Hello!' }).success).toBe(true);
  });

  it('rejects empty message', () => {
    expect(messageSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('rejects message over 5000 chars', () => {
    expect(messageSchema.safeParse({ content: 'a'.repeat(5001) }).success).toBe(false);
  });
});

describe('reportSchema', () => {
  it('accepts valid report', () => {
    expect(reportSchema.safeParse({ reason: 'spam' }).success).toBe(true);
  });

  it('rejects invalid reason', () => {
    expect(reportSchema.safeParse({ reason: 'invalid_reason' }).success).toBe(false);
  });

  it('accepts optional description', () => {
    expect(
      reportSchema.safeParse({ reason: 'harassment', description: 'Details here' }).success,
    ).toBe(true);
  });
});
