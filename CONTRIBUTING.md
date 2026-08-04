# Contributing to GreenDye Academy

Thank you for your interest in contributing to GreenDye Academy! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/mohamedaseleim/GreenDye/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, etc.)

### Suggesting Features

1. Check existing [Issues](https://github.com/mohamedaseleim/GreenDye/issues) and [Pull Requests](https://github.com/mohamedaseleim/GreenDye/pulls)
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Any related examples

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/GreenDye.git
   cd GreenDye
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Wait for review

## 📋 Code Style Guidelines

### JavaScript/Node.js

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use async/await over callbacks
- Add JSDoc comments for functions
- Follow existing code formatting

Example:
```javascript
/**
 * Create a new course
 * @param {Object} courseData - Course information
 * @returns {Promise<Object>} Created course
 */
const createCourse = async (courseData) => {
  try {
    const course = await Course.create(courseData);
    return course;
  } catch (error) {
    throw error;
  }
};
```

### React

- Use functional components with hooks
- Use meaningful component names
- Keep components small and focused
- Use PropTypes or TypeScript
- Extract reusable logic into custom hooks

Example:
```javascript
import React, { useState, useEffect } from 'react';

const CourseCard = ({ course }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Component logic
  }, []);

  return (
    <div className="course-card">
      {/* Component JSX */}
    </div>
  );
};

export default CourseCard;
```

### CSS

- Use meaningful class names
- Follow BEM naming convention if possible
- Keep styles scoped to components
- Use CSS variables for theming

## 🧪 Testing Guidelines

### Backend Tests

```javascript
describe('Course API', () => {
  it('should create a new course', async () => {
    const response = await request(app)
      .post('/api/courses')
      .send(courseData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Tests

```javascript
import { render, screen } from '@testing-library/react';
import CourseCard from './CourseCard';

test('renders course title', () => {
  render(<CourseCard course={mockCourse} />);
  const titleElement = screen.getByText(/course title/i);
  expect(titleElement).toBeInTheDocument();
});
```

## 📝 Documentation

- Update README.md if adding features
- Add JSDoc comments to functions
- Update API.md for API changes
- Add examples for new features
- Keep documentation in sync with code

## 🌍 Internationalization

When adding new text:

1. Add to translation files:
   ```javascript
   // frontend/src/i18n.js
   en: {
     translation: {
       newKey: 'English text'
     }
   },
   ar: {
     translation: {
       newKey: 'النص العربي'
     }
   },
   fr: {
     translation: {
       newKey: 'Texte français'
     }
   }
   ```

2. Use in components:
   ```javascript
   import { useTranslation } from 'react-i18next';
   
   const { t } = useTranslation();
   return <h1>{t('newKey')}</h1>;
   ```

## 🗄️ Database Changes

When modifying database models:

1. Update the model file
2. Test with sample data
3. Document changes in PR
4. Consider migration impact
5. Update related controllers

## 🔐 Security

- Never commit sensitive data
- Use environment variables for secrets
- Validate all user input
- Sanitize data before database operations
- Follow OWASP guidelines
- Report security issues privately

## 📱 Mobile/PWA

When contributing to mobile features:

- Test on multiple devices
- Ensure responsive design
- Test offline functionality
- Verify PWA features
- Test on iOS and Android

## 🎨 UI/UX

- Follow Material-UI guidelines
- Maintain consistent design
- Ensure accessibility (WCAG)
- Support RTL for Arabic
- Test with different languages
- Responsive design is mandatory

## 🚀 Performance

- Optimize images and assets
- Minimize bundle size
- Use lazy loading where appropriate
- Avoid unnecessary re-renders
- Profile before optimization
- Test on slow networks

## 📦 Dependencies

- Keep dependencies up to date
- Check for security vulnerabilities
- Avoid unnecessary dependencies
- Document why new dependencies are added
- Use exact versions in production

## ⚡ Workflow

1. Check for existing issues
2. Discuss major changes first
3. Create feature branch
4. Make changes
5. Write tests
6. Update documentation
7. Submit PR
8. Respond to feedback
9. Merge when approved

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 💬 Communication

- Be respectful and constructive
- Use clear, concise language
- Provide context and examples
- Be patient with review process
- Ask questions if unclear

## 📜 License

By contributing, you agree that your contributions will be licensed under the project's ISC License.

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the project

## 📞 Contact

- GitHub Issues: [Create an issue](https://github.com/mohamedaseleim/GreenDye/issues)
- Email: contribute@greendye-academy.com

## ✅ PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Commits follow convention
- [ ] No merge conflicts
- [ ] Branch is up to date
- [ ] Screenshots for UI changes
- [ ] Breaking changes documented

## 🎯 Priority Areas

We especially welcome contributions in:

1. **Testing** - Increase test coverage
2. **Documentation** - Improve guides and examples
3. **Internationalization** - Add more languages
4. **Accessibility** - Improve a11y
5. **Mobile App** - React Native development
6. **Performance** - Optimization improvements
7. **Features** - From the roadmap
8. **Bug Fixes** - Address existing issues

## 🌟 Code of Conduct

- Be welcoming and inclusive
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## 🎓 Learning Resources

New to contributing? Check these resources:

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Documentation](https://docs.mongodb.com/)

Thank you for contributing to GreenDye Academy! 🚀
