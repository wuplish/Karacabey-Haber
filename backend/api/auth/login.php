<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleLogin($request_data) {
    if (!check_rate_limit(get_user_id(), 1, 5)) {
        http_response_code(429);
        echo json_encode(['detail' => 'Çok fazla istek, lütfen sonra tekrar deneyin.']);
        return;
    }

    if (is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['detail' => 'Unauthorized']);
    }
}
?>