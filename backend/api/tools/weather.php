<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleWeatherAPI($ip) {
    $lat_lon = get_location_from_ip($ip);

    if (!$lat_lon) {
        http_response_code(404);
        echo json_encode(['detail' => 'Konum alınamadı']);
        return;
    }

    list($lat, $lon, $city) = $lat_lon;
    $weather = get_weather($lat, $lon);

    if (!$weather) {
        http_response_code(404);
        echo json_encode(['detail' => 'Hava durumu alınamadı']);
        return;
    }

    echo json_encode([
        'sehir' => $city,
        'sicaklik' => $weather['temperature'],
        'ruzgar' => $weather['windspeed'],
        'zaman' => $weather['time']
    ]);
}
?>