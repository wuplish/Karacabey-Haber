<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleFooterSettings($method, $request_data) {
    $filePath = __DIR__ . '/../../data/footer_settings.json';
    if ($method === 'GET') {
        $settings = load_json_file($filePath, ['links' => [], 'plans' => []]);
        echo json_encode($settings);
    } elseif ($method === 'POST') {
        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        save_json_file($filePath, $request_data);
        echo json_encode(['message' => 'Footer ayarları başarıyla kaydedildi']);
    } else {
        http_response_code(405);
        echo json_encode(['detail' => 'Method not allowed']);
    }
}
?>