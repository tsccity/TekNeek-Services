BEGIN;
CREATE OR REPLACE FUNCTION public.quickshop_order(
 p_name text, p_phone text, p_email text, p_method text, p_items jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
 v_order uuid; v_number bigint; v_total bigint := 0;
 v_item record; v_product record; v_count integer := 0;
BEGIN
 IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 1 AND 100
 OR p_phone IS NULL OR length(trim(p_phone)) NOT BETWEEN 3 AND 40
 OR length(coalesce(p_email,'')) > 254
 OR p_method IS NULL OR p_method NOT IN ('venmo','cashapp','square')
 OR p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
 RAISE EXCEPTION 'Invalid order';
 END IF;
 IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 20 THEN
 RAISE EXCEPTION 'Invalid items'; END IF;
 INSERT INTO public.orders(customer_name,customer_phone,customer_email,total_cents,payment_method)
 VALUES(trim(p_name),trim(p_phone),nullif(trim(p_email),''),0,p_method)
 RETURNING id,order_number INTO v_order,v_number;
 FOR v_item IN SELECT variant_id, sum(quantity)::bigint AS quantity
 FROM jsonb_to_recordset(p_items) AS x(variant_id uuid,quantity integer)
 GROUP BY variant_id ORDER BY variant_id LOOP
 IF v_item.variant_id IS NULL OR v_item.quantity IS NULL OR v_item.quantity NOT BETWEEN 1 AND 99 THEN
 RAISE EXCEPTION 'Invalid quantity'; END IF;
 SELECT v.id,v.stock_quantity,p.price_cents INTO v_product
 FROM public.product_variants v JOIN public.products p ON p.id=v.product_id
 WHERE v.id=v_item.variant_id AND v.active=true AND p.active=true
 FOR UPDATE OF v,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Product unavailable'; END IF;
 IF v_product.stock_quantity IS NOT NULL THEN
 IF v_product.stock_quantity < v_item.quantity THEN RAISE EXCEPTION 'Insufficient inventory'; END IF;
 UPDATE public.product_variants SET stock_quantity=stock_quantity-v_item.quantity::integer WHERE id=v_item.variant_id;
 END IF;
 INSERT INTO public.order_items(order_id,variant_id,quantity,unit_price_cents)
 VALUES(v_order,v_item.variant_id,v_item.quantity::integer,v_product.price_cents);
 v_total:=v_total+v_item.quantity*v_product.price_cents;
 v_count:=v_count+v_item.quantity::integer;
 IF v_count>100 THEN RAISE EXCEPTION 'Order exceeds quantity limit'; END IF;
 END LOOP;
 UPDATE public.orders SET total_cents=v_total WHERE id=v_order;
 RETURN jsonb_build_object('order_number',v_number,'total_cents',v_total);
END;
$$;
REVOKE ALL ON FUNCTION public.quickshop_order(text,text,text,text,jsonb) FROM PUBLIC,anon,authenticated;
-- Public execution deliberately withheld until abuse protection and checkout testing.
COMMIT;
SELECT 'QuickShop v1.2 checkout function installed (public access disabled)' AS status;
