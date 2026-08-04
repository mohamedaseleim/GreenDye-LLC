// Course utility functions and constants

export const COURSE_CATEGORIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'health', label: 'Health' },
  { value: 'language', label: 'Language' },
  { value: 'arts', label: 'Arts' },
  { value: 'science', label: 'Science' },
  { value: 'other', label: 'Other' }
];

export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all', label: 'All Levels' }
];

export const APPROVAL_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

/**
 * Extracts the course title in the preferred language
 * @param {Object} course - Course object with title map
 * @param {string} preferredLang - Preferred language code (default: 'en')
 * @returns {string} Course title or 'Untitled Course'
 */
export const getCourseTitle = (course, preferredLang = 'en') => {
  if (!course || !course.title) return 'Untitled Course';
  
  // Try preferred language first
  if (course.title[preferredLang]) return course.title[preferredLang];
  
  // Fallback to other languages
  return course.title.en || course.title.ar || course.title.fr || 'Untitled Course';
};

/**
 * Extracts the course description in the preferred language
 * @param {Object} course - Course object with description map
 * @param {string} preferredLang - Preferred language code (default: 'en')
 * @returns {string} Course description or empty string
 */
export const getCourseDescription = (course, preferredLang = 'en') => {
  if (!course || !course.description) return '';
  
  // Try preferred language first
  if (course.description[preferredLang]) return course.description[preferredLang];
  
  // Fallback to other languages
  return course.description.en || course.description.ar || course.description.fr || '';
};

/**
 * Gets the color for approval status chip
 * @param {string} status - Approval status
 * @returns {string} MUI color
 */
export const getApprovalStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'draft':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Formats course price with currency
 * @param {Object} course - Course object
 * @returns {string} Formatted price or 'Free'
 */
export const formatCoursePrice = (course) => {
  if (!course || course.price <= 0) return 'Free';
  
  return `${course.currency || 'USD'} ${course.price}`;
};

/**
 * Calculates the discounted price
 * @param {number} price - Original price
 * @param {Object} discount - Discount object
 * @returns {number} Discounted price
 */
export const calculateDiscountedPrice = (price, discount) => {
  if (!discount || !discount.isActive || !discount.percentage) return price;
  
  const discountAmount = (price * discount.percentage) / 100;
  return price - discountAmount;
};
