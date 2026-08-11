# RTL support v6.1

The frontend now derives direction from the selected language code. Arabic uses RTL, while English and French use LTR. The direction utility is also ready for Persian, Hebrew, Urdu, Pashto, Sindhi, Uyghur, Yiddish, Dhivehi, and Kurdish if any of those languages are enabled later.

RTL implementation includes:

- HTML and body `dir` updates.
- Direction-aware Material UI themes.
- Emotion cache with `stylis-plugin-rtl` for automatic CSS property mirroring.
- RTL-aware dialogs, menus, popovers, text fields, inputs, and Toastify notifications.
- LTR cache restoration when switching back to English or French.
- Persisted language and direction after page refresh.

English remains the default and fallback language.
