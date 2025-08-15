-- 새로운 마니또 설정 SQL
-- 이름 리스트를 바탕으로 방, 사용자, 마니또 매칭을 자동 생성합니다.

-- =============================================
-- 🎯 설정 섹션 - 여기만 수정하세요!
-- =============================================

-- 1. 방 정보 설정
DO $$
DECLARE
    -- 방 설정
    room_name TEXT := '2024 겨울 마니또';
    room_description TEXT := '경기대 SGB 마니또 이벤트';
    room_code TEXT := 'SGB24W';
    
    -- 참가자 이름 리스트 (여기에 실제 이름들을 넣으세요)
    participant_names TEXT[] := ARRAY[
        '김철수',
        '이영희', 
        '박민수',
        '정하나',
        '최영준',
        '한지민'
    ];
    
    -- 변수 선언
    room_id UUID;
    user_ids UUID[];
    user_codes TEXT[];
    current_user_id UUID;
    current_user_code TEXT;
    receiver_index INTEGER;
    i INTEGER;
    total_participants INTEGER;
BEGIN
    -- =============================================
    -- 🏠 1. 방 생성
    -- =============================================
    INSERT INTO rooms (room_code, name, description, is_active)
    VALUES (room_code, room_name, room_description, true)
    RETURNING id INTO room_id;
    
    RAISE NOTICE '방 생성 완료: % (ID: %)', room_name, room_id;
    
    -- =============================================
    -- 👥 2. 사용자 생성 및 코드 생성
    -- =============================================
    total_participants := array_length(participant_names, 1);
    user_ids := ARRAY[]::UUID[];
    user_codes := ARRAY[]::TEXT[];
    
    -- 각 참가자에 대해 사용자 생성
    FOR i IN 1..total_participants LOOP
        -- 6자리 랜덤 코드 생성 (숫자+영문 대문자)
        current_user_code := UPPER(
            CHR(65 + floor(random() * 26)::int) ||  -- A-Z
            CHR(65 + floor(random() * 26)::int) ||  -- A-Z
            CHR(65 + floor(random() * 26)::int) ||  -- A-Z
            floor(random() * 10)::text ||           -- 0-9
            floor(random() * 10)::text ||           -- 0-9
            floor(random() * 10)::text              -- 0-9
        );
        
        -- 중복 코드 체크 및 재생성
        WHILE EXISTS (SELECT 1 FROM users WHERE user_code = current_user_code) LOOP
            current_user_code := UPPER(
                CHR(65 + floor(random() * 26)::int) ||
                CHR(65 + floor(random() * 26)::int) ||
                CHR(65 + floor(random() * 26)::int) ||
                floor(random() * 10)::text ||
                floor(random() * 10)::text ||
                floor(random() * 10)::text
            );
        END LOOP;
        
        -- 사용자 생성
        INSERT INTO users (room_id, user_code, nickname, is_active)
        VALUES (room_id, current_user_code, participant_names[i], true)
        RETURNING id INTO current_user_id;
        
        -- 배열에 추가
        user_ids := array_append(user_ids, current_user_id);
        user_codes := array_append(user_codes, current_user_code);
        
        RAISE NOTICE '사용자 생성: % -> 코드: %', participant_names[i], current_user_code;
    END LOOP;
    
    -- =============================================
    -- 🎁 3. 마니또 매칭 (원형 배치)
    -- =============================================
    
    -- 사용자 배열을 랜덤하게 섞기
    FOR i IN 1..total_participants LOOP
        DECLARE
            random_index INTEGER;
            temp_id UUID;
        BEGIN
            random_index := 1 + floor(random() * total_participants)::int;
            temp_id := user_ids[i];
            user_ids[i] := user_ids[random_index];
            user_ids[random_index] := temp_id;
        END;
    END LOOP;
    
    -- 원형으로 마니또 매칭 (A->B->C->A)
    FOR i IN 1..total_participants LOOP
        receiver_index := CASE 
            WHEN i = total_participants THEN 1 
            ELSE i + 1 
        END;
        
        INSERT INTO manitto_pairs (room_id, giver_id, receiver_id)
        VALUES (room_id, user_ids[i], user_ids[receiver_index]);
    END LOOP;
    
    RAISE NOTICE '마니또 매칭 완료! (총 %쌍)', total_participants;
    
    -- =============================================
    -- 📋 4. 결과 출력
    -- =============================================
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE '마니또 설정 완료!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '방 이름: %', room_name;
    RAISE NOTICE '방 코드: %', room_code;
    RAISE NOTICE '참가자 수: %명', total_participants;
    RAISE NOTICE '==========================================';
    
END $$;

-- =============================================
-- 📊 5. 생성된 데이터 확인
-- =============================================

-- 생성된 방 정보
SELECT 
    '방 정보' as category,
    r.room_code as "방 코드",
    r.name as "방 이름", 
    r.description as "설명",
    (SELECT COUNT(*) FROM users WHERE room_id = r.id) as "참가자 수"
FROM rooms r
WHERE r.is_active = true
ORDER BY r.created_at DESC
LIMIT 1;

-- 생성된 사용자 목록
SELECT 
    '참가자 목록' as category,
    u.nickname as "이름",
    u.user_code as "개인 코드",
    CASE WHEN u.is_active THEN '활성' ELSE '비활성' END as "상태"
FROM users u
JOIN rooms r ON u.room_id = r.id
WHERE r.is_active = true 
ORDER BY u.created_at;

-- -- 마니또 매칭 확인
-- SELECT 
--     '마니또 매칭' as category,
--     giver.nickname as "선물 주는 사람",
--     receiver.nickname as "선물 받는 사람",
--     '→' as "방향"
-- FROM manitto_pairs mp
-- JOIN users giver ON mp.giver_id = giver.id
-- JOIN users receiver ON mp.receiver_id = receiver.id
-- JOIN rooms r ON mp.room_id = r.id
-- WHERE r.is_active = true
-- ORDER BY giver.nickname;

-- =============================================
-- 🔧 추가 유틸리티 쿼리
-- =============================================

-- 특정 사용자의 마니또 대상 확인
/*
SELECT 
    u.nickname as "내 이름",
    target.nickname as "내 마니또 대상"
FROM users u
JOIN manitto_pairs mp ON u.id = mp.giver_id
JOIN users target ON mp.receiver_id = target.id
WHERE u.user_code = 'ABC123';  -- 여기에 확인하고 싶은 사용자 코드 입력
*/

-- 모든 개인 코드 목록 출력 (참가자들에게 전달용)

SELECT 
    nickname as "이름",
    user_code as "개인 코드",
    '이 코드로 로그인하세요!' as "안내"
FROM users u
JOIN rooms r ON u.room_id = r.id
WHERE r.is_active = true
ORDER BY nickname;
