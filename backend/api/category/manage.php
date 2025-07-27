<?php
require_once __DIR__ . '/../../core/helpers.php';

function handleManageCategory($method, $request_data, $category_name = null) {
    if ($method === 'POST') {
        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        $categories = load_json_file('categories.json', []);
        $path = $request_data['path'] ?? '/' . create_slug($request_data['name']);

        foreach ($categories as $cat) {
            if ($cat['path'] === $path) {
                http_response_code(400);
                echo json_encode(['detail' => 'Bu path zaten kullanılıyor.']);
                return;
            }
        }

        if (($request_data['header'] ?? false)) {
            $header_count = 0;
            foreach ($categories as $cat) {
                if ($cat['header'] ?? false) {
                    $header_count++;
                }
            }
            if ($header_count >= 4) {
                http_response_code(400);
                echo json_encode(['detail' => 'En fazla 4 tane header kategorisi olabilir.']);
                return;
            }
        }

        $new_cat = [
            'name' => $request_data['name'],
            'path' => $path,
            'description' => $request_data['description'] ?? '',
            'order' => $request_data['order'] ?? 0,
            'header' => $request_data['header'] ?? false
        ];

        $categories[] = $new_cat;
        save_json_file('categories.json', $categories);

        echo json_encode(['message' => 'Kategori oluşturuldu', 'category' => $new_cat]);

    } elseif ($method === 'DELETE' && $category_name) {
        if (!is_admin($request_data['username'] ?? '', $request_data['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['detail' => 'Unauthorized']);
            return;
        }

        $categories = load_json_file('categories.json', []);
        $filtered = array_filter($categories, function($cat) use ($category_name) {
            return $cat['name'] !== $category_name;
        });

        if (count($filtered) === count($categories)) {
            http_response_code(404);
            echo json_encode(['detail' => 'Kategori bulunamadı.']);
            return;
        }

        save_json_file('categories.json', array_values($filtered));
        echo json_encode(['message' => "$category_name kategorisi silindi."]);
    } else {
        http_response_code(405);
        echo json_encode(['detail' => 'Method not allowed']);
    }
}
?>