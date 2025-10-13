-- =========================================
-- PROJETO DATE - QUERIES ÚTEIS E EXEMPLOS
-- =========================================

-- =========================================
-- BUSCAR LUGARES PRÓXIMOS COM FILTROS
-- =========================================

-- Query principal para buscar lugares próximos com filtros
CREATE OR REPLACE FUNCTION search_places_nearby(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_meters INTEGER DEFAULT 5000,
    budget_filter VARCHAR(10) DEFAULT NULL,
    type_filter VARCHAR(50) DEFAULT NULL,
    period_filter VARCHAR(10) DEFAULT NULL,
    limit_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_meters DECIMAL,
    rating DECIMAL,
    price_level INTEGER,
    types TEXT[],
    main_photo VARCHAR,
    business_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.address,
        p.latitude,
        p.longitude,
        calculate_distance(user_lat, user_lng, p.latitude, p.longitude) as distance_meters,
        p.rating,
        p.price_level,
        array_agg(DISTINCT pt.code) as types,
        (array_agg(DISTINCT pp.photo_reference) FILTER (WHERE pp.is_main = true))[1] as main_photo,
        p.business_status
    FROM places p
    LEFT JOIN place_categories pc ON p.id = pc.place_id
    LEFT JOIN place_types pt ON pc.type_id = pt.id
    LEFT JOIN place_photos pp ON p.id = pp.place_id
    WHERE
        p.business_status = 'OPERATIONAL'
        AND calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= radius_meters
        AND (budget_filter IS NULL OR
             (budget_filter = '$' AND p.price_level = 1) OR
             (budget_filter = '$$' AND p.price_level = 2) OR
             (budget_filter = '$$$' AND p.price_level IN (3, 4)))
        AND (type_filter IS NULL OR pt.code = type_filter)
    GROUP BY p.id
    HAVING
        -- Filtro de período (se informado)
        CASE
            WHEN period_filter = 'dia' THEN
                EXISTS (
                    SELECT 1 FROM place_opening_hours poh
                    WHERE poh.place_id = p.id
                    AND poh.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)::INTEGER
                    AND poh.is_open = true
                    AND poh.open_time <= CURRENT_TIME
                    AND poh.close_time >= CURRENT_TIME
                )
            WHEN period_filter = 'noite' THEN
                EXISTS (
                    SELECT 1 FROM place_opening_hours poh
                    WHERE poh.place_id = p.id
                    AND poh.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)::INTEGER
                    AND poh.is_open = true
                    AND (
                        (poh.open_time >= '18:00:00' AND poh.open_time <= '23:59:59') OR
                        (poh.close_time >= '18:00:00' AND poh.close_time <= '23:59:59')
                    )
                )
            ELSE true
        END
    ORDER BY calculate_distance(user_lat, user_lng, p.latitude, p.longitude)
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- INSERIR/ATUALIZAR LUGAR DO GOOGLE PLACES
-- =========================================

