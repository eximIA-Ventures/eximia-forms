-- ======================================================================
-- eximIA Forms — Analytics RPC
-- ======================================================================

create or replace function increment_form_analytics(
  p_form_id uuid,
  p_date date,
  p_field text
)
returns void as $$
begin
  insert into form_analytics (form_id, date)
  values (p_form_id, p_date)
  on conflict (form_id, date) do nothing;

  if p_field = 'views' then
    update form_analytics set views = views + 1
    where form_id = p_form_id and date = p_date;
  elsif p_field = 'starts' then
    update form_analytics set starts = starts + 1
    where form_id = p_form_id and date = p_date;
  elsif p_field = 'completions' then
    update form_analytics set completions = completions + 1
    where form_id = p_form_id and date = p_date;
  end if;
end;
$$ language plpgsql security definer;
