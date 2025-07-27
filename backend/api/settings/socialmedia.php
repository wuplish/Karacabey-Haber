<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleSocialMediaSettings($method, $request_data) {
    $filePath = __DIR__ . '/../../data/socialmedia.json';
    $defaultSettings = [
        'facebook' => '',
        'instagram' => '',
        'twitter' => ''
    ];

    if ($method === 'GET') {
        $settings = load_json_file($filePath, $defaultSettings);
        echo json_encode($settings);
    } elseif ($method === 'POST') {
        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        $current = load_json_file($filePath, $defaultSettings);

        $updated = [
            'facebook' => $request_data['facebook'] ?? $current['facebook'],
            'instagram' => $request_data['instagram'] ?? $current['instagram'],
            'twitter' => $request_data['twitter'] ?? $current['twitter']
        ];

        save_json_file($filePath, $updated);
        echo json_encode($updated);
    } else {
        http_response_code(405);
        echo json_encode(['detail' => 'Method not allowed']);
    }
}
?>