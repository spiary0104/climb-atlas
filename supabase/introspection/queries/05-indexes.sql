select coalesce(json_agg(json_build_object('table',tablename,'name',indexname,'definition',indexdef) order by tablename,indexname),'[]'::json) as data from pg_indexes where schemaname='public';
