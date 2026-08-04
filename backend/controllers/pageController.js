const Page = require('../models/Page');
const mongoSanitize = require('mongo-sanitize');

// @desc    Get all published pages for navigation
// @route   GET /api/pages
// @access  Public
exports.getPublishedPages = async (req, res, next) => {
  try {
    const { location } = mongoSanitize(req.query);
    
    const query = { 
      status: 'published',
      isActive: true
    };
    
    // Filter by location (header/footer) if specified
    if (location === 'header') {
      query.showInHeader = true;
    } else if (location === 'footer') {
      query.showInFooter = true;
    }

    const pages = await Page.find(query)
      .select('slug title menuOrder showInHeader showInFooter')
      .sort({ menuOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public page by slug
// @route   GET /api/pages/:slug
// @access  Public
exports.getPublicPage = async (req, res, next) => {
  try {
    const slug = mongoSanitize(req.params.slug);
    
    const page = await Page.findOne({ 
      slug: slug, 
      status: 'published',
      isActive: true
    }).select('-__v -author -lastEditedBy -version -createdAt -updatedAt');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    next(error);
  }
};
