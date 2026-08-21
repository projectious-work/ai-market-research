# Theme integration notes

The site consumes [`brand-theme-hugo-vanilla` v0.3.3](https://github.com/projectious-work/brand-theme-hugo-vanilla/tree/v0.3.3). Its native templates own the document shell, navigation, version menu/banner, favicon links, bundled fonts, CSS, and JavaScript. The consumer layer leaves those templates intact.

The integration gaps below were reported upstream in
[`brand-theme-hugo-vanilla#52`](https://github.com/projectious-work/brand-theme-hugo-vanilla/issues/52).

One small consumer shortcode remains because the site publishes generated
release metadata that cannot be authored as ordinary Markdown:

| Consumer file | Workaround | Intended native construct | Reason and impact | Evidence / suggested upstream feature |
| --- | --- | --- | --- | --- |
| `layouts/shortcodes/releases-table.html` | Iterate `data/releases.json` and emit a `.tablewrap` table. | A data-driven table shortcode or collection loop in content. | The release list is generated from Git tags at build time, so its rows cannot be authored as ordinary Markdown. The output intentionally matches the theme's native table wrapper and accessibility attributes. | v0.3.3 `render-table.html` supplies `.tablewrap` for Markdown tables but cannot iterate arbitrary site data. A data-table shortcode/API would remove the custom loop. |
| `hugo.yaml` `security.exec.allow` | Add `^tailwindcss$` to Hugo's executable allowlist while retaining its defaults. | Installation documentation or module configuration that makes the required Tailwind executable policy explicit. | Hugo 0.165 refuses the theme's `css.TailwindCSS` transform under the default security policy. The narrow allowlist entry enables only the documented build executable. | A clean v0.3.3 consumer build fails with `tailwindcss is not whitelisted in policy security.exec.allow`; the upstream getting-started and README installation snippets do not include the required policy. |
| `layouts/dashboard/*.html` and `layouts/_partials/dashboard-sidebar.html` | Define a consumer dashboard content type and sidebar using the theme's published `.example-app` classes and `icon.html` partial. | A reusable, data-driven application/dashboard shell with configurable navigation groups. | v0.3.3 keeps the dashboard shell and its navigation in example-specific layouts and partials, so a real consumer cannot select or configure it through front matter or site data. The override contains no custom CSS, but duplicates the structural markup. | Promote the example app shell to a public layout/partial and accept menu or data configuration, active-page state, brand label, and status content. |

The old Docsy layouts, navbar/version overrides, favicon override, Google-font
hook, Docsy SCSS files, and legacy report-fragment integrations were removed.
Dashboard pages use a small structural override only because the upstream
application shell is currently example-specific; their styling, icons, cards,
diagram, document shell, and scripts remain theme-owned.
