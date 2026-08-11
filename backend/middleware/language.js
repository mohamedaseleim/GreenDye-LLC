const supported=['en','ar','fr'];
module.exports=(req,res,next)=>{const requested=String(req.get('accept-language')||'en').split(',')[0].split('-')[0].toLowerCase();req.language=supported.includes(requested)?requested:'en';res.setHeader('Content-Language',req.language);next()};
