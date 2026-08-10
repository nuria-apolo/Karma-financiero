-- Keep the published blog index title within a useful search-result length.
update public.seo_pages
set
  title = 'Finanzas en pareja y gastos del hogar | Karma Financiero',
  og_title = 'Finanzas en pareja y gastos del hogar | Karma Financiero'
where path = '/blog'
  and status = 'published'
  and title = 'Blog de finanzas en pareja y del hogar | Karma Financiero';
