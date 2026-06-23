-- SokaSafari Travel — catalog seed (locations, operators, routes).
-- Trips/fares/seats are generated per search date by the app's trip engine
-- (lib/data/trips.ts); for a fully DB-backed deployment, generate trips for a
-- rolling date window via a scheduled edge function using these routes.

insert into locations (code, name, city, country, country_code, type) values
  ('CMN','Mohammed V Intl','Casablanca','Morocco','MA','airport'),
  ('RBA','Rabat-Sale','Rabat','Morocco','MA','airport'),
  ('RAK','Marrakesh Menara','Marrakesh','Morocco','MA','airport'),
  ('TNG','Ibn Battouta','Tangier','Morocco','MA','airport'),
  ('NBO','Jomo Kenyatta Intl','Nairobi','Kenya','KE','airport'),
  ('LOS','Murtala Muhammed','Lagos','Nigeria','NG','airport'),
  ('ACC','Kotoka Intl','Accra','Ghana','GH','airport'),
  ('CAI','Cairo Intl','Cairo','Egypt','EG','airport'),
  ('DKR','Blaise Diagne','Dakar','Senegal','SN','airport'),
  ('ABJ','Felix-Houphouet','Abidjan','Cote dIvoire','CI','airport'),
  ('ADD','Bole Intl','Addis Ababa','Ethiopia','ET','airport'),
  ('JNB','O. R. Tambo','Johannesburg','South Africa','ZA','airport'),
  ('CAS-BT','CTM Casablanca','Casablanca','Morocco','MA','bus_terminal'),
  ('RBA-BT','Gare Routiere Rabat','Rabat','Morocco','MA','bus_terminal'),
  ('RAK-BT','Gare Marrakesh','Marrakesh','Morocco','MA','bus_terminal'),
  ('TNG-BT','Gare Tanger','Tangier','Morocco','MA','bus_terminal'),
  ('FEZ-BT','Gare Fes','Fez','Morocco','MA','bus_terminal'),
  ('NBO-BT','Machakos Country Bus','Nairobi','Kenya','KE','bus_terminal'),
  ('MSA-BT','Mombasa Terminal','Mombasa','Kenya','KE','bus_terminal'),
  ('KSM-BT','Kisumu Terminal','Kisumu','Kenya','KE','bus_terminal'),
  ('KLA-BT','Kampala Coach Park','Kampala','Uganda','UG','bus_terminal')
on conflict (code) do nothing;

insert into operators (code, name, mode, logo_color, rating) values
  ('AT','Royal Air Maroc','flights','#C8102E',4.2),
  ('KQ','Kenya Airways','flights','#C0392B',4.1),
  ('ET','Ethiopian Airlines','flights','#2E7D32',4.4),
  ('MS','EgyptAir','flights','#1565C0',4.0),
  ('SA','South African Airways','flights','#0A4DA2',4.0),
  ('MC','Modern Coast','buses','#16A34A',4.3),
  ('CTM','CTM Morocco','buses','#0EA5E9',4.2),
  ('SUP','Supratours','buses','#F59E0B',4.1),
  ('EAC','Easy Coach','buses','#7C3AED',4.0)
on conflict do nothing;
