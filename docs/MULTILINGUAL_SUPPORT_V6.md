# Multilingual support v6

Supported interface languages are English (`en`), Arabic (`ar`), and French (`fr`). English is the default and fallback language. The language selector persists the user selection in local storage, sets the HTML `lang` and `dir` attributes, switches Arabic to RTL, and sends `Accept-Language` to the API. Dynamic CMS and consulting-service content use language objects with English fallback. User and consultation-request preferred-language fields accept `en`, `ar`, and `fr` and default to `en`.

Production defaults:

```env
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_SUPPORTED_LANGUAGES=en,ar,fr
```

Content editors should publish `en`, `ar`, and `fr` values for page titles, page content, service names, service descriptions, announcements, and email content. English is mandatory as the fallback value.
