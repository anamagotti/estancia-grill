-- Inserir franquias de exemplo
INSERT INTO public.franchises (name, location) VALUES
  ('ESTANCIA GRILL - São José do Rio Preto', 'São José do Rio Preto, SP'),
  ('ESTANCIA GRILL  - Lençóis Paulista', 'Lençóis Paulista, SP'),
  ('ESTANCIA GRILL  - Bauru', 'Bauru, SP')
ON CONFLICT DO NOTHING;
