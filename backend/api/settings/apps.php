<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleAppsSettings($method, $request_data) {
    $filePath = __DIR__ . '/../../data/url.json';
    if ($method === 'GET') {
        $settings = load_json_file($filePath, ['nothing' => []]);
        echo json_encode($settings);
    } elseif ($method === 'POST') {
        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        save_json_file($filePath, $request_data);
        echo json_encode(['message' => 'Apps ayarları başarıyla kaydedildi']);
    } else {
        http_response_code(405);
        echo json_encode(['detail' => 'Method not allowed']);
    }
}
?>