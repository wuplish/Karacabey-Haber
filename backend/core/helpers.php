<?php

// Global rate limit storage
$rate_limits = [];

/**
 * Checks if the provided username and password match the admin credentials.
 */
function is_admin($username, $password) {
    return $username === "karacabeyhaber@admin.panel" &&
           $password === "karacabeyhaber@admin.user.haber@latest";
}

/**
 * Creates a URL-friendly slug from a given title.
 */
function create_slug($title) {
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return $slug;
}

/**
 * Retrieves a unique user ID, preferring a custom header or falling back to the remote IP.
 */
function get_user_id() {
    $headers = getallheaders();
    return $headers['gelmisgecmiseniyiuserid'] ?? $_SERVER['REMOTE_ADDR'];
}

/**
 * Loads JSON data from a file, creating it with default content if it doesn't exist.
 */
function load_json_file($path, $default = []) {
    if (!file_exists($path)) {
        // Ensure the directory exists before creating the file
        $dirname = dirname($path);
        if (!is_dir($dirname)) {
            mkdir($dirname, 0777, true);
        }
        file_put_contents($path, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $default;
    }
    return json_decode(file_get_contents($path), true);
}

/**
 * Saves data to a JSON file with pretty printing and Unicode support.
 */
function save_json_file($path, $data) {
    // Ensure the directory exists before creating the file
    $dirname = dirname($path);
    if (!is_dir($dirname)) {
        mkdir($dirname, 0777, true);
    }
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

/**
 * Implements a simple rate limiting mechanism.
 */
function check_rate_limit($key, $limit, $period) {
    global $rate_limits;

    $now = time();
    if (!isset($rate_limits[$key])) {
        $rate_limits[$key] = [
            'count' => 1,
            'start' => $now
        ];
        return true;
    }

    $elapsed = $now - $rate_limits[$key]['start'];
    if ($elapsed > $period) {
        $rate_limits[$key] = [
            'count' => 1,
            'start' => $now
        ];
        return true;
    }

    if ($rate_limits[$key]['count'] >= $limit) {
        return false;
    }

    $rate_limits[$key]['count']++;
    return true;
}

/**
 * Fetches location (latitude, longitude, city) from an IP address using ip-api.com.
 */
function get_location_from_ip($ip) {
    try {
        $res = file_get_contents("http://ip-api.com/json/$ip");
        $data = json_decode($res, true);
        if ($data['status'] === 'success') {
            return [$data['lat'], $data['lon'], $data['city']];
        }
    } catch (Exception $e) {
        error_log("IP location error: " . $e->getMessage());
    }
    return null;
}

/**
 * Fetches current weather data from Open-Meteo.
 */
function get_weather($lat, $lon) {
    try {
        $url = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current_weather=true&timezone=auto";
        $res = file_get_contents($url);
        $data = json_decode($res, true);
        return $data['current_weather'] ?? null;
    } catch (Exception $e) {
        error_log("Weather API error: " . $e->getMessage());
        return null;
    }
}

/**
 * Fetches the latest currency exchange data from TCMB (Central Bank of the Republic of Turkey).
 */
function fetch_latest_currency_data() {
    // In a real application, keep API keys outside of version control, e.g., in environment variables.
    // For demonstration, it's hardcoded here.
    $api_key = "FM6HagN5eL";

    // Try to fetch data for the last 7 days to account for weekends/holidays
    for ($i = 0; $i < 7; $i++) {
        $date = date('d-m-Y', strtotime("-$i days"));
        $url = "https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.GBP.A&startDate=$date&endDate=$date&type=json&limit=1&sort=desc";

        $options = [
            'http' => [
                'header' => "key: $api_key\r\n"
            ]
        ];

        $context = stream_context_create($options);
        $res = @file_get_contents($url, false, $context); // Using @ to suppress warnings for failed requests

        if ($res) {
            $data = json_decode($res, true);
            $items = $data['items'] ?? [];

            // Check if essential currency data exists for the current date
            if (!empty($items) && (isset($items[0]['TP_DK_USD_A']) || isset($items[0]['TP_DK_EUR_A']) || isset($items[0]['TP_DK_GBP_A']))) {
                return [
                    'tarih' => $items[0]['Tarih'] ?? null,
                    'usd' => $items[0]['TP_DK_USD_A'] ?? null,
                    'euro' => $items[0]['TP_DK_EUR_A'] ?? null,
                    'gbp' => $items[0]['TP_DK_GBP_A'] ?? null
                ];
            }
        }
    }

    return [
        'tarih' => null,
        'usd' => null,
        'euro' => null,
        'gbp' => null
    ];
}
?>