CREATE OR REPLACE FUNCTION upsert_place_from_google(
    google_id VARCHAR,
    place_name VARCHAR,
    place_description TEXT DEFAULT NULL,
    place_address TEXT,
    lat DECIMAL,
    lng DECIMAL,
    phone VARCHAR DEFAULT NULL,
    website VARCHAR DEFAULT NULL,
    map_url TEXT DEFAULT NULL,
    image_url TEXT DEFAULT NULL,
    place_rating DECIMAL DEFAULT 0,
    price_level INTEGER DEFAULT NULL,
    user_ratings_total INTEGER DEFAULT 0,
    business_status VARCHAR DEFAULT 'OPERATIONAL',
    place_types TEXT[] DEFAULT NULL,
    opening_hours_data JSONB DEFAULT NULL,
    photos_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    place_id UUID;
    type_id UUID;
    photo_ref TEXT;
    day_data JSONB;
    photo_data JSONB;
BEGIN
    -- Inserir ou atualizar lugar
    INSERT INTO places (
        google_place_id, name, description, address, latitude, longitude,
        phone, website, map_url, image_url, rating, price_level,
        user_ratings_total, business_status
    ) VALUES (
        google_id, place_name, place_description, place_address, lat, lng,
        phone, website, map_url, image_url, place_rating, price_level,
        user_ratings_total, business_status
    )
    ON CONFLICT (google_place_id)
    DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        address = EXCLUDED.address,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        phone = EXCLUDED.phone,
        website = EXCLUDED.website,
        map_url = EXCLUDED.map_url,
        image_url = EXCLUDED.image_url,
        rating = EXCLUDED.rating,
        price_level = EXCLUDED.price_level,
        user_ratings_total = EXCLUDED.user_ratings_total,
        business_status = EXCLUDED.business_status,
        updated_at = NOW()
    RETURNING id INTO place_id;

    -- Inserir tipos
    IF place_types IS NOT NULL THEN
        -- Remover tipos antigos
        DELETE FROM place_categories WHERE place_id = place_id;

        -- Inserir novos tipos
        FOREACH type_code IN ARRAY place_types LOOP
            SELECT id INTO type_id FROM place_types WHERE code = type_code;
            IF type_id IS NOT NULL THEN
                INSERT INTO place_categories (place_id, type_id, is_primary)
                VALUES (place_id, type_id, type_code = place_types[1]);
            END IF;
        END LOOP;
    END IF;

    -- Inserir horários de funcionamento
    IF opening_hours_data IS NOT NULL THEN
        DELETE FROM place_opening_hours WHERE place_id = place_id;

        FOR i IN 0..6 LOOP
            day_data := opening_hours_data->i;
            IF day_data IS NOT NULL THEN
                INSERT INTO place_opening_hours (
                    place_id, day_of_week, open_time, close_time, is_open
                ) VALUES (
                    place_id,
                    i,
                    (day_data->>'open')::TIME,
                    (day_data->>'close')::TIME,
                    (day_data->>'is_open')::BOOLEAN
                );
            END IF;
        END LOOP;
    END IF;

    -- Inserir fotos
    IF photos_data IS NOT NULL THEN
        DELETE FROM place_photos WHERE place_id = place_id;

        FOR photo_data IN SELECT * FROM jsonb_array_elements(photos_data) LOOP
            INSERT INTO place_photos (
                place_id,
                photo_reference,
                width,
                height,
                html_attributions,
                is_main
            ) VALUES (
                place_id,
                photo_data->>'photo_reference',
                (photo_data->>'width')::INTEGER,
                (photo_data->>'height')::INTEGER,
                ARRAY(SELECT jsonb_array_elements_text(photo_data->'html_attributions')),
                (photo_data->>'is_main')::BOOLEAN
            );
        END LOOP;
    END IF;

    RETURN place_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- BUSCAR LUGARES FAVORITOS DO USUÁRIO
-- =========================================

CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    address TEXT,
    rating DECIMAL,
    image_url TEXT,
    types TEXT[],
    favorited_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.address,
        p.rating,
        p.image_url,
        array_agg(DISTINCT pt.name) as types,
        uf.created_at as favorited_at
    FROM user_favorites uf
    JOIN places p ON uf.place_id = p.id
    LEFT JOIN place_categories pc ON p.id = pc.place_id
    LEFT JOIN place_types pt ON pc.type_id = pt.id
    WHERE uf.user_id = user_uuid
    GROUP BY p.id, uf.created_at
    ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- ATUALIZAR PREFERÊNCIAS DO USUÁRIO
-- =========================================

CREATE OR REPLACE FUNCTION update_user_preferences(
    user_uuid UUID,
    budget_pref VARCHAR(10) DEFAULT NULL,
    preferred_types_array TEXT[] DEFAULT NULL,
    preferred_period_pref VARCHAR(10) DEFAULT NULL,
    location_lat DECIMAL DEFAULT NULL,
    location_lng DECIMAL DEFAULT NULL,
    location_radius INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_preferences (
        user_id, budget_preference, preferred_types, preferred_period,
        location_lat, location_lng, location_radius
    ) VALUES (
        user_uuid, budget_pref, preferred_types_array, preferred_period_pref,
        location_lat, location_lng, location_radius
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        budget_preference = COALESCE(budget_pref, user_preferences.budget_preference),
        preferred_types = COALESCE(preferred_types_array, user_preferences.preferred_types),
        preferred_period = COALESCE(preferred_period_pref, user_preferences.preferred_period),
        location_lat = COALESCE(location_lat, user_preferences.location_lat),
        location_lng = COALESCE(location_lng, user_preferences.location_lng),
        location_radius = COALESCE(location_radius, user_preferences.location_radius),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- REGISTRAR BUSCA NO HISTÓRICO
-- =========================================

CREATE OR REPLACE FUNCTION log_search(
    user_uuid UUID DEFAULT NULL,
    filters_data JSONB,
    results_count INTEGER DEFAULT 0,
    selected_place UUID DEFAULT NULL,
    user_lat DECIMAL DEFAULT NULL,
    user_lng DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO search_history (
        user_id, search_filters, results_count, selected_place_id,
        user_location_lat, user_location_lng
    ) VALUES (
        user_uuid, filters_data, results_count, selected_place,
        user_lat, user_lng
    );
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- CACHE DA API
-- =========================================

CREATE OR REPLACE FUNCTION get_cached_data(cache_key VARCHAR)
RETURNS JSONB AS $$
DECLARE
    cached_data JSONB;
BEGIN
    SELECT data INTO cached_data
    FROM api_cache
    WHERE cache_key = get_cached_data.cache_key
    AND expires_at > NOW();

    RETURN cached_data;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_cached_data(
    cache_key VARCHAR,
    data JSONB,
    ttl_seconds INTEGER DEFAULT 3600
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO api_cache (cache_key, data, expires_at)
    VALUES (cache_key, data, NOW() + INTERVAL '1 second' * ttl_seconds)
    ON CONFLICT (cache_key)
    DO UPDATE SET
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- DASHBOARD/ESTATÍSTICAS
-- =========================================

-- Estatísticas gerais do sistema
CREATE OR REPLACE VIEW system_stats AS
SELECT
    (SELECT COUNT(*) FROM places WHERE business_status = 'OPERATIONAL') as total_places,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM user_favorites) as total_favorites,
    (SELECT COUNT(*) FROM search_history WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as searches_last_30_days,
    (SELECT AVG(rating) FROM places WHERE rating > 0) as avg_rating,
    (SELECT COUNT(*) FROM api_cache WHERE expires_at > NOW()) as active_cache_entries;

-- Lugares mais populares (por favoritos)
CREATE OR REPLACE VIEW popular_places AS
SELECT
    p.id,
    p.name,
    p.address,
    p.rating,
    p.image_url,
    COUNT(uf.place_id) as favorite_count,
    array_agg(DISTINCT pt.name) as types
FROM places p
LEFT JOIN user_favorites uf ON p.id = uf.place_id
LEFT JOIN place_categories pc ON p.id = pc.place_id
LEFT JOIN place_types pt ON pc.type_id = pt.id
WHERE p.business_status = 'OPERATIONAL'
GROUP BY p.id
ORDER BY favorite_count DESC, p.rating DESC
LIMIT 50;

-- Atividade dos usuários nos últimos 30 dias
CREATE OR REPLACE VIEW user_activity_last_30_days AS
SELECT
    user_id,
    COUNT(*) as total_searches,
    COUNT(DISTINCT selected_place_id) as places_selected,
    MAX(created_at) as last_activity
FROM search_history
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_searches DESC;

-- =========================================
-- EXEMPLOS DE USO
-- =========================================

-- Exemplo 1: Buscar restaurantes próximos (até 3km) com orçamento moderado
-- SELECT * FROM search_places_nearby(-23.550520, -46.633308, 3000, '$$', 'gastronomia', NULL, 10);

-- Exemplo 2: Buscar lugares ao ar livre para o dia
-- SELECT * FROM search_places_nearby(-23.550520, -46.633308, 5000, NULL, 'ao-ar-livre', 'dia', 5);

-- Exemplo 3: Inserir lugar do Google Places
-- SELECT upsert_place_from_google(
--     'ChIJ1234567890abcdef',
--     'Restaurante Exemplo',
--     'Descrição do restaurante',
--     'Rua Exemplo, 123',
--     -23.550520, -46.633308,
--     '+5511999999999',
--     'https://exemplo.com',
--     'https://maps.google.com/...',
--     'https://exemplo.com/foto.jpg',
--     4.5, 2, 150, 'OPERATIONAL',
--     ARRAY['gastronomia', 'casual'],
--     '{"0": {"open": "08:00", "close": "18:00", "is_open": true}}'::jsonb,
--     '[{"photo_reference": "ref123", "width": 800, "height": 600, "is_main": true}]'::jsonb
-- );

-- Exemplo 4: Atualizar preferências do usuário
-- SELECT update_user_preferences(
--     'user-uuid-here',
--     '$$',
--     ARRAY['gastronomia', 'cultura'],
--     'noite',
--     -23.550520, -46.633308,
--     5000
-- );

-- =========================================
-- FIM DOS EXEMPLOS
-- =========================================