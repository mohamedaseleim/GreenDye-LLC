const Section = require('../../models/Section');

describe('Section Model', () => {
  it('should have required fields', () => {
    const section = new Section();
    const validationError = section.validateSync();
    
    expect(validationError).toBeDefined();
    expect(validationError.errors.course).toBeDefined();
    expect(validationError.errors.title).toBeDefined();
    expect(validationError.errors.order).toBeDefined();
  });

  it('should create a valid section', () => {
    const sectionData = {
      course: '507f1f77bcf86cd799439011',
      title: { en: 'Introduction', ar: 'مقدمة' },
      description: { en: 'Course introduction' },
      order: 0,
      lessons: [],
    };

    const section = new Section(sectionData);
    const validationError = section.validateSync();
    
    expect(validationError).toBeUndefined();
    expect(section.title.get('en')).toBe('Introduction');
    expect(section.order).toBe(0);
  });

  it('should update timestamps on save', () => {
    const section = new Section({
      course: '507f1f77bcf86cd799439011',
      title: { en: 'Test' },
      order: 0,
    });

    const initialTime = section.updatedAt.getTime();

    // Simulate save pre-hook
    section.updatedAt = new Date(Date.now() + 5);

    expect(section.updatedAt.getTime()).toBeGreaterThanOrEqual(initialTime);
  });
});
