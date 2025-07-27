<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleLogoTextSettings($method, $request_data) {
    $filePath = __DIR__ . '/../../data/logo_settings.json';
    $defaultSettings = [
        'logo_line1' => 'KARACABEY',
        'logo_line2' => 'HABER',
        'logo_line1_color' => '#e63946',
        'logo_line2_color' => '#222222'
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
            'logo_line1' => $request_data['logo_line1'] ?? $current['logo_line1'],
            'logo_line2' => $request_data['logo_line2'] ?? $current['logo_line2'],
            'logo_line1_color' => $request_data['logo_line1_color'] ?? $current['logo_line1_color'],
            'logo_line2_color' => $request_data['logo_line2_color'] ?? $current['logo_line2_color'],
        ];

        save_json_file($filePath, $updated);
        echo json_encode($updated);
    } else {
        http_response_code(405);
        echo json_encode(['detail' => 'Method not allowed']);
    }
}
?